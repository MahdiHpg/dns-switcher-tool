use serde::{Deserialize, Serialize};

/// یک کیت DNS ذخیره‌شده در `dns-list.json`
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DnsEntry {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub primary: String,
    #[serde(default)]
    pub secondary: String,
    #[serde(default)]
    pub profile_id: String,
}

/// یک دسته‌بندی (پروفایل) در `profiles.json`
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Profile {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub icon: String,
    #[serde(default)]
    pub color: String,
}

impl Profile {
    pub fn new(id: &str, name: &str, icon: &str, color: &str) -> Self {
        Self {
            id: id.to_string(),
            name: name.to_string(),
            icon: icon.to_string(),
            color: color.to_string(),
        }
    }
}
