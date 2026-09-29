//! فرمان‌های مربوط به سرویس DNS — معادل بخش `dns:*` در `ipc.js`

use serde_json::{json, Value};

use crate::dns_service::{self, ElevatedResult};

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
