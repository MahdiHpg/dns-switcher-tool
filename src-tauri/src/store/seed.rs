//! کیت‌های اولیه: هم از فایل‌های `.bat` کاربر، هم بسته‌ی منتخب (curated)

use std::collections::HashSet;
use std::fs;
use std::path::Path;

use super::models::DnsEntry;
use super::parse_bat::{parse_bat, BatDns};
use super::{dns_list, now_ms, profiles, random_suffix, settings};

/// نقشه‌ی آدرس اصلی به دسته‌بندی — برای ورودی‌های قدیمی و فایل‌های `.bat`
pub fn primary_to_profile(primary: &str) -> String {
    let profile = match primary {
        "178.22.122.100" | "178.22.122.101" | "10.202.10.202" | "185.55.226.26"
        | "217.218.155.155" | "193.186.32.32" | "87.107.110.109" | "78.157.42.100" => "iran",
        "10.202.10.10" | "76.76.2.11" | "76.76.2.22" | "84.200.69.80" | "78.157.42.101" => "gaming",
        "8.8.8.8" | "1.1.1.1" | "9.9.9.9" | "208.67.222.222" | "8.26.56.26" | "156.154.70.1" => {
            "global"
        }
        _ => "general",
    };
    profile.to_string()
}

// ---------- ورود اولیه از فایل‌های `.bat` ----------

fn is_seed_candidate(file_name: &str) -> bool {
    let lower = file_name.to_ascii_lowercase();
    if !lower.ends_with(".bat") {
        return false;
    }
    let skip = ["delete", "flush", "ipconfig", "nslookup", "ping"];
    if skip.iter().any(|prefix| lower.starts_with(prefix)) {
        return false;
    }
    lower.starts_with("set ") || lower.starts_with("gta v dns")
}

/// آخرین بخش «- Copy» را از برچسب حذف می‌کند
fn strip_copy_suffix(text: &str) -> String {
    let lower = text.to_ascii_lowercase();
    let Some(before_copy) = lower.trim_end().strip_suffix("copy") else {
        return text.to_string();
    };
    let Some(before_dash) = before_copy.trim_end().strip_suffix('-') else {
        return text.to_string();
    };
    text[..before_dash.trim_end().len()].trim_end().to_string()
}

/// نام خوانا برای یک کیت که از نام فایل ساخته می‌شود
fn label_from_file(file_name: &str, fallback: &str) -> String {
    let mut base = file_name.to_string();
    if base.len() >= 4 && base[base.len() - 4..].eq_ignore_ascii_case(".bat") {
        base.truncate(base.len() - 4);
    }
    let lower = base.to_ascii_lowercase();
    if lower.starts_with("gta v dns") {
        base = format!("GTA V {}", base["gta v dns".len()..].trim_start());
    } else if lower.starts_with("set") && base[3..].starts_with(char::is_whitespace) {
        base = base[3..].trim_start().to_string();
    }
    let collapsed = strip_copy_suffix(&base)
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");
    if collapsed.is_empty() {
        fallback.to_string()
    } else {
        collapsed
    }
}

/// فقط در اولین اجرا (فهرست خالی) کیت‌ها را از پوشه‌ی `.bat` می‌سازد
pub fn seed_from_bat_folder(dir: &Path) -> usize {
    if !dns_list::get_dns_list().is_empty() {
        return 0;
    }
    let Ok(entries) = fs::read_dir(dir) else {
        return 0;
    };

    let mut list: Vec<DnsEntry> = Vec::new();
    let mut seen: HashSet<String> = HashSet::new();
    let mut added = 0usize;

    for entry in entries.flatten() {
        let file_name = entry.file_name().to_string_lossy().to_string();
        if !is_seed_candidate(&file_name) {
            continue;
        }
        let Ok(text) = fs::read_to_string(entry.path()) else {
            continue;
        };
        let BatDns { primary, secondary } = parse_bat(&text);
        if primary.is_empty() || !seen.insert(format!("{primary}|{secondary}")) {
            continue;
        }
        list.push(DnsEntry {
            id: format!("dns-{}-{}", now_ms(), random_suffix()),
            name: label_from_file(&file_name, &primary),
            primary: primary.clone(),
            secondary,
            profile_id: primary_to_profile(&primary),
            primary_ipv6: None,
            secondary_ipv6: None,
            doh_template: None,
        });
        added += 1;
    }

    if added > 0 {
        dns_list::save_dns_list(list);
    }
    added
}

// ---------- بسته‌ی منتخب (curated) ----------

/// نسخه‌ی فعلی بسته‌ی منتخب
const CURATED_VERSION: u64 = 2;

