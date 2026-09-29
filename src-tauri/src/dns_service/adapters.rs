//! فهرست آداپتورهای شبکه و DNS فعلی آن‌ها
//!
//! خروجی PowerShell به‌صورت JSON ساختاریافته گرفته می‌شود تا مستقل از زبان ویندوز باشد.

use std::collections::HashSet;

use serde::Serialize;
use serde_json::Value;

use super::exec;

const PS: &str = "powershell.exe";

/// کوئری تک‌خطی PowerShell که آداپتورها و سرورهای DNS را برمی‌گرداند
const PS_QUERY: &str = concat!(
    "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;",
    "$ErrorActionPreference='SilentlyContinue';",
    "$a=@(Get-NetAdapter | Sort-Object { $_.Status -ne 'Up' }, Name | ",
    "ForEach-Object { [pscustomobject]@{ n=$_.Name; d=$_.InterfaceDescription; s=[string]$_.Status } });",
    "$v=@(Get-DnsClientServerAddress -AddressFamily IPv4 | ",
    "ForEach-Object { [pscustomobject]@{ a=$_.InterfaceAlias; v=@($_.ServerAddresses) } });",
    "ConvertTo-Json -InputObject @{ adapters=$a; dns=$v } -Compress -Depth 4",
);

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Adapter {
    pub name: String,
    pub description: String,
    pub status: String,
    pub connected: bool,
    pub dns: Vec<String>,
    /// آداپتورهای مخفی/مجازی که فقط در جدول DNS دیده می‌شوند
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hidden: Option<bool>,
}

/// مقدار را همیشه به لیست تبدیل می‌کند؛ `ConvertTo-Json` آرایه‌ی تک‌عضوی را ساده می‌کند
fn as_array(value: Option<&Value>) -> Vec<&Value> {
    match value {
        None | Some(Value::Null) => Vec::new(),
        Some(Value::Array(items)) => items.iter().collect(),
        Some(other) => vec![other],
    }
}

fn text_field(value: &Value, key: &str) -> Option<String> {
    match value.get(key) {
        Some(Value::String(text)) if !text.is_empty() => Some(text.clone()),
        Some(Value::Null) | None => None,
        Some(other) => Some(other.to_string()),
    }
}

fn dedup(values: Vec<String>) -> Vec<String> {
    let mut seen = HashSet::new();
    values
        .into_iter()
        .filter(|value| !value.is_empty() && seen.insert(value.clone()))
        .collect()
}

fn extract_json(text: &str) -> Result<Value, String> {
    let start = text
        .find('{')
        .ok_or_else(|| "No JSON found in output".to_string())?;
    serde_json::from_str(&text[start..]).map_err(|error| error.to_string())
}

/// نگاشت نام آداپتور به سرورهای DNS اعلام‌شده‌اش
fn collect_dns_by_alias(data: &Value) -> Vec<(String, Vec<String>)> {
    let mut result: Vec<(String, Vec<String>)> = Vec::new();
    for item in as_array(data.get("dns")) {
        let Some(alias) = text_field(item, "a").or_else(|| text_field(item, "alias")) else {
            continue;
        };
        let addresses: Vec<String> = as_array(item.get("v"))
            .iter()
            .filter_map(|value| value.as_str().map(str::to_string))
            .collect();
        match result.iter_mut().find(|(name, _)| *name == alias) {
            Some((_, list)) => list.extend(addresses),
            None => result.push((alias, addresses)),
        }
    }
    result
}

fn dns_for(alias: &str, table: &[(String, Vec<String>)]) -> Vec<String> {
    table
        .iter()
        .find(|(name, _)| name == alias)
        .map(|(_, values)| dedup(values.clone()))
        .unwrap_or_default()
}

pub fn get_adapters() -> Result<Vec<Adapter>, String> {
    let result = exec::run(
        PS,
        &["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", PS_QUERY],
    );
    if !result.ok && result.stdout.trim().is_empty() {
        return Err(format!(
            "Could not query network adapters: {}",
            super::first_chars(result.stderr.trim(), 300)
        ));
    }

    let data = extract_json(&result.stdout)
        .map_err(|error| format!("Failed to parse adapter info: {error}"))?;
    let table = collect_dns_by_alias(&data);

    let mut seen: HashSet<String> = HashSet::new();
    let mut adapters: Vec<Adapter> = Vec::new();
    for item in as_array(data.get("adapters")) {
        let Some(name) = text_field(item, "n").or_else(|| text_field(item, "name")) else {
            continue;
        };
        if !seen.insert(name.clone()) {
            continue;
        }
        let status = text_field(item, "s")
            .or_else(|| text_field(item, "status"))
            .unwrap_or_default();
        adapters.push(Adapter {
            description: text_field(item, "d")
                .or_else(|| text_field(item, "description"))
                .unwrap_or_default(),
            connected: status == "Up",
            dns: dns_for(&name, &table),
            name,
            status,
            hidden: None,
        });
    }

    // آداپتورهایی که فقط در جدول DNS هستند (مخفی/مجازی)
    for (alias, _) in &table {
        if !seen.contains(alias) {
            adapters.push(Adapter {
                name: alias.clone(),
                description: String::new(),
                status: String::new(),
                connected: false,
                dns: dns_for(alias, &table),
                hidden: Some(true),
            });
        }
    }

    Ok(adapters)
}
