//! فرمان‌های مربوط به سرویس DNS — معادل بخش `dns:*`

use std::collections::HashMap;
use serde_json::{json, Value};

use crate::dns_service::{self, ElevatedResult, ServiceCheck};

#[tauri::command]
pub fn dns_get_adapters() -> Value {
    match dns_service::get_adapters() {
        Ok(adapters) => json!({ "ok": true, "adapters": adapters }),
        Err(error) => json!({ "ok": false, "error": error }),
    }
}

#[tauri::command]
pub fn dns_apply(payload: Value) -> ElevatedResult {
    dns_service::apply_dns(&payload)
}

#[tauri::command]
pub fn dns_clear(payload: Value) -> ElevatedResult {
    dns_service::clear_dns(&payload)
}

#[tauri::command]
pub fn dns_flush() -> Value {
    match dns_service::flush_dns() {
        Ok(()) => json!({ "ok": true, "flushed": true }),
        Err(error) => json!({ "ok": false, "error": error }),
    }
}

#[tauri::command]
pub fn dns_is_admin() -> Value {
    json!({ "admin": dns_service::is_admin() })
}

#[tauri::command]
pub async fn dns_ping(ips: Vec<String>) -> HashMap<String, Option<u64>> {
    dns_service::benchmark_dns_list(ips).await
}

#[tauri::command]
pub async fn dns_check_reachability() -> Vec<ServiceCheck> {
    dns_service::check_all_services().await
}

#[tauri::command]
pub fn dns_is_autostart_enabled() -> bool {
    dns_service::is_autostart_enabled()
}

#[tauri::command]
pub fn dns_set_autostart(enable: bool) -> Result<(), String> {
    dns_service::set_autostart(enable)
}

#[tauri::command]
pub fn dns_set_doh(ip: String, template: String) -> Result<(), String> {
    dns_service::set_doh_template(&ip, &template)
}
