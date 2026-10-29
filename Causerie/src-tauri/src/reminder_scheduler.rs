use std::{
    fs,
    path::{Path, PathBuf},
    process::{Command, Output},
};

use sha2::{Digest, Sha256};

fn output(program: &str, args: &[&str]) -> Result<Output, String> {
    let mut command = Command::new(program);
    command.args(args);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    command
        .output()
        .map_err(|error| format!("Could not run {program}: {error}"))
}

fn run(program: &str, args: &[&str]) -> Result<(), String> {
    let result = output(program, args)?;

    if result.status.success() {
        return Ok(());
    }

    Err(format!(
        "{program} failed: {}",
        String::from_utf8_lossy(&result.stderr).trim(),
    ))
}

fn path_text(path: &Path) -> Result<&str, String> {
    let value = path
        .to_str()
        .ok_or("The application path is not valid Unicode.")?;

    if value.chars().any(char::is_control) {
        return Err("The application path contains unsupported characters.".into());
    }

    Ok(value)
}

fn task_id(db: &Path) -> Result<String, String> {
    let digest = format!("{:x}", Sha256::digest(path_text(db)?.as_bytes()));
    Ok(format!("com.anabelle.causerie.reminder.{}", &digest[..16]))
}

fn application_executable() -> Result<PathBuf, String> {
    // AppImage's current_exe points into a temporary mount
    #[cfg(target_os = "linux")]
    if let Some(path) = std::env::var_os("APPIMAGE") {
        let path = PathBuf::from(path);

        if path.is_absolute() && path.is_file() {
            return Ok(path);
        }
    }

    std::env::current_exe().map_err(|error| error.to_string())
}

fn remove_if_present(path: &Path) -> Result<(), String> {
    match fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error.to_string()),
    }
}

