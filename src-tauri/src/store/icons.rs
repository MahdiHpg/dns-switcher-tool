//! آیکون‌های SVG فولدرها — مجموعه‌ی ساده و یک‌دست برای ویندوز
//!
//! فولدرها یک «کلید» آیکون (مثل `folder` یا `shield`) ذخیره می‌کنند و این ماژول
//! آن کلید را به SVG خطیِ ۲۴×۲۴ (استایل Feather) با `stroke="currentColor"`
//! برمی‌گرداند؛ به این ترتیب آیکون با رنگ هر فولدر و هر پوسته هماهنگ می‌ماند.
//! ایموجی‌های نسخه‌های قبلی هم در زمان لود مهاجرت داده می‌شوند تا در
//! `profiles.json` همیشه کلید بماند. ایموجی ناشناخته‌ی کاربر به‌صورت موقت
//! داخل یک span رندر می‌شود و با اولین ذخیره به کلید تبدیل می‌گردد.

use std::collections::HashMap;
use std::sync::OnceLock;

/// کلید پیش‌فرض وقتی آیکون خالی یا ناشناخته است
pub const DEFAULT_ICON_KEY: &str = "folder";

/// کلید و بدنه‌ی SVG هر آیکون (داخل viewBox «0 0 24 24»، استایل خطی)
#[rustfmt::skip]
pub const ICONS: [(&str, &str); 44] = [
    ("folder",        r#"<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>"#),
    ("folder-open",   r#"<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>"#),
    ("archive",       r#"<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>"#),
    ("globe",         r#"<circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>"#),
    ("flag",          r#"<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>"#),
    ("shield",        r#"<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>"#),
    ("zap",           r#"<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>"#),
    ("rocket",        r#"<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>"#),
    ("gamepad",       r#"<path d="M6 12h4"/><path d="M8 10v4"/><path d="M15 13h.01"/><path d="M18 11h.01"/><rect x="2" y="6" width="20" height="12" rx="3"/>"#),
    ("laptop",        r#"<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M2 20h20"/>"#),
    ("phone",         r#"<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>"#),
    ("monitor",       r#"<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>"#),
    ("building",      r#"<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>"#),
    ("home",          r#"<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>"#),
    ("package",       r#"<path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/><path d="M12 22.08V12"/>"#),
    ("star",          r#"<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>"#),
    ("flame",         r#"<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>"#),
    ("droplet",       r#"<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>"#),
    ("moon",          r#"<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>"#),
    ("sun",           r#"<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>"#),
    ("target",        r#"<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>"#),
    ("puzzle",        r#"<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>"#),
    ("cpu",           r#"<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>"#),
    ("tools",         r#"<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>"#),
    ("settings",      r#"<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>"#),
    ("magnet",        r#"<path d="M6 15l-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15"/><path d="M5 8l4 4"/><path d="M12 15l4 4"/>"#),
    ("radio",         r#"<circle cx="12" cy="12" r="2"/><path d="M4.93 19.07a10 10 0 0 1 0-14.14"/><path d="M7.76 16.24a6 6 0 0 1 0-8.49"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>"#),
    ("link",          r#"<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>"#),
    ("briefcase",     r#"<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>"#),
    ("graduation",    r#"<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>"#),
    ("trophy",        r#"<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>"#),
    ("palette",       r#"<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>"#),
    ("music",         r#"<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>"#),
    ("film",          r#"<rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>"#),
    ("camera",        r#"<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>"#),
    ("banknote",      r#"<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>"#),
    ("credit-card",   r#"<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>"#),
    ("bank",          r#"<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7"/><polygon points="12 2 20 7 4 7"/>"#),
    ("shopping-cart", r#"<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>"#),
    ("plane",         r#"<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>"#),
    ("car",           r#"<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>"#),
    ("bike",          r#"<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>"#),
    ("map",           r#"<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><path d="M8 2v16M16 6v16"/>"#),
    ("lock",          r#"<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>"#),
];

/// مهاجرت ایموجی‌های نسخه‌های قبلی به کلید — هم رشته‌ی ساده و هم با Variation Selector
#[rustfmt::skip]
const EMOJI_MAP: [(&str, &str); 48] = [
    ("📁", "folder"), ("📂", "folder-open"), ("🗂", "archive"), ("🗃", "archive"),
    ("🌐", "globe"), ("🌍", "globe"), ("🌎", "globe"), ("🌏", "globe"),
    ("🇮🇷", "flag"), ("🔒", "lock"), ("🛡", "shield"), ("🛡️", "shield"),
    ("⚡", "zap"), ("🚀", "rocket"), ("🎮", "gamepad"), ("💻", "laptop"),
    ("📱", "phone"), ("🖥", "monitor"), ("🖥️", "monitor"), ("🏢", "building"),
    ("🏠", "home"), ("📦", "package"), ("⭐", "star"), ("🔥", "flame"),
    ("💧", "droplet"), ("🌙", "moon"), ("☀️", "sun"), ("☀", "sun"),
    ("🎯", "target"), ("🧩", "puzzle"), ("🧠", "cpu"), ("🛠", "tools"),
    ("🛠️", "tools"), ("⚙️", "settings"), ("⚙", "settings"), ("🧲", "magnet"),
    ("📡", "radio"), ("🔗", "link"), ("💼", "briefcase"), ("🎓", "graduation"),
    ("🏁", "flag"), ("🏆", "trophy"), ("🎨", "palette"), ("🎵", "music"),
    ("🎬", "film"), ("📷", "camera"), ("💰", "banknote"), ("💳", "credit-card"),
];

/// نقشه‌ی کامل ایموجی → کلید (شامل ورودی‌های جدول دوم)
fn emoji_map() -> &'static HashMap<&'static str, &'static str> {
    static MAP: OnceLock<HashMap<&'static str, &'static str>> = OnceLock::new();
    MAP.get_or_init(|| EMOJI_MAP.iter().copied().collect())
}

/// کشِ SVG کامل هر کلید — یک‌بار ساخته می‌شود و همیشه همان برش برگردانده می‌شود
fn svg_cache() -> &'static HashMap<String, String> {
    static CACHE: OnceLock<HashMap<String, String>> = OnceLock::new();
    CACHE.get_or_init(|| {
        ICONS
            .iter()
            .map(|(key, body)| {
                (
                    (*key).to_string(),
                    format!(
                        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"1em\" height=\"1em\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"profile-svg\" aria-hidden=\"true\">{body}</svg>"
                    ),
                )
            })
            .collect()
    })
}

/// آیا این مقدار یکی از کلیدهای شناخته‌شده است؟
pub fn is_known_key(icon: &str) -> bool {
    ICONS.iter().any(|(key, _)| *key == icon)
}

/// مقدار ذخیره‌شده را نرمال می‌کند:
/// کلید معتبر → همان؛ ایموجی قدیمی → کلید متناظر؛ بقیه → هیچ
pub fn normalize_icon(icon: &str) -> Option<String> {
    let value = icon.trim();
    if value.is_empty() {
        return None;
    }
    if is_known_key(value) {
        return Some(value.to_string());
    }
    emoji_map().get(value).map(|key| (*key).to_string())
}

/// SVG آماده‌ی رندر برای مقدار ذخیره‌شده‌ی فولدر:
/// کلید معتبر → SVG؛ مقدار ناشناخته‌ی غیرخالی (مثلاً ایموجی کاربر) → span ایموجی؛
/// خالی → آیکون پیش‌فرض فولدر
pub fn svg_or_fallback(icon: &str) -> String {
    if let Some(key) = normalize_icon(icon) {
        if let Some(svg) = svg_cache().get(&key) {
            return svg.clone();
        }
    }
    let value = icon.trim();
    if !value.is_empty() {
        // مقدار ناشناخته — تا اولین ذخیره به‌صورت ایموجی نشان داده می‌شود
        return format!("<span class=\"profile-emoji\">{value}</span>");
    }
    svg_cache()
        .get(DEFAULT_ICON_KEY)
        .cloned()
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_icon_uses_currentcolor() {
        for (key, _) in ICONS {
            let svg = svg_or_fallback(key);
            assert!(svg.contains("currentColor"), "icon {key} loses currentColor");
            assert!(svg.contains("viewBox=\"0 0 24 24\""), "icon {key} misses viewBox");
        }
    }

    #[test]
    fn migrates_legacy_emoji() {
        assert_eq!(normalize_icon("🌐").as_deref(), Some("globe"));
        assert_eq!(normalize_icon("🇮🇷").as_deref(), Some("flag"));
        assert_eq!(normalize_icon("📁").as_deref(), Some("folder"));
        assert_eq!(normalize_icon("⚙️").as_deref(), Some("settings"));
        assert_eq!(normalize_icon("⚙").as_deref(), Some("settings"));
    }

    #[test]
    fn keeps_known_keys_and_rejects_unknown() {
        assert_eq!(normalize_icon("rocket").as_deref(), Some("rocket"));
        assert_eq!(normalize_icon("🦄"), None);
        assert_eq!(normalize_icon(""), None);
    }

    #[test]
    fn unknown_value_falls_back_to_emoji_span() {
        let html = svg_or_fallback("🦄");
        assert!(html.contains("profile-emoji"));
        assert!(html.contains("🦄"));
        assert_eq!(svg_or_fallback(""), svg_or_fallback(DEFAULT_ICON_KEY));
    }

    #[test]
    fn builtin_defaults_migrate_to_keys() {
        // آیکون همه‌ی پروفایل‌های پیش‌فرض باید به کلید معتبر مهاجرت کند
        let pairs = ["🌐", "🇮🇷", "🎮", "💻", "🌍"];
        for emoji in pairs {
            assert!(normalize_icon(emoji).is_some(), "{emoji} has no migration target");
        }
    }
}
