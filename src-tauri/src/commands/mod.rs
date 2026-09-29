//! فرمان‌های Tauri — همان قرارداد کانال‌های `ipc.js`
//!
//! سه گروه، هر کدام یک فایل: `dns` سرویس شبکه، `store_cmds` ذخیره‌سازی و
//! `app_cmds` اطلاعات و باز کردن لینک‌ها.

pub mod app_cmds;
pub mod dns;
pub mod store_cmds;
