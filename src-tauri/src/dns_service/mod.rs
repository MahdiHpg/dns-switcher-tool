//! سرویس DNS ویندوز — معادل `dns-service.js`
//!
//! بیش از دو تکه است، پس طبق قواعد پروژه داخل پوشه‌ی هم‌نام `dns_service/` نشسته‌اند:
//! `exec` اجرای فرمان، `adapters` خواندن آداپتورها، `elevate` اجرای ادمین و `validate` اعتبارسنجی.

pub mod adapters;
pub mod elevate;
pub mod exec;
pub mod validate;

use serde_json::Value;

pub use adapters::get_adapters;
pub use elevate::{run_elevated, DnsOp, ElevatedResult, OpKind};
pub use validate::is_valid_ip;

/// خواندن لیست رشته‌ای از payload ورودی UI
fn string_list(value: Option<&Value>) -> Vec<String> {
    match value {
        Some(Value::Array(items)) => items
            .iter()
            .filter_map(|item| item.as_str().map(str::to_string))
            .collect(),
        Some(Value::String(text)) => vec![text.clone()],
        _ => Vec::new(),
    }
}

pub fn first_chars(text: &str, max: usize) -> String {
    text.chars().take(max).collect()
}

/// بررسی دسترسی ادمین با `net session`
pub fn is_admin() -> bool {
    exec::run("net", &["session"]).ok
}

pub fn flush_dns() -> Result<(), String> {
    if exec::run("ipconfig", &["/flushdns"]).ok {
        Ok(())
    } else {
        Err("flushdns failed".to_string())
    }
}

fn apply_ops(servers: &[String], adapters: &[String], flush: bool) -> ElevatedResult {
    if adapters.is_empty() {
        return ElevatedResult::error("No adapter selected");
    }
    let addresses: Vec<String> = servers
        .iter()
        .filter(|server| is_valid_ip(server))
        .cloned()
        .collect();
    let Some(primary) = addresses.first() else {
        return ElevatedResult::error("No valid DNS server address");
    };

    let mut ops: Vec<DnsOp> = Vec::new();
    for iface in adapters {
        ops.push(DnsOp {
            kind: OpKind::Set,
            iface: iface.clone(),
            ip: primary.clone(),
        });
        if let Some(secondary) = addresses.get(1) {
            ops.push(DnsOp {
                kind: OpKind::Add,
                iface: iface.clone(),
                ip: secondary.clone(),
            });
        }
    }
    run_elevated(&ops, flush)
}

fn clear_ops(adapters: &[String], flush: bool) -> ElevatedResult {
    if adapters.is_empty() {
        return ElevatedResult::error("No adapter selected");
    }
    let ops: Vec<DnsOp> = adapters
        .iter()
        .map(|iface| DnsOp {
            kind: OpKind::Delete,
            iface: iface.clone(),
            ip: String::new(),
        })
        .collect();
    run_elevated(&ops, flush)
}

pub fn apply_dns(payload: &Value) -> ElevatedResult {
    apply_ops(
        &string_list(payload.get("servers")),
        &string_list(payload.get("adapters")),
        payload.get("flush").and_then(Value::as_bool).unwrap_or(false),
    )
}

pub fn clear_dns(payload: &Value) -> ElevatedResult {
    clear_ops(
        &string_list(payload.get("adapters")),
        payload.get("flush").and_then(Value::as_bool).unwrap_or(false),
    )
}
