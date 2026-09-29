//! فرمان‌های سطح برنامه — معادل بخش `app:*` در `ipc.js`

use std::os::windows::process::CommandExt;
use std::process::Command;

use serde_json::{json, Value};
use tauri::AppHandle;
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

const CREATE_NO_WINDOW: u32 = 0x0800_0000;

/// فقط همین دامنه‌ها اجازه‌ی باز شدن دارند
const ALLOWED_HOSTS: [&str; 2] = ["mahdi-hp.ir", "github.com"];

fn is_allowed_url(url: &str) -> bool {
    let Some(rest) = url.strip_prefix("https://") else {
        return false;
    };
    let rest = rest.strip_prefix("www.").unwrap_or(rest);
    ALLOWED_HOSTS.iter().any(|host| match rest.strip_prefix(host) {
        Some(tail) => tail.is_empty() || tail.starts_with(['/', ':', '?', '#']),
        None => false,
    })
}

/// باز کردن لینک با `start` ویندوز — برای هر دو `https:` و `ms-settings:` کار می‌کند
fn shell_open(target: &str) -> Result<(), String> {
    Command::new("cmd")
        .args(["/C", "start", "", target])
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn app_get_info(app: AppHandle) -> Value {
    json!({
        "version": app.package_info().version.to_string(),
        "builtWith": "GLM 5.3 Flash (AI)",
        "deployedBy": "mahdi-hp.ir",
        "site": "https://mahdi-hp.ir",
    })
}

#[tauri::command]
pub fn app_open_external(url: String) -> Value {
    if !is_allowed_url(&url) {
        return json!({ "ok": false, "error": "URL not allowed" });
    }
    match shell_open(&url) {
        Ok(()) => json!({ "ok": true }),
        Err(error) => json!({ "ok": false, "error": error }),
    }
}

#[tauri::command]
pub fn app_open_adapters_page() -> bool {
    let _ = shell_open("ms-settings:network");
    true
}

#[tauri::command]
pub async fn app_show_error(app: AppHandle, title: String, message: String) -> bool {
    let heading = if title.is_empty() {
        "Error".to_string()
    } else {
        title
    };
    app.dialog()
        .message(message)
        .title(heading)
        .kind(MessageDialogKind::Error)
        .blocking_show();
    true
}

#[cfg(test)]
mod tests {
    use super::is_allowed_url;

    #[test]
    fn allows_own_site_and_github() {
        assert!(is_allowed_url("https://mahdi-hp.ir"));
        assert!(is_allowed_url("https://www.mahdi-hp.ir/"));
        assert!(is_allowed_url("https://github.com/MahdiHpg"));
        assert!(is_allowed_url("https://github.com:443/MahdiHpg"));
    }

    #[test]
    fn rejects_everything_else() {
        assert!(!is_allowed_url("http://mahdi-hp.ir"));
        assert!(!is_allowed_url("https://mahdi-hp.ir.evil.com"));
        assert!(!is_allowed_url("https://evil-mahdi-hp.ir"));
        assert!(!is_allowed_url("javascript:alert(1)"));
        assert!(!is_allowed_url("ms-settings:network"));
    }
}
