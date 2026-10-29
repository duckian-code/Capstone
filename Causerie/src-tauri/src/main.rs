// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    if let Some(code) = causerie_lib::handle_reminder_cli() {
        std::process::exit(code);
    }
    causerie_lib::run()
}
