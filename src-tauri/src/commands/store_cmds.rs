//! فرمان‌های لایه‌ی ذخیره‌سازی — معادل بخش `store:*` در `ipc.js`

use std::fs;

use serde::Serialize;
use serde_json::{json, Value};
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

use crate::store;

fn to_value<T: Serialize>(value: T) -> Value {
    serde_json::to_value(value).unwrap_or(Value::Null)
}

// ---------- فهرست DNS ----------

#[tauri::command]
pub fn store_get_dns_list() -> Value {
    to_value(store::dns_list::get_dns_list())
}

#[tauri::command]
pub fn store_add_dns(entry: Value) -> Value {
    to_value(store::dns_list::add_dns(&entry))
}

#[tauri::command]
pub fn store_update_dns(id: String, patch: Value) -> Value {
    to_value(store::dns_list::update_dns(&id, &patch))
}

#[tauri::command]
pub fn store_delete_dns(id: String) -> bool {
    store::dns_list::delete_dns(&id)
}

#[tauri::command]
pub fn store_reorder_dns_list(ordered_ids: Vec<String>) -> Value {
    to_value(store::dns_list::reorder_dns_list(ordered_ids))
}

#[tauri::command]
pub fn store_clear_dns_list() -> Value {
    to_value(store::dns_list::clear_dns_list())
}

/// نام خوانا از نام فایل انتخاب‌شده؛ پیشوند `set ` حذف می‌شود
fn label_from_path(path: &std::path::Path, fallback: &str) -> String {
    let file_name = path
        .file_name()
        .map(|name| name.to_string_lossy().to_string())
        .unwrap_or_default();
    let lower = file_name.to_ascii_lowercase();
    let stem_len = [".bat", ".txt", ".cmd"]
        .iter()
        .find_map(|extension| lower.strip_suffix(extension).map(|stem| stem.len()))
        .unwrap_or(file_name.len());
    let trimmed = file_name[..stem_len].trim();

    let lower = trimmed.to_ascii_lowercase();
    let without_prefix = if lower.starts_with("set") {
        let rest = trimmed[3..].trim_start();
        if rest.len() < trimmed.len() - 3 {
            rest
        } else {
            trimmed
        }
    } else {
        trimmed
    };

    if without_prefix.is_empty() {
        fallback.to_string()
    } else {
        without_prefix.to_string()
    }
}

#[tauri::command]
pub async fn store_import_bat_files(app: AppHandle) -> Value {
    let picked = app
        .dialog()
        .file()
        .set_title("Import DNS from .bat / .txt")
        .add_filter("Batch / Text", &["bat", "txt", "cmd"])
        .blocking_pick_files();

    let Some(files) = picked else {
        return json!({ "added": 0, "canceled": true });
    };
    if files.is_empty() {
        return json!({ "added": 0, "canceled": true });
    }

    let mut added = 0usize;
    for file in files {
        let Ok(path) = file.into_path() else {
            continue;
        };
        let Ok(text) = fs::read_to_string(&path) else {
            continue;
        };
        let parsed = store::parse_bat::parse_bat(&text);
        if parsed.primary.is_empty() {
            continue;
        }
        let duplicated = store::dns_list::get_dns_list().iter().any(|entry| {
            entry.primary == parsed.primary && entry.secondary == parsed.secondary
        });
        if duplicated {
            continue;
        }
        store::dns_list::add_dns(&json!({
            "name": label_from_path(&path, &parsed.primary),
            "primary": parsed.primary,
            "secondary": parsed.secondary,
            "profileId": "general",
        }));
        added += 1;
    }
    json!({ "added": added })
}

// ---------- پروفایل‌ها ----------

#[tauri::command]
pub fn store_get_profiles() -> Value {
    to_value(store::profiles::get_profiles())
}

#[tauri::command]
pub fn store_add_profile(
    name: Option<String>,
    icon: Option<String>,
    color: Option<String>,
) -> Value {
    to_value(store::profiles::add_profile(name, icon, color))
}

#[tauri::command]
pub fn store_update_profile(id: String, patch: Value) -> Value {
    to_value(store::profiles::update_profile(&id, &patch))
}

#[tauri::command]
pub fn store_delete_profile(id: String) -> bool {
    store::profiles::delete_profile(&id)
}

// ---------- تنظیمات ----------

#[tauri::command]
pub fn store_get_settings() -> Value {
    store::settings::get_settings()
}

#[tauri::command]
pub fn store_save_settings(patch: Value) -> Value {
    store::settings::save_settings(&patch)
}

#[tauri::command]
pub fn store_restore_seed() -> Value {
    json!({ "added": store::seed::restore_curated_seed() })
}