#[rustfmt::skip]
const CURATED: [(&str, &str, &str, &str); 36] = [
    // جهانی
    ("global", "Google", "8.8.8.8", "8.8.4.4"),
    ("global", "Cloudflare", "1.1.1.1", "1.0.0.1"),
    ("global", "Quad9", "9.9.9.9", "149.112.112.112"),
    ("global", "OpenDNS", "208.67.222.222", "208.67.220.220"),
    ("global", "AdGuard DNS", "94.140.14.14", "94.140.15.15"),
    ("global", "AdGuard Unfiltered", "94.140.14.140", "94.140.14.141"),
    ("global", "AdGuard Family", "94.140.14.15", "94.140.15.16"),
    ("global", "DNS.Watch", "84.200.69.80", "84.200.70.40"),
    ("global", "Mullvad", "193.138.218.74", ""),
    ("global", "ControlD Unfiltered", "76.76.2.0", "76.76.10.0"),
    ("global", "Yandex", "77.88.8.8", "77.88.8.1"),
    ("global", "CleanBrowsing Security", "185.228.168.9", "185.228.169.9"),
    ("global", "Verisign", "64.6.64.6", "64.6.65.6"),
    // ایران
    ("iran", "Shecan", "178.22.122.100", "185.51.200.2"),
    ("iran", "Shecan Pro", "178.22.122.101", "185.51.200.1"),
    ("iran", "403.online", "10.202.10.202", "10.202.10.102"),
    ("iran", "Electro", "78.157.42.100", "78.157.42.101"),
    ("iran", "Bogzar", "185.55.226.26", "185.55.225.25"),
    ("iran", "TCI (Mokhaberat)", "217.218.155.155", "217.218.127.127"),
    ("iran", "Bertina", "193.186.32.32", ""),
    ("iran", "Pishgaman", "5.202.100.100", "5.202.100.101"),
    ("iran", "Shatel", "85.15.1.14", "85.15.1.15"),
    // گیمینگ
    ("gaming", "Radar Game", "10.202.10.10", "10.202.10.11"),
    ("gaming", "Electro Game", "78.157.42.101", "78.157.42.100"),
    ("gaming", "Cloudflare Gaming", "1.1.1.1", "1.0.0.1"),
    ("gaming", "Level3 Gaming", "4.2.2.4", "4.2.2.2"),
    ("gaming", "GTA V Set", "84.200.69.80", "84.200.70.40"),
    ("gaming", "WGEO Wind 1", "76.76.2.11", "76.76.10.11"),
    ("gaming", "WGEO Wind 2", "76.76.2.22", "76.76.10.22"),
    // برنامه‌نویسی
    ("dev", "NextDNS", "45.90.28.190", "45.90.30.190"),
    ("dev", "ControlD Unfiltered", "76.76.2.0", "76.76.10.0"),
    ("dev", "AdGuard Unfiltered", "94.140.14.140", "94.140.14.141"),
    ("dev", "Quad9", "9.9.9.9", "149.112.112.112"),
    ("dev", "Shecan (Dev Access)", "178.22.122.100", "185.51.200.2"),
    ("dev", "403 (Dev Access)", "10.202.10.202", "10.202.10.102"),
    ("dev", "Mullvad", "193.138.218.74", ""),
];

/// کیت‌های منتخب را فقط یک‌بار (تا نسخه‌ی ۲) اضافه می‌کند
pub fn ensure_curated_seed() -> usize {
    if settings::seed_version() >= CURATED_VERSION {
        return 0;
    }

    let mut profile_list = profiles::get_profiles();
    for item in profiles::builtins() {
        if !profile_list.iter().any(|p| p.id == item.id) {
            profile_list.push(item);
        }
    }
    profiles::save_profiles(profile_list.clone());

    let mut list = dns_list::get_dns_list();
    for entry in list.iter_mut() {
        if !profile_list.iter().any(|p| p.id == entry.profile_id) {
            entry.profile_id = primary_to_profile(&entry.primary);
        }
    }

    let mut seen: HashSet<String> = list
        .iter()
        .map(|e| format!("{}|{}|{}", e.profile_id, e.primary, e.secondary))
        .collect();
    let now = now_ms();
    let mut added = 0usize;
    for (index, (profile, name, primary, secondary)) in CURATED.iter().enumerate() {
        if !seen.insert(format!("{profile}|{primary}|{secondary}")) {
            continue;
        }
        list.push(DnsEntry {
            id: format!("cur-{now}-{index}"),
            name: (*name).to_string(),
            primary: (*primary).to_string(),
            secondary: (*secondary).to_string(),
            profile_id: (*profile).to_string(),
            primary_ipv6: None,
            secondary_ipv6: None,
            doh_template: None,
        });
        added += 1;
    }

    dns_list::save_dns_list(list);
    settings::save_settings(&serde_json::json!({ "seedVersion": CURATED_VERSION }));
    added
}

/// برای دکمه‌ی «بازگرداندن کیت‌های پیش‌فرض»: نسخه را صفر می‌کند و دوباره می‌سازد
pub fn restore_curated_seed() -> usize {
    let previous = settings::seed_version();
    settings::save_settings(&serde_json::json!({ "seedVersion": 0 }));
    let added = ensure_curated_seed();
    if added == 0 {
        settings::save_settings(&serde_json::json!({ "seedVersion": previous }));
    }
    added
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn purifies_bat_labels() {
        assert_eq!(label_from_file("set Shecan.bat", "x"), "Shecan");
        assert_eq!(label_from_file("GTA V dns 1.bat", "x"), "GTA V 1");
        assert_eq!(label_from_file("set  my  dns - Copy.bat", "x"), "my dns");
    }

    #[test]
    fn filters_candidate_files() {
        assert!(is_seed_candidate("set Iran.bat"));
        assert!(is_seed_candidate("GTA V dns.bat"));
        assert!(!is_seed_candidate("delete dns.bat"));
        assert!(!is_seed_candidate("readme.txt"));
    }

    #[test]
    fn curated_table_has_no_duplicate_keys() {
        let mut seen = HashSet::new();
        for (profile, _, primary, secondary) in CURATED {
            assert!(
                seen.insert(format!("{profile}|{primary}|{secondary}")),
                "duplicate curated entry: {profile} {primary}"
            );
        }
        assert_eq!(seen.len(), CURATED.len());
    }
}
