use std::{fs::{self, OpenOptions}, io::{self, Write}, path::{Path, PathBuf}, };

use tauri::{AppHandle, Manager};

const MARKER_NAME: &str = ".factory-reset-pending";
const MARKER_CONTENT: &[u8] = b"causerie-reset-v1";

fn marker_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map(|directory| directory.join(MARKER_NAME))
        .map_err(|_| "Unable to locate application configuration.".to_string())
}

// Delete directory contents without following directory symlinks. Preserve reset marker until every cleanup step succeeds.
fn clear_directory(directory: &Path, marker: &Path, ) -> io::Result<()> {
    let metadata = match fs::symlink_metadata(directory) {
        Ok(metadata) => metadata,
        Err(error) if error.kind() == io::ErrorKind::NotFound => { return Ok(()); }
        Err(error) => return Err(error),
    };

    if metadata.file_type().is_symlink() || !metadata.is_dir() {
        return Err(io::Error::other("An application storage directory is not a regular directory.", ));
    }

    for entry in fs::read_dir(directory)? {
        let path = entry?.path();

        if path == marker { continue; }

        let metadata = fs::symlink_metadata(&path)?;

        if metadata.is_dir() && !metadata.file_type().is_symlink() {
            if marker.starts_with(&path) {
                clear_directory(&path, marker)?;
            } else {
                fs::remove_dir_all(&path)?;
            }
        } else {
            // Removes the entry itself, not a symlink's target.
            fs::remove_file(&path)?;
        }
    }

    Ok(())
}


// CALL ONLY DURING SET-UP BEFORE SQL/LOGGING PLUGINS OR WEBVIEWS ARE INITIALIZED.
pub fn finish_pending_reset(app: &AppHandle) -> Result<(), String> {
    let marker = marker_path(app)?;

    if !marker.try_exists().map_err(|_| {
        "Unable to inspect the reset marker.".to_string()
    })? {
        return Ok(());
    }

    let content = fs::read(&marker)
        .map_err(|_| "Unable to read the reset marker.".to_string())?;

    if content != MARKER_CONTENT {
        return Err("The reset marker is invalid.".to_string());
    }

    // Failure leaves the marker in place for the next launch.
    crate::credentials::delete_unlock_keys_for_reset()?;

    let paths = app.path();

    let directories = [
        paths.app_config_dir(),
        paths.app_data_dir(),
        paths.app_local_data_dir(),
        paths.app_cache_dir(),
        paths.app_log_dir(),
    ];

    for directory in directories {
        let directory = directory
            .map_err(|_| "Unable to locate application storage.".to_string())?;

        clear_directory(&directory, &marker).map_err(|error| {
            format!(
                "Reset could not clear {}: {error}",
                directory.display(),
            )
        })?;
    }

    // Delete last: its presence means reset must resume next launch.
    fs::remove_file(&marker)
        .map_err(|_| "Unable to finalize application reset.".to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn reset_application(app: AppHandle,
                               databases: tauri::State<'_, tauri_plugin_sql::DbInstances>,
                               confirmation: String, ) -> Result<(), String> {
    if confirmation != "RESET" {
        return Err("Type RESET to confirm.".to_string());
    }

    let pool = crate::database::pool(databases.inner())
        .await
        .map_err(|error| error.message)?;

    crate::reminders::disable_for_reset(&pool).await?;

    let marker = marker_path(&app)?;

    let parent = marker.parent()
        .ok_or_else(|| "Invalid reset marker location.".to_string())?;

    fs::create_dir_all(parent)
        .map_err(|_| "Unable to prepare application reset.".to_string())?;

    let mut file = OpenOptions::new()
        .create(true)
        .truncate(true)
        .write(true)
        .open(&marker)
        .map_err(|_| "Unable to record application reset.".to_string())?;

    file.write_all(MARKER_CONTENT)
        .map_err(|_| "Unable to write the reset marker.".to_string())?;

    file.sync_all()
        .map_err(|_| "Unable to persist the reset request.".to_string())?;

    drop(file);

    // Also request cleanup of browser-managed data.
    for window in app.webview_windows().values() {
        window.clear_all_browsing_data()
            .map_err(|_| {
                "Reset is pending, but browser-data cleanup failed. \
                 Restart the application to continue."
                    .to_string()
            })?;
    }

    // built-in Tauri reset lifecycle https://docs.rs/tauri/latest/tauri/struct.AppHandle.html#method.restart
    app.restart();
}
