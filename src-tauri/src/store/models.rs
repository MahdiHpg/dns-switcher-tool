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
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub primary_ipv6: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub secondary_ipv6: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub doh_template: Option<String>,
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
    /// فولدر پیش‌فرض برنامه — قابل حذف است به‌جز «عمومی»
    #[serde(default)]
    pub builtin: bool,
}

impl Profile {
    pub fn new(id: &str, name: &str, icon: &str, color: &str) -> Self {
        Self {
            id: id.to_string(),
            name: name.to_string(),
            icon: icon.to_string(),
            color: color.to_string(),
            builtin: true,
        }
    }

    /// پروفایل ساخته‌ی کاربر — قابل حذف و ویرایش کامل
    pub fn custom(id: String, name: String, icon: String, color: String) -> Self {
        Self {
            id,
            name,
            icon,
            color,
            builtin: false,
        }
    }
}
