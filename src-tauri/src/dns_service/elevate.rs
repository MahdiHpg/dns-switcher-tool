//! اجرای عملیات netsh با یک‌بار درخواست UAC
//!
//! اسکریپت موقت با BOM یونیکد ذخیره می‌شود چون PowerShell 5.1 فایل ps1 بدون BOM را
//! ANSI می‌خواند و نام آداپتورهای فارسی خراب می‌شود.

use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;
use serde_json::{json, Value};

use super::exec;

const PS: &str = "powershell.exe";
const BOM: [u8; 3] = [0xEF, 0xBB, 0xBF];
/// کد خروجی وقتی کاربر پنجره‌ی UAC را لغو می‌کند
const UAC_CANCELED_CODE: i32 = 4242;

#[derive(Clone, Copy)]
pub enum OpKind {
    Set,
    Add,
    Delete,
}

pub struct DnsOp {
    pub kind: OpKind,
    pub iface: String,
    pub ip: String,
}

/// نتیجه‌ی اجرا — دقیقاً همان شکلی که UI انتظار دارد
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ElevatedResult {
    pub ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub log: Option<Vec<Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub canceled: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl ElevatedResult {
    pub fn error(message: impl Into<String>) -> Self {
        Self {
            ok: false,
            error: Some(message.into()),
            log: None,
            canceled: None,
        }
    }

    fn canceled() -> Self {
        Self {
            ok: false,
            canceled: Some(true),
            log: None,
            error: None,
        }
    }

    fn done(log: Vec<Value>) -> Self {
        Self {
            ok: true,
            log: Some(log),
            canceled: None,
            error: None,
        }
    }
}

fn ps_quote(value: &str) -> String {
    value.replace('\'', "''")
}

fn log_json(op: &str, status: &str, iface: &str, ip: Option<&str>) -> String {
    match ip {
        Some(address) => json!({ "op": op, "status": status, "iface": iface, "ip": address }),
        None => json!({ "op": op, "status": status, "iface": iface }),
    }
    .to_string()
}

/// اسکریپت اصلی که عملیات netsh را پشت‌سرهم اجرا و لاگ JSON می‌کند
fn build_script(ops: &[DnsOp], flush: bool, out_path: &str) -> String {
    let mut lines: Vec<String> = vec![
        "$ErrorActionPreference = 'SilentlyContinue'".to_string(),
        "$script:logLines = @()".to_string(),
        "function Log([string]$s) { $script:logLines += $s }".to_string(),
    ];

    for op in ops {
        let iface = op.iface.replace('"', "");
        let iface = iface.trim();
        if iface.is_empty() {
            continue;
        }
        let is_ipv6_addr = !op.ip.is_empty() && super::validate::is_ipv6(&op.ip);
        let proto = if is_ipv6_addr { "ipv6" } else { "ipv4" };

        let (command, kind, with_ip) = match op.kind {
            OpKind::Set => (
                format!(
                    "netsh interface {proto} set dns name=\"{iface}\" source=static address={} validate=no",
                    op.ip
                ),
                "set",
                true,
            ),
            OpKind::Add => (
                format!(
                    "netsh interface {proto} add dns name=\"{iface}\" address={} index=2 validate=no",
                    op.ip
                ),
                "add",
                true,
            ),
            OpKind::Delete => (
                format!("netsh interface ipv4 delete dns name=\"{iface}\" all; netsh interface ipv6 delete dns name=\"{iface}\" all"),
                "clear",
                false,
            ),
        };
        lines.push(format!("{command} | Out-Null"));
        let address = if with_ip { Some(op.ip.as_str()) } else { None };
        let success = ps_quote(&log_json(kind, "ok", iface, address));
        let failure = ps_quote(&log_json(kind, "err", iface, address));
        lines.push(format!(
            "if ($LASTEXITCODE -eq 0) {{ Log '{success}' }} else {{ Log '{failure}' }}"
        ));
    }

    if flush {
        lines.push("ipconfig /flushdns | Out-Null".to_string());
        lines.push(format!(
            "Log '{}'",
            ps_quote(&json!({ "op": "flush", "status": "ok" }).to_string())
        ));
    }

    lines.push(format!(
        "$script:logLines | Set-Content -LiteralPath '{}' -Encoding UTF8",
        ps_quote(out_path)
    ));
    lines.push("exit 0".to_string());
    lines.join("\r\n")
}

/// لانچری که خود را با دسترسی ادمین اجرا می‌کند و کد لغو UAC را برمی‌گرداند
fn build_launcher(script_path: &str) -> String {
    [
        "$ErrorActionPreference = 'Stop'".to_string(),
        "try {".to_string(),
        format!(
            "  $p = Start-Process -FilePath 'powershell.exe' -Verb RunAs -Wait -PassThru \
             -WindowStyle Hidden -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File', '{}')",
            ps_quote(script_path)
        ),
        "  if ($p -and $p.ExitCode -ne $null) { exit $p.ExitCode }".to_string(),
        "  exit 0".to_string(),
        "} catch {".to_string(),
        format!("  exit {UAC_CANCELED_CODE}"),
        "}".to_string(),
    ]
    .join("\r\n")
}

fn write_script(path: &Path, content: &str) -> std::io::Result<()> {
    let mut bytes = BOM.to_vec();
    bytes.extend_from_slice(content.as_bytes());
    fs::write(path, bytes)
}

fn work_dir() -> PathBuf {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    std::env::temp_dir().join(format!("dnssw-{}-{}", std::process::id(), nanos))
}

fn cleanup(dir: &Path) {
    let _ = fs::remove_dir_all(dir);
}

fn strip_bom(bytes: &[u8]) -> Vec<u8> {
    if bytes.starts_with(&BOM) {
        bytes[BOM.len()..].to_vec()
    } else {
        bytes.to_vec()
    }
}

fn read_log(path: &Path) -> Vec<Value> {
    let Ok(bytes) = fs::read(path) else {
        return Vec::new();
    };
    String::from_utf8_lossy(&strip_bom(&bytes))
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .map(|line| {
            serde_json::from_str::<Value>(line)
                .unwrap_or_else(|_| json!({ "op": "raw", "status": "raw", "text": line }))
        })
        .collect()
}

pub fn run_elevated(ops: &[DnsOp], flush: bool) -> ElevatedResult {
    let dir = work_dir();
    if let Err(error) = fs::create_dir_all(&dir) {
        return ElevatedResult::error(format!("Could not create temp folder: {error}"));
    }

    let script_path = dir.join("apply.ps1");
    let out_path = dir.join("out.txt");
    let out_text = out_path.to_string_lossy().to_string();
    if let Err(error) = write_script(&script_path, &build_script(ops, flush, &out_text)) {
        cleanup(&dir);
        return ElevatedResult::error(format!("Could not write script: {error}"));
    }

    let script_text = script_path.to_string_lossy().to_string();
    let result = if super::is_admin() {
        exec::run(
            PS,
            &["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", &script_text],
        )
    } else {
        let launcher_path = dir.join("launcher.ps1");
        if let Err(error) = write_script(&launcher_path, &build_launcher(&script_text)) {
            cleanup(&dir);
            return ElevatedResult::error(format!("Could not write launcher: {error}"));
        }
        let launcher_text = launcher_path.to_string_lossy().to_string();
        exec::run(
            PS,
            &["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", &launcher_text],
        )
    };

    if result.code == UAC_CANCELED_CODE {
        cleanup(&dir);
        return ElevatedResult::canceled();
    }
    if !result.ok && !out_path.exists() {
        let detail = super::first_chars(result.stderr.trim(), 300);
        cleanup(&dir);
        return ElevatedResult::error(format!("Elevated script failed: {detail}"));
    }

    let log = read_log(&out_path);
    cleanup(&dir);
    ElevatedResult::done(log)
}
