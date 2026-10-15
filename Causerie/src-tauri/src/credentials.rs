use std::{
    fs::OpenOptions,
    path::PathBuf
};
use std::path::Path;
use fs2::FileExt;
use keyring::{Entry, Error as KeyringError};
use tauri::{Manager, State};
use tauri_plugin_stronghold::stronghold::Stronghold;
use zeroize::Zeroizing;

const KEYRING_SERVICE: &str = "com.anabelle.causerie.credentials";
const KEYRING_ACCOUNT: &str = "causerie";

const CLIENT_NAME: &[u8] = b"application";
const API_KEY_RECORD: &[u8] = b"openai_api_key";

#[derive(Clone)]
pub struct CredentialStore {
    snapshot_path: PathBuf
}

impl CredentialStore {
    pub fn new (data_dir: PathBuf) -> Self {
        Self {
            snapshot_path: data_dir.join("credentials-os-v1.hold")
        }
    }

    fn unlock_key(
        &self,
        snapshot_exists: bool,
    ) -> Result<Zeroizing<Vec<u8>>, String> {
        let entry = Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT)
            .map_err(|_| "Unable to access OS credential store!".to_string())?;

        match entry.get_secret() {
            Ok(secret) => {
                let secret = Zeroizing::new(secret);

                if secret.len() != 32 {
                    return Err("The stored Stronghold unlock key is invalid!".to_string());
                }

                Ok(secret)
            }

            Err(KeyringError::NoEntry) if !snapshot_exists => {
                let mut secret = Zeroizing::new(vec![0_u8; 32]);

                getrandom::getrandom(secret.as_mut_slice())
                    .map_err(|_| "Unable to generate an encryption key!".to_string())?;

                entry.set_secret(secret.as_slice()).map_err(|_| { "Unable to save the unlock key. Unlock or configure your OS credential store.".to_string() })?;

                // verify backend can read saved key
                let stored = Zeroizing::new(
                    entry.get_secret().map_err(|_| { "Unable to read back saved unlock key!".to_string() })?
                );

                if stored.as_slice() != secret.as_slice() {
                    return Err("OS credential-store verification failed!".to_string());
                }

                Ok(secret)
            }

            Err(KeyringError::NoEntry) => Err(
                "Stronghold file exists, but OS unlock key is missing! Restore credentials before continuing".to_string()
            ),
            Err (_) => Err(
                "OS credential store is unavaialble or locked.".to_string()
            )
        }
    }

    // Snapshot access is serialized across app processes. Missing snapshot is created only for an explicit write.
    fn access<T>(
        &self,
        create: bool,
        operation: impl FnOnce(&Stronghold) -> Result<T, String>
    ) -> Result<Option<T>, String> {
        let lock_path = self.snapshot_path.with_extension("lock");

        let lock_file = OpenOptions::new()
            .create(true)
            .truncate(false)
            .read(true)
            .write(true)
            .open(lock_path)
            .map_err(|_| "Unable to open the credential storage.".to_string())?;

        FileExt::lock_exclusive(&lock_file)
            .map_err(|_| "Unable to lock the credential storage.".to_string())?;

        let exists = self.snapshot_path.try_exists()
            .map_err(|_| "Unable to inspect credential storage.".to_string())?;

        if !exists && !create {
            return Ok(None);
        }

        let unlock_key = self.unlock_key(exists)?;

        let stronghold = Stronghold::new(
            &self.snapshot_path,
            unlock_key.to_vec()
        ).map_err(|_| { "Unable to unlock Stronghold. Its file may be damaged or may not match the OS credentials.".to_string()})?;

        if exists {
            // Prevent corruption/missing client misinterpretation as first run
            stronghold.load_client(CLIENT_NAME)
                .map_err(|_| "Unable to load the Stronghold client.".to_string())?;
        } else {
            stronghold.create_client(CLIENT_NAME)
                .map_err(|_| "Unable to create the Stronghold client.".to_string())?;
        }

        operation(&stronghold).map(Some)
    }

    pub fn save_api_key(&self, api_key: &str) -> Result<(), String> {
        let api_key = api_key.trim();

        if api_key.is_empty()
            || api_key.len() > 8192
            || !api_key.is_ascii()
            || api_key.chars().any(char::is_whitespace) {
            return Err("Enter a nonempty API key without spaces!".to_string());
        }

        self.access(true, |stronghold| {
            let client = stronghold.get_client(CLIENT_NAME)
                .map_err(|_| "Unable to access the Stronghold client.".to_string())?;

            client.store()
                .insert(API_KEY_RECORD.to_vec(), api_key.as_bytes().to_vec(), None)
                    .map_err(|_| "Unable to store the API key.".to_string())?;

            stronghold.save()
                .map_err(|_| "Unable to save the Stronghold snapshot.".to_string())?;

            Ok(())
        })?;

        Ok(())
    }

    pub fn read_api_key(&self) -> Result<Option<Zeroizing<String>>, String> {
        let result = self.access(false, |stronghold| {
            let client = stronghold.get_client(CLIENT_NAME)
                .map_err(|_| "Unable to access the Stronghold client.".to_string())?;

            let bytes = client.store()
                .get(API_KEY_RECORD)
                .map_err(|_| "Unable to read the stored API key.".to_string())?;

            let Some(bytes) = bytes else {
                return Ok(None);
            };

            let bytes = Zeroizing::new(bytes);

            let text = std::str::from_utf8(bytes.as_slice())
                .map_err(|_| "Stored API key is invalid.".to_string())?;

            Ok(Some(Zeroizing::new(text.to_owned())))
        })?;

        Ok(result.flatten())
    }
}

#[tauri::command]
pub async fn save_openai_api_key(
    state: State<'_, CredentialStore>,
    api_key: String,
) -> Result<(), String> {
    let store = state.inner().clone();
    let api_key = Zeroizing::new(api_key);

    tauri::async_runtime::spawn_blocking(move || {
        store.save_api_key(api_key.as_str())?;

        // reopen and verify persisted value in snapshot
        let saved = store.read_api_key()?
            .ok_or_else(|| "Saved API key was not found.".to_string())?;

        if saved.as_str() != api_key.trim() {
            return Err("API key storage verification failed!".to_string());
        }

        Ok(())
    }).await.map_err(|_| "Credential storage operation failed!".to_string())?
}

#[tauri::command]
pub async fn has_openai_api_key(state: State<'_, CredentialStore>) -> Result<bool, String> {
    let store = state.inner().clone();

    tauri::async_runtime::spawn_blocking(move || {
        Ok(store.read_api_key()?.is_some())
    }).await.map_err(|_| "Credential storage operation failed!".to_string())?
}

// internal rust resolver
pub async fn resolve_api_key(app: tauri::AppHandle) -> Result<Zeroizing<String>, String> {
    let store = app.state::<CredentialStore>().inner().clone();

    tauri::async_runtime::spawn_blocking(move || {
        store.read_api_key()?.ok_or_else(|| "No API key configured. Complete onboarding.".to_string())
    }).await.map_err(|_| "Credential storage operation failed!".to_string())?
}