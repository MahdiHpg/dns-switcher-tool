//! اجرای فرمان‌های ویندوز بدون چشمک‌زدن پنجره‌ی کنسول

use std::os::windows::process::CommandExt;
use std::process::Command;

/// پرچم `CreateProcess` برای مخفی‌کردن کنسول
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

pub struct ExecResult {
    pub ok: bool,
    pub code: i32,
    pub stdout: String,
    pub stderr: String,
}

pub fn run(program: &str, args: &[&str]) -> ExecResult {
    let output = Command::new(program)
        .args(args)
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    match output {
        Ok(output) => ExecResult {
            ok: output.status.success(),
            code: output.status.code().unwrap_or(1),
            stdout: String::from_utf8_lossy(&output.stdout).into_owned(),
            stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
        },
        Err(error) => ExecResult {
            ok: false,
            code: 1,
            stdout: String::new(),
            stderr: error.to_string(),
        },
    }
}
