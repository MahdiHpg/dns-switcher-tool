//! دسته‌بندی‌ها (پروفایل‌ها) و مهاجرت رنگ‌های قدیمی

use serde_json::Value;

use super::dns_list;
use super::models::Profile;
use super::{
    as_text, clamp_chars, file_path, next_color, read_json, valid_color, write_json, DnsEntry,
};

/// پروفایل‌های پیش‌فرض کاربر (تغییرناپذیر)
pub const DEFAULT_PROFILES: [(&str, &str, &str, &str); 4] = [
    ("general", "عمومی", "🌐", "#6366f1"),
    ("iran", "ایران", "🇮🇷", "#22c55e"),
    ("gaming", "گیمینگ", "🎮", "#f43f5e"),
    ("dev", "برنامه‌نویسی", "💻", "#38bdf8"),
];

/// پروفایل «جهانی» که فقط کیت‌های جهانی را نگه می‌دارد
pub const GLOBAL_PROFILE: (&str, &str, &str, &str) = ("global", "جهانی", "🌍", "#f59e0b");

const DEFAULT_ICON: &str = "📁";

fn from_tuple(item: (&str, &str, &str, &str)) -> Profile {
    Profile::new(item.0, item.1, item.2, item.3)
}

pub fn defaults() -> Vec<Profile> {
    DEFAULT_PROFILES.iter().copied().map(from_tuple).collect()
}

/// پروفایل‌هایی که همیشه باید وجود داشته باشند
pub fn builtins() -> Vec<Profile> {
    let mut list = defaults();
    list.push(from_tuple(GLOBAL_PROFILE));
    list
}

fn profiles_file() -> std::path::PathBuf {
    file_path("profiles.json")
}

pub fn get_profiles() -> Vec<Profile> {
    let stored: Vec<Profile> = read_json(&profiles_file())
        .and_then(|value| serde_json::from_value(value).ok())
        .filter(|list: &Vec<Profile>| !list.is_empty())
        .unwrap_or_else(defaults);

    let builtin = builtins();
    // مهاجرت: رنگ گمشده یا نامعتبر را پر کن
    let mut list: Vec<Profile> = stored
        .into_iter()
        .map(|mut profile| {
            if valid_color(&profile.color).is_none() {
                profile.color = builtin
                    .iter()
                    .find(|b| b.id == profile.id)
                    .map(|b| b.color.clone())
                    .unwrap_or_else(|| next_color(&profile.id));
            }
            profile
        })
        .collect();

    for item in builtin {
        if !list.iter().any(|p| p.id == item.id) {
            list.push(item);
        }
    }
    list
}

pub fn save_profiles(list: Vec<Profile>) -> Vec<Profile> {
    let mut clean: Vec<Profile> = list
        .into_iter()
        .map(|profile| {
            let icon = clamp_chars(profile.icon.trim(), 4);
            Profile {
                color: valid_color(&profile.color)
                    .unwrap_or_else(|| next_color(&profile.id)),
                name: clamp_chars(profile.name.trim(), 40),
                icon: if icon.is_empty() {
                    DEFAULT_ICON.to_string()
                } else {
                    icon
                },
                id: profile.id,
            }
        })
        .filter(|profile| !profile.id.is_empty() && !profile.name.is_empty())
        .collect();

    // «عمومی» هرگز حذف نمی‌شود
    if !clean.iter().any(|p| p.id == "general") {
        clean.insert(0, from_tuple(DEFAULT_PROFILES[0]));
    }
    write_json(
        &profiles_file(),
        &serde_json::to_value(&clean).unwrap_or(Value::Array(vec![])),
    );
    clean
}

fn text_or(input: Option<String>, fallback: &str, max: usize) -> String {
    let value = clamp_chars(input.unwrap_or_default().trim(), max);
    if value.is_empty() {
        fallback.to_string()
    } else {
        value
    }
}

pub fn add_profile(name: Option<String>, icon: Option<String>, color: Option<String>) -> Profile {
    let mut list = get_profiles();
    let id = format!("p-{}-{}", super::now_ms(), super::random_suffix());
    let item = Profile {
        name: text_or(name, "New Profile", 40),
        icon: text_or(icon, DEFAULT_ICON, 4),
        color: color
            .as_deref()
            .and_then(valid_color)
            .unwrap_or_else(|| next_color(&id)),
        id,
    };
    list.push(item.clone());
    save_profiles(list);
    item
}

pub fn update_profile(id: &str, patch: &Value) -> Option<Profile> {
    let mut list = get_profiles();
    let item = list.iter_mut().find(|p| p.id == id)?;

    if let Some(value) = patch.get("name").and_then(as_text) {
        let name = clamp_chars(value.trim(), 40);
        if !name.is_empty() {
            item.name = name;
        }
    }
    if let Some(value) = patch.get("icon").and_then(as_text) {
        let icon = clamp_chars(value.trim(), 4);
        if !icon.is_empty() {
            item.icon = icon;
        }
    }
    if let Some(color) = patch.get("color").and_then(as_text).and_then(|c| valid_color(&c)) {
        item.color = color;
    }

    let updated = item.clone();
    save_profiles(list);
    Some(updated)
}

/// حذف پروفایل، کیت‌هایش را به «عمومی» منتقل می‌کند
pub fn delete_profile(id: &str) -> bool {
    if id == "general" {
        return false;
    }
    let mut list = get_profiles();
    let Some(index) = list.iter().position(|p| p.id == id) else {
        return false;
    };
    list.remove(index);
    save_profiles(list);

    let moved: Vec<DnsEntry> = dns_list::get_dns_list()
        .into_iter()
        .map(|mut entry| {
            if entry.profile_id == id {
                entry.profile_id = "general".to_string();
            }
            entry
        })
        .collect();
    dns_list::save_dns_list(moved);
    true
}
