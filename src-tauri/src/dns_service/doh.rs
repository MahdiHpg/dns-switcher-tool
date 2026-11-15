//! پیکربندی DNS-over-HTTPS (DoH) در ویندوز ۱۱

use super::exec;

/// اضافه یا فعال‌کردن تمپلیت DoH در ویندوز ۱۱
pub fn set_doh_template(ip: &str, doh_template: &str) -> Result<(), String> {
    let script = format!(
        "Set-DnsClientDohServerAddress -ServerAddress '{}' -DohTemplate '{}' -AllowFallbackToUdp $true -AutoUpgrade $true -ErrorAction SilentlyContinue",
        ip, doh_template
    );
    let res = exec::run("powershell.exe", &["-NoProfile", "-Command", &script]);
    if res.ok {
        Ok(())
    } else {
        Err(res.stderr)
    }
}
