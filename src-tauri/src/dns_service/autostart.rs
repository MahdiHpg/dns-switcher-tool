//! مدیریت شروع خودکار برنامه همراه با ویندوز از طریق رجیستری

use winreg::enums::{HKEY_CURRENT_USER, KEY_READ, KEY_WRITE};
use winreg::RegKey;

const APP_NAME: &str = "DNS Switcher";
const REG_PATH: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";

pub fn is_autostart_enabled() -> bool {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let Ok(run_key) = hkcu.open_subkey_with_flags(REG_PATH, KEY_READ) else {
        return false;
    };
    run_key.get_value::<String, _>(APP_NAME).is_ok()
}

pub fn set_autostart(enable: bool) -> Result<(), String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let run_key = hkcu
        .open_subkey_with_flags(REG_PATH, KEY_WRITE)
        .map_err(|e| e.to_string())?;

    if enable {
        let exe = std::env::current_exe().map_err(|e| e.to_string())?;
        let exe_str = format!("\"{}\"", exe.to_string_lossy());
        run_key
            .set_value(APP_NAME, &exe_str)
            .map_err(|e| e.to_string())?;
    } else {
        let _ = run_key.delete_value(APP_NAME);
    }
    Ok(())
}
