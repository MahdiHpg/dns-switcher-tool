//! دسته‌بندی‌ها (پروفایل‌ها) و مهاجرت رنگ‌های قدیمی

use serde_json::Value;

use super::dns_list;
use super::icons;
use super::models::Profile;
use super::{
    as_text, clamp_chars, file_path, next_color, read_json, valid_color, write_json, DnsEntry,
};

/// پروفایل‌های پیش‌فرض کاربر (تغییرناپذیر) — آیکون = کلید در `store::icons`
pub const DEFAULT_PROFILES: [(&str, &str, &str, &str); 4] = [
    ("general", "عمومی", "home", "#6366f1"),
    ("iran", "ایران", "flag", "#22c55e"),
    ("gaming", "گیمینگ", "gamepad", "#f43f5e"),
    ("dev", "برنامه‌نویسی", "laptop", "#38bdf8"),
];

/// پروفایل «جهانی» که فقط کیت‌های جهانی را نگه می‌دارد
pub const GLOBAL_PROFILE: (&str, &str, &str, &str) = ("global", "جهانی", "globe", "#f59e0b");

const DEFAULT_ICON: &str = icons::DEFAULT_ICON_KEY;

/// سقف طول مقدار آیکون — کلیدهای SVG تا ۱۵ کاراکتر و ایموجی‌های کاربر جا می‌شوند
const ICON_MAX_CHARS: usize = 24;

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
    // مهاجرت: رنگ گمشده یا نامعتبر را پر کن؛ آیکون ایموجی قدیمی را به کلید SVG تبدیل کن
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
            if !icons::is_known_key(&profile.icon) {
                // ایموجی شناخته‌شده → کلید متناظر؛ مقدار ناشناخته دست‌نخورده می‌ماند
                // (رندرر موقتاً span ایموجی نشان می‌دهد) تا اولین ذخیره‌ی بعدی
                if let Some(key) = icons::normalize_icon(&profile.icon) {
                    profile.icon = key;
                }
            }
            profile
        })
        .collect();

    // فولدرهای پیش‌فرضِ حذف‌شده توسط کاربر، دیگر خودکار برنمی‌گردند؛
    // فقط تا وقتی که seed هنوز نسخه‌ی جدید را اعمال نکرده باشد بازسازی می‌شوند.
    let seeded = super::settings::seed_version() >= 2;
    if !seeded {
        for item in builtin {
            if !list.iter().any(|p| p.id == item.id) {
                list.push(item);
            }
        }
    }
    list
}

pub fn save_profiles(list: Vec<Profile>) -> Vec<Profile> {
    let mut clean: Vec<Profile> = list
        .into_iter()
        .map(|profile| {
            let icon = clamp_chars(profile.icon.trim(), ICON_MAX_CHARS);
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
                builtin: profile.builtin,
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
    let item = Profile::custom(
        id.clone(),
        text_or(name, "New Profile", 40),
        text_or(icon, DEFAULT_ICON, ICON_MAX_CHARS),
        color
            .as_deref()
            .and_then(valid_color)
            .unwrap_or_else(|| next_color(&id)),
    );
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
        let icon = clamp_chars(value.trim(), ICON_MAX_CHARS);
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

/// حذف فولدر — همه‌ی فولدرها حذف‌شدنی‌اند به‌جز «عمومی»؛
/// کیت‌های فولدر حذف‌شده به «عمومی» منتقل می‌شوند.
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

/// ترتیب جدید فولدرها را اعمال می‌کند.
///
/// هر عضوِ `ordered_ids` یا شناسه‌ی یک فولدر است، یا نشانگر جایگاه
/// `before:ID` / `after:ID` که یعنی فولدرِ درگ‌شده نسبت به `ID` کجا بنشیند.
/// شناسه‌های ناشناخته نادیده گرفته می‌شوند و هیچ فولدری گم نمی‌شود.
pub fn reorder_profiles(ordered_ids: Vec<String>) -> Vec<Profile> {
    let list = get_profiles();

    let has_anchor = ordered_ids
        .iter()
        .any(|id| id.starts_with("before:") || id.starts_with("after:"));

    if has_anchor {
        // فولدرِ درگ‌شده = اولین شناسه‌ی واقعی که در لیست فعلی هم هست
        let Some(dragged_id) = ordered_ids
            .iter()
            .find(|id| list.iter().any(|p| p.id == **id))
        else {
            return list;
        };
        let Some(dragged) = list.iter().find(|p| p.id == *dragged_id).cloned() else {
            return list;
        };

        // لیست بدونِ درگ‌شده — نشانگرهای before/after نسبت به همین لیست تفسیر می‌شوند
        let mut without: Vec<Profile> = list
            .into_iter()
            .filter(|p| p.id != dragged.id)
            .collect();

        let mut target_index: Option<usize> = None;
        for item in ordered_ids.iter() {
            if let Some(anchor) = item.strip_prefix("before:") {
                if let Some(pos) = without.iter().position(|p| p.id == anchor) {
                    target_index = Some(pos);
                    break;
                }
            } else if let Some(anchor) = item.strip_prefix("after:") {
                if let Some(pos) = without.iter().position(|p| p.id == anchor) {
                    target_index = Some(pos + 1);
                    break;
                }
            }
        }

        // بدون نشانگر معتبر: به انتهای لیست منتقل می‌شود
        let index = target_index.unwrap_or(without.len()).min(without.len());
        without.insert(index, dragged);

        save_profiles(without)
    } else {
        // ترتیب مستقیم شناسه‌ها: شناسه‌های معتبر به همان ترتیب چیده می‌شوند
        let mut out: Vec<Profile> = Vec::new();
        for id in &ordered_ids {
            if out.iter().any(|p| &p.id == id) {
                continue;
            }
            if let Some(entry) = list.iter().find(|p| &p.id == id) {
                out.push(entry.clone());
            }
        }
        for entry in list {
            if !out.iter().any(|p| p.id == entry.id) {
                out.push(entry);
            }
        }
        save_profiles(out)
    }
}
