//! DNS Switcher — هسته‌ی Rust جایگزین Electron
//!
//! رابط کاربری همان `renderer/` قبلی است و فقط لایه‌ی پل (`tauri-bridge.js`) عوض شده.

pub mod commands;
pub mod dns_service;
pub mod store;

use std::path::PathBuf;

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

/// پوشه‌ی اختیاری کیت‌های اولیه کنار فایل اجرایی
const PACKAGED_SEED_DIR: &str = "dns-switcher-seed";

/// محل خواندن فایل‌های `.bat` کاربر: کنار exe، و در حالت توسعه ریشه‌ی پروژه
fn seed_dir() -> PathBuf {
    if let Some(dir) = std::env::current_exe()
        .ok()
        .and_then(|exe| exe.parent().map(|parent| parent.join(PACKAGED_SEED_DIR)))
    {
        if dir.is_dir() {
            return dir;
        }
    }
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..")
}

fn create_main_window(app: &tauri::App) -> tauri::Result<()> {
    WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
        .title("DNS Switcher")
        .inner_size(1040.0, 720.0)
        .min_inner_size(900.0, 620.0)
        .center()
        .initialization_script(include_str!("../tauri-bridge.js"))
        .build()?;
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        // باید اولین پلاگین ثبت‌شده باشد تا پنجره‌ی دوم به نمونه‌ی اول برگردد
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::dns::dns_get_adapters,
            commands::dns::dns_apply,
            commands::dns::dns_clear,
            commands::dns::dns_flush,
            commands::dns::dns_is_admin,
            commands::store_cmds::store_get_dns_list,
            commands::store_cmds::store_add_dns,
            commands::store_cmds::store_update_dns,
            commands::store_cmds::store_delete_dns,
            commands::store_cmds::store_reorder_dns_list,
            commands::store_cmds::store_clear_dns_list,
            commands::store_cmds::store_import_bat_files,
            commands::store_cmds::store_get_profiles,
            commands::store_cmds::store_add_profile,
            commands::store_cmds::store_update_profile,
            commands::store_cmds::store_delete_profile,
            commands::store_cmds::store_get_settings,
            commands::store_cmds::store_save_settings,
            commands::store_cmds::store_restore_seed,
            commands::app_cmds::app_get_info,
            commands::app_cmds::app_open_external,
            commands::app_cmds::app_open_adapters_page,
            commands::app_cmds::app_show_error,
        ])
        .setup(|app| {
            let _ = store::seed::seed_from_bat_folder(&seed_dir());
            let _ = store::seed::ensure_curated_seed();
            create_main_window(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running DNS Switcher");
}
