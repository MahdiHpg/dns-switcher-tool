//! صدور (Export) و ورود (Import) اطلاعات و بکاپ کامل

use serde_json::{json, Value};
use crate::store::{dns_list, profiles, settings};

pub fn export_all_data() -> Value {
    json!({
        "version": 1,
        "exportedAt": std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis(),
        "dnsList": dns_list::get_dns_list(),
        "profiles": profiles::get_profiles(),
        "settings": settings::get_settings(),
    })
}

pub fn import_all_data(data: &Value) -> Result<usize, String> {
    let Some(dns_items) = data.get("dnsList").and_then(|v| v.as_array()) else {
        return Err("فرمت فایل معتبر نیست (بخش dnsList یافت نشد)".into());
    };

    let mut count = 0;
    for item in dns_items {
        dns_list::add_dns(item);
        count += 1;
    }

    if let Some(profile_items) = data.get("profiles").and_then(|v| v.as_array()) {
        let mut existing_profiles = profiles::get_profiles();
        for item in profile_items {
            if let Ok(entry) = serde_json::from_value::<crate::store::models::Profile>(item.clone()) {
                if !existing_profiles.iter().any(|p| p.id == entry.id) {
                    existing_profiles.push(entry);
                }
            }
        }
        profiles::save_profiles(existing_profiles);
    }

    if let Some(saved_settings) = data.get("settings") {
        settings::save_settings(saved_settings);
    }

    Ok(count)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exports_valid_json_structure() {
        let exported = export_all_data();
        assert_eq!(exported.get("version").and_then(|v| v.as_u64()), Some(1));
        assert!(exported.get("dnsList").is_some());
        assert!(exported.get("profiles").is_some());
        assert!(exported.get("settings").is_some());
    }
}