#[cfg(any(target_os = "windows", target_os = "macos"))]
fn xml(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

// Some("19:00") installs/updates.. none removes registration
pub(crate) fn apply(db: &Path, at_time: Option<&str>) -> Result<(), String> {
    let id = task_id(db)?;
    let executable = application_executable()?;

    platform_apply(db, &executable, &id, at_time)
}

#[cfg(target_os = "linux")]
fn platform_apply(
    db: &Path,
    executable: &Path,
    id: &str,
    at_time: Option<&str>,
) -> Result<(), String> {
    let directory = dirs::config_dir()
        .ok_or("Unable to locate the user configuration directory.")?
        .join("systemd/user");

    let service_name = format!("{id}.service");
    let timer_name = format!("{id}.timer");
    let service = directory.join(&service_name);
    let timer = directory.join(&timer_name);

    if at_time.is_none() {
        if !service.exists() && !timer.exists() {
            return Ok(());
        }

        run("systemctl", &["--user", "daemon-reload"])?;

        if timer.exists() {
            run(
                "systemctl",
                &["--user", "disable", "--now", &timer_name],
            )?;
        }

        if service.exists() {
            run("systemctl", &["--user", "stop", &service_name])?;
        }

        remove_if_present(&timer)?;
        remove_if_present(&service)?;
        return run("systemctl", &["--user", "daemon-reload"]);
    }

    fn quote(value: &str) -> String {
        format!(
            "\"{}\"",
            value
                .replace('\\', "\\\\")
                .replace('"', "\\\"")
                .replace('%', "%%")
                .replace('$', "$$")
        )
    }

    let time = at_time.unwrap();
    fs::create_dir_all(&directory).map_err(|error| error.to_string())?;

    fs::write(
        &service,
        format!(
            "[Unit]\n\
             Description=Causerie practice reminder\n\
             \n\
             [Service]\n\
             Type=oneshot\n\
             Environment=DBUS_SESSION_BUS_ADDRESS=unix:path=%t/bus\n\
             ExecStart={} --reminder-check {}\n\
             TimeoutStartSec=60\n",
            quote(path_text(executable)?),
            quote(path_text(db)?),
        ),
    )
        .map_err(|error| error.to_string())?;

    fs::write(
        &timer,
        format!(
            "[Unit]\n\
             Description=Causerie practice reminder schedule\n\
             \n\
             [Timer]\n\
             OnCalendar=*-*-* {time}:00\n\
             AccuracySec=1s\n\
             Persistent=false\n\
             Unit={service_name}\n\
             \n\
             [Install]\n\
             WantedBy=timers.target\n"
        ),
    )
        .map_err(|error| error.to_string())?;

    run("systemctl", &["--user", "daemon-reload"])?;
    run("systemctl", &["--user", "enable", &timer_name])?;
    run("systemctl", &["--user", "restart", &timer_name])
}

#[cfg(target_os = "macos")]
fn platform_apply(
    db: &Path,
    executable: &Path,
    id: &str,
    at_time: Option<&str>,
) -> Result<(), String> {
    let directory = dirs::home_dir()
        .ok_or("Unable to locate your home directory.")?
        .join("Library/LaunchAgents");

    let file = directory.join(format!("{id}.plist"));

    let uid_output = output("/usr/bin/id", &["-u"])?;
    if !uid_output.status.success() {
        return Err("Unable to determine the current user.".into());
    }

    let uid = String::from_utf8_lossy(&uid_output.stdout)
        .trim()
        .to_owned();

    let domain = format!("gui/{uid}");
    let target = format!("{domain}/{id}");

    if output("/bin/launchctl", &["print", &target])?
        .status
        .success()
    {
        run("/bin/launchctl", &["bootout", &target])?;
    }

    let Some(time) = at_time else {
        return remove_if_present(&file);
    };

    let (hour, minute) = time
        .split_once(':')
        .ok_or("Invalid reminder time.")?;

    let hour: u32 = hour.parse().map_err(|_| "Invalid reminder hour.")?;
    let minute: u32 = minute.parse().map_err(|_| "Invalid reminder minute.")?;

    fs::create_dir_all(&directory).map_err(|error| error.to_string())?;

    fs::write(
        &file,
        format!(
            r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
 "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key><string>{id}</string>
    <key>ProgramArguments</key>
    <array>
        <string>{}</string>
        <string>--reminder-check</string>
        <string>{}</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key><integer>{hour}</integer>
        <key>Minute</key><integer>{minute}</integer>
    </dict>
    <key>ProcessType</key><string>Background</string>
    <key>RunAtLoad</key><false/>
</dict>
</plist>
"#,
            xml(path_text(executable)?),
            xml(path_text(db)?),
        ),
    )
        .map_err(|error| error.to_string())?;

    run(
        "/bin/launchctl",
        &["bootstrap", &domain, path_text(&file)?],
    )
}

#[cfg(target_os = "windows")]
fn platform_apply(
    db: &Path,
    executable: &Path,
    id: &str,
    at_time: Option<&str>,
) -> Result<(), String> {
    let Some(time) = at_time else {
        // id is generated from a fixed prefix and hexadecimal digest.
        let script = format!(
            "$ErrorActionPreference='Stop'; \
             $tasks=Get-ScheduledTask -TaskPath '\\' | \
             Where-Object {{ $_.TaskName -eq '{id}' }}; \
             if ($tasks) {{ \
                 $tasks | Unregister-ScheduledTask -Confirm:$false \
             }}"
        );

        return run(
            "powershell.exe",
            &["-NoProfile", "-NonInteractive", "-Command", &script],
        );
    };

    let identity = output(
        "powershell.exe",
        &[
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "([System.Security.Principal.WindowsIdentity]::GetCurrent()).User.Value",
        ],
    )?;

    if !identity.status.success() {
        return Err("Unable to determine the current Windows user.".into());
    }

    let sid = String::from_utf8_lossy(&identity.stdout)
        .trim()
        .to_owned();

    let db_text = path_text(db)?;
    if db_text.contains('"') {
        return Err("Unsupported quote in the database path.".into());
    }

    let arguments = format!("--reminder-check \"{db_text}\"");
    let start = chrono::Local::now().format("%Y-%m-%d").to_string();

    let file = db.with_extension("reminder-task.xml");

    fs::write(
        &file,
        format!(
            r#"<?xml version="1.0" encoding="UTF-8"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>{start}T{time}:00</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByDay><DaysInterval>1</DaysInterval></ScheduleByDay>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <UserId>{}</UserId>
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <StartWhenAvailable>false</StartWhenAvailable>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>true</Hidden>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT1M</ExecutionTimeLimit>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>{}</Command>
      <Arguments>{}</Arguments>
    </Exec>
  </Actions>
</Task>
"#,
            xml(&sid),
            xml(path_text(executable)?),
            xml(&arguments),
        ),
    )
        .map_err(|error| error.to_string())?;

    let result = run(
        "schtasks.exe",
        &["/Create", "/TN", id, "/XML", path_text(&file)?, "/F"],
    );

    let _ = remove_if_present(&file);
    result
}

#[cfg(not(any(
    target_os = "linux",
    target_os = "macos",
    target_os = "windows"
)))]
fn platform_apply(
    _db: &Path,
    _executable: &Path,
    _id: &str,
    _at_time: Option<&str>,
) -> Result<(), String> {
    Err("Practice reminders are currently supported on desktop only.".into())
}