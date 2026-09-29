//! تنظیمات ظاهری UI در `settings.json` — ساختار کلید/مقدار آزاد

use serde_json::{Map, Value};

use super::{file_path, read_json, write_json};

fn settings_file() -> std::path::PathBuf {
    file_path("settings.json")
}

pub fn get_settings() -> Value {
    read_json(&settings_file()).unwrap_or_else(|| Value::Object(Map::new()))
}

/// فقط کلیدهای ارسال‌شده را جایگزین می‌کند و بقیه را نگه می‌دارد
pub fn save_settings(patch: &Value) -> Value {
    let mut current = get_settings();
    if let (Some(base), Some(extra)) = (current.as_object_mut(), patch.as_object()) {
        for (key, value) in extra {
            base.insert(key.clone(), value.clone());
        }
    }
    write_json(&settings_file(), &current);
    current
}

/// نسخه‌ی کیت‌های پیش‌فرض که کاربر قبلاً دیده است
pub fn seed_version() -> u64 {
    get_settings()
        .get("seedVersion")
        .and_then(Value::as_u64)
        .unwrap_or(0)
}
