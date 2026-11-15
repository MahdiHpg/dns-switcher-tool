//! DNS Switcher — هسته‌ی Rust جایگزین Electron
//!
//! رابط کاربری مدرن در `renderer/` و ارتباط امن از طریق لایه‌ی پل (`tauri-bridge.js`).

pub mod commands;
pub mod dns_service;
pub mod store;
pub mod tray;

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
    let window = WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
        .title("DNS Switcher")
        .inner_size(1080.0, 740.0)
        .min_inner_size(520.0, 420.0)
        .center()
        .disable_drag_drop_handler()
        .initialization_script(include_str!("../tauri-bridge.js"))
        .build()?;

    let window_clone = window.clone();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            let _ = window_clone.hide();
        }
    });

    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        // باید اولین پلاگین ثبت‌شده باشد تا پنجره‌ی دوم به نمونه‌ی اول برگردد
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // سرویس‌های اصلی DNS
            commands::dns::dns_get_adapters,
            commands::dns::dns_apply,
            commands::dns::dns_clear,
            commands::dns::dns_flush,
            commands::dns::dns_is_admin,
            commands::dns::dns_ping,
            commands::dns::dns_check_reachability,
            commands::dns::dns_is_autostart_enabled,
            commands::dns::dns_set_autostart,
            commands::dns::dns_set_doh,
            // داده‌ها و پروفایل‌ها
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
            commands::store_cmds::store_reorder_profiles,
            commands::store_cmds::store_folder_icons,
            commands::store_cmds::store_icon_svgs,
            commands::store_cmds::store_get_settings,
            commands::store_cmds::store_save_settings,
            commands::store_cmds::store_restore_seed,
            commands::store_cmds::store_export_backup,
            commands::store_cmds::store_import_backup,
            commands::store_cmds::store_fetch_remote_dns,
            // اپلیکیشن و دیالوگ‌ها
            commands::app_cmds::app_get_info,
            commands::app_cmds::app_open_external,
            commands::app_cmds::app_open_adapters_page,
            commands::app_cmds::app_show_error,
        ])
        .setup(|app| {
            let _ = store::seed::seed_from_bat_folder(&seed_dir());
            let _ = store::seed::ensure_curated_seed();
            create_main_window(app)?;
            let _ = tray::setup_tray(app.handle());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running DNS Switcher");
}
