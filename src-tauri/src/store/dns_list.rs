//! فهرست کیت‌های DNS — ترتیب آرایه همان ترتیب نمایش در UI است

use serde_json::Value;

use super::models::DnsEntry;
use super::profiles;
use super::{as_text, clamp_chars, file_path, now_ms, random_suffix, read_json, write_json};

fn dns_file() -> std::path::PathBuf {
    file_path("dns-list.json")
}

pub fn get_dns_list() -> Vec<DnsEntry> {
    read_json(&dns_file())
        .and_then(|value| serde_json::from_value(value).ok())
        .unwrap_or_default()
}

/// پاک‌سازی و ذخیره؛ ورودی‌های بدون نام یا DNS اصلی حذف می‌شوند
pub fn save_dns_list(list: Vec<DnsEntry>) -> Vec<DnsEntry> {
    let profile_ids: Vec<String> = profiles::get_profiles()
        .into_iter()
        .map(|p| p.id)
        .collect();

    let mut generated = 0usize;
    let clean: Vec<DnsEntry> = list
        .into_iter()
        .filter_map(|entry| {
            let name = clamp_chars(entry.name.trim(), 60);
            let primary = entry.primary.trim().to_string();
            if name.is_empty() || primary.is_empty() {
                return None;
            }
            let id = if entry.id.is_empty() {
                let id = format!("dns-{}-{}-{}", now_ms(), generated, random_suffix());
                generated += 1;
                id
            } else {
                entry.id
            };
            let profile_id = if profile_ids.contains(&entry.profile_id) {
                entry.profile_id
            } else {
                "general".to_string()
            };
            Some(DnsEntry {
                id,
                name,
                primary,
                secondary: entry.secondary.trim().to_string(),
                profile_id,
                primary_ipv6: entry.primary_ipv6.filter(|s| !s.trim().is_empty()),
                secondary_ipv6: entry.secondary_ipv6.filter(|s| !s.trim().is_empty()),
                doh_template: entry.doh_template.filter(|s| !s.trim().is_empty()),
            })
        })
        .collect();

    write_json(
        &dns_file(),
        &serde_json::to_value(&clean).unwrap_or(Value::Array(vec![])),
    );
    clean
}

pub fn add_dns(entry: &Value) -> DnsEntry {
    let mut list = get_dns_list();
    let item = DnsEntry {
        id: format!("dns-{}-{}", now_ms(), random_suffix()),
        name: {
            let name = clamp_chars(
                as_text(entry.get("name").unwrap_or(&Value::Null))
                    .unwrap_or_default()
                    .trim(),
                60,
            );
            if name.is_empty() {
                "DNS".to_string()
            } else {
                name
            }
        },
        primary: as_text(entry.get("primary").unwrap_or(&Value::Null))
            .unwrap_or_default()
            .trim()
            .to_string(),
        secondary: as_text(entry.get("secondary").unwrap_or(&Value::Null))
            .unwrap_or_default()
            .trim()
            .to_string(),
        profile_id: as_text(entry.get("profileId").unwrap_or(&Value::Null))
            .filter(|id| !id.trim().is_empty())
            .unwrap_or_else(|| "general".to_string()),
        primary_ipv6: as_text(entry.get("primaryIpv6").unwrap_or(&Value::Null))
            .filter(|s| !s.trim().is_empty()),
        secondary_ipv6: as_text(entry.get("secondaryIpv6").unwrap_or(&Value::Null))
            .filter(|s| !s.trim().is_empty()),
        doh_template: as_text(entry.get("dohTemplate").unwrap_or(&Value::Null))
            .filter(|s| !s.trim().is_empty()),
    };
    list.push(item.clone());
    save_dns_list(list);
    item
}

pub fn update_dns(id: &str, patch: &Value) -> Option<DnsEntry> {
    let mut list = get_dns_list();
    let item = list.iter_mut().find(|d| d.id == id)?;

    if let Some(value) = patch.get("name").and_then(as_text) {
        let name = clamp_chars(value.trim(), 60);
        if !name.is_empty() {
            item.name = name;
        }
    }
    if let Some(value) = patch.get("primary").and_then(as_text) {
        item.primary = value.trim().to_string();
    }
    if let Some(value) = patch.get("secondary").and_then(as_text) {
        item.secondary = value.trim().to_string();
    }
    if let Some(value) = patch.get("profileId").and_then(as_text) {
        item.profile_id = value;
    }
    if let Some(value) = patch.get("primaryIpv6") {
        item.primary_ipv6 = as_text(value).filter(|s| !s.trim().is_empty());
    }
    if let Some(value) = patch.get("secondaryIpv6") {
        item.secondary_ipv6 = as_text(value).filter(|s| !s.trim().is_empty());
    }
    if let Some(value) = patch.get("dohTemplate") {
        item.doh_template = as_text(value).filter(|s| !s.trim().is_empty());
    }

    let updated = item.clone();
    save_dns_list(list);
    Some(updated)
}

pub fn delete_dns(id: &str) -> bool {
    let mut list = get_dns_list();
    let Some(index) = list.iter().position(|d| d.id == id) else {
        return false;
    };
    list.remove(index);
    save_dns_list(list);
    true
}

/// ترتیب جدید را اعمال می‌کند؛ شناسه‌های ناشناخته نادیده گرفته می‌شوند
pub fn reorder_dns_list(ordered_ids: Vec<String>) -> Vec<DnsEntry> {
    let list = get_dns_list();
    let mut out: Vec<DnsEntry> = Vec::new();
    for id in ordered_ids {
        if out.iter().any(|d| d.id == id) {
            continue;
        }
        if let Some(entry) = list.iter().find(|d| d.id == id) {
            out.push(entry.clone());
        }
    }
    for entry in list {
        if !out.iter().any(|d| d.id == entry.id) {
            out.push(entry);
        }
    }
    save_dns_list(out)
}

pub fn clear_dns_list() -> Vec<DnsEntry> {
    save_dns_list(Vec::new())
}
