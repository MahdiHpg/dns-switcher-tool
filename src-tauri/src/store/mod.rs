//! لایه‌ی ذخیره‌سازی: همان فایل‌های JSON نسخه‌ی Electron
//!
//! بیشتر از دو تکه است، پس طبق قواعد پروژه داخل پوشه‌ی هم‌نام `store/` قرار گرفته‌اند:
//! `models` داده‌ها، `profiles` دسته‌بندی‌ها، `dns_list` کیت‌ها، `parse_bat` و `seed`
//! ورود اولیه، و `settings` تنظیمات ظاهری.

pub mod dns_list;
pub mod icons;
pub mod models;
pub mod parse_bat;
pub mod profiles;
pub mod seed;
pub mod settings;

use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

pub use models::DnsEntry;

/// رنگ‌های آماده‌ی پروفایل‌های سفارشی
pub const PROFILE_PALETTE: [&str; 8] = [
    "#6366f1", "#22c55e", "#f59e0b", "#f43f5e", "#38bdf8", "#a855f7", "#14b8a6", "#f97316",
];

/// اگر این متغیر محیطی ست شده باشد، به‌جای پوشه‌ی استاندارد از آن استفاده می‌شود
/// (برای تست‌های یکپارچه‌سازی که نباید داده‌ی واقعی کاربر را دست بزنند)
pub const DATA_DIR_ENV: &str = "DNS_SWITCHER_DATA_DIR";

/// همان مسیر نسخه‌ی Electron تا داده‌های موجود کاربر بدون مهاجرت دستی باقی بمانند
pub fn data_dir() -> PathBuf {
    if let Some(custom) = std::env::var_os(DATA_DIR_ENV) {
        return PathBuf::from(custom);
    }
    let base = std::env::var_os("APPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(std::env::temp_dir);
    base.join("DNS Switcher").join("data")
}

pub fn file_path(name: &str) -> PathBuf {
    data_dir().join(name)
}

pub fn ensure_dir() {
    let _ = fs::create_dir_all(data_dir());
}

pub fn read_json(file: &Path) -> Option<serde_json::Value> {
    let text = fs::read_to_string(file).ok()?;
    serde_json::from_str(&text).ok()
}

pub fn write_json(file: &Path, value: &serde_json::Value) {
    ensure_dir();
    if let Ok(text) = serde_json::to_string_pretty(value) {
        let _ = fs::write(file, text);
    }
}

/// میلی‌ثانیه‌ی یونیکس — جانشین `Date.now()`
pub fn now_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0)
}

/// دنباله‌ی کوچک شبه‌تصادفی — جانشین `Math.floor(Math.random() * 10000)`
pub fn random_suffix() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| (d.subsec_nanos() as u128) % 10_000)
        .unwrap_or(0)
}

/// کوتاه‌کردن متن بر اساس تعداد کاراکتر (نه بایت)
pub fn clamp_chars(value: &str, max: usize) -> String {
    value.chars().take(max).collect()
}

/// جانگزاری HTML برای درج امن در innerHTML رندرر
pub fn escape_html(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for c in value.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&#39;"),
            other => out.push(other),
        }
    }
    out
}

/// تبدیل مقدار JSON به متن؛ `null` یعنی «مقداری ارسال نشده»
pub fn as_text(value: &serde_json::Value) -> Option<String> {
    match value {
        serde_json::Value::Null => None,
        serde_json::Value::String(s) => Some(s.clone()),
        other => Some(other.to_string()),
    }
}

/// اعتبارسنجی رنگ هگز `#rrggbb` و برگرداندن نسخه‌ی حروف‌کوچک
pub fn valid_color(value: &str) -> Option<String> {
    let is_hex = value.len() == 7
        && value.starts_with('#')
        && value[1..].chars().all(|c| c.is_ascii_hexdigit());
    if is_hex {
        Some(value.to_ascii_lowercase())
    } else {
        None
    }
}

/// رنگ پایدار بر اساس شناسه — وقتی کاربر رنگی انتخاب نکرده باشد
pub fn next_color(id: &str) -> String {
    let mut hash: u32 = 0;
    for unit in id.encode_utf16() {
        hash = hash.wrapping_mul(31).wrapping_add(unit as u32);
    }
    PROFILE_PALETTE[(hash % PROFILE_PALETTE.len() as u32) as usize].to_string()
}
