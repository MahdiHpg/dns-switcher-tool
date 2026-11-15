//! مدیریت آیکون و منوی سینی ویندوز (System Tray)

use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager};

pub fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let show_item = MenuItem::with_id(app, "show", "نمایش پنجره اصلی", true, None::<&str>)?;
    let flush_item = MenuItem::with_id(app, "flush", "پاکسازی کش (Flush DNS)", true, None::<&str>)?;
    let clear_item = MenuItem::with_id(app, "clear", "تنظیم خودکار (Clear DNS)", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "خروج از برنامه", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_item, &flush_item, &clear_item, &quit_item])?;

    let icon = app.default_window_icon().cloned().ok_or_else(|| {
        tauri::Error::AssetNotFound("Default window icon not found".into())
    })?;

    let _tray = TrayIconBuilder::with_id("dns-switcher-tray")
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .tooltip("DNS Switcher — سوییچر سریع DNS")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                }
            }
            "flush" => {
                let _ = crate::dns_service::flush_dns();
            }
            "clear" => {
                if let Ok(adapters) = crate::dns_service::get_adapters() {
                    let active_names: Vec<String> = adapters
                        .into_iter()
                        .filter(|a| a.connected)
                        .map(|a| a.name)
                        .collect();
                    let payload = serde_json::json!({
                        "adapters": active_names,
                        "flush": true,
                    });
                    let _ = crate::dns_service::clear_dns(&payload);
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let is_visible = window.is_visible().unwrap_or(false);
                    if is_visible {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.unminimize();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}
