//! تست یکپارچه‌ی لایه‌ی ذخیره‌سازی — معادل `tests/store.test.js` نسخه‌ی Electron.
//!
//! همه‌ی مراحل در یک تست اجرا می‌شوند چون پوشه‌ی داده از طریق متغیر محیطی تعیین
//! می‌شود و متغیر محیطی سراسری است.

use std::fs;
use std::path::PathBuf;

use dns_switcher_lib::store::{self, dns_list, profiles, seed, settings};
use serde_json::json;

/// پوشه‌ی موقت مخصوص تست تا داده‌ی واقعی کاربر دست نخورد
fn use_temp_data_dir() -> PathBuf {
    let dir = std::env::temp_dir().join(format!("dnssw-rust-test-{}", std::process::id()));
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(&dir).expect("temp dir");
    std::env::set_var(store::DATA_DIR_ENV, &dir);
    dir
}

fn name_of(id: &str) -> String {
    dns_list::get_dns_list()
        .into_iter()
        .find(|entry| entry.id == id)
        .map(|entry| entry.name)
        .unwrap_or_default()
}

fn profile_id_of(id: &str) -> String {
    dns_list::get_dns_list()
        .into_iter()
        .find(|entry| entry.id == id)
        .map(|entry| entry.profile_id)
        .unwrap_or_default()
}

#[test]
fn store_crud_round_trip() {
    let dir = use_temp_data_dir();

    // ---------- کیت‌های منتخب ----------
    let added = seed::ensure_curated_seed();
    assert!(added > 20, "curated seed added {added}");
    assert_eq!(seed::ensure_curated_seed(), 0, "must not seed twice");

    let list = profiles::get_profiles();
    for id in ["general", "global", "gaming", "dev"] {
        assert!(list.iter().any(|p| p.id == id), "missing profile {id}");
    }

    // ---------- CRUD کیت‌ها ----------
    let before = dns_list::get_dns_list().len();
    let item = dns_list::add_dns(&json!({
        "name": "Test DNS",
        "primary": "1.2.3.4",
        "secondary": "5.6.7.8",
    }));
    assert!(item.id.starts_with("dns-"), "id assigned: {}", item.id);
    assert_eq!(dns_list::get_dns_list().len(), before + 1);
    assert_eq!(name_of(&item.id), "Test DNS");

    dns_list::update_dns(&item.id, &json!({ "name": "Renamed" }));
    assert_eq!(name_of(&item.id), "Renamed");

    assert!(dns_list::delete_dns(&item.id));
    assert!(!dns_list::delete_dns(&item.id));
    assert_eq!(dns_list::get_dns_list().len(), before);

    // ورودی بدون DNS اصلی ذخیره نمی‌شود
    let ghost = dns_list::add_dns(&json!({ "name": "No Address" }));
    assert!(dns_list::get_dns_list().iter().all(|d| d.id != ghost.id));

    // ---------- تنظیمات ----------
    settings::save_settings(&json!({ "theme": "light" }));
    assert_eq!(settings::get_settings()["theme"], json!("light"));
    settings::save_settings(&json!({ "lang": "fa" }));
    assert_eq!(settings::get_settings()["theme"], json!("light"));
    assert_eq!(settings::get_settings()["lang"], json!("fa"));

    // ---------- پروفایل‌ها ----------
    let created = profiles::add_profile(Some("Work".into()), Some("💼".into()), None);
    assert!(created.id.starts_with("p-"));
    assert!(created.color.starts_with('#'), "colour: {}", created.color);

    profiles::update_profile(&created.id, &json!({ "name": "Work2" }));
    let renamed = profiles::get_profiles()
        .into_iter()
        .find(|p| p.id == created.id)
        .expect("profile kept");
    assert_eq!(renamed.name, "Work2");

    // حذف پروفایل، کیت‌هایش را به «عمومی» منتقل می‌کند — همه‌ی فولدرها حذف‌شدنی‌اند به‌جز «عمومی»
    let moved = dns_list::add_dns(&json!({
        "name": "PDNS",
        "primary": "9.9.9.9",
        "profileId": created.id,
    }));
    assert!(profiles::delete_profile(&created.id));
    assert!(!profiles::delete_profile(&created.id));
    assert!(!profiles::delete_profile("general"), "general is protected");
    assert_eq!(profile_id_of(&moved.id), "general");

    // فولدر پیش‌فرض غیر از «عمومی» هم قابل حذف است و کیت‌هایش به «عمومی» می‌رود
    let iran_kit = dns_list::add_dns(&json!({
        "name": "IranKit",
        "primary": "4.4.4.4",
        "profileId": "iran",
    }));
    assert!(profiles::delete_profile("iran"), "builtin folder deletable");
    assert_eq!(profile_id_of(&iran_kit.id), "general");
    // اگر seed دوباره اجرا شود، دوباره ساخته می‌شود (رفتار مطلوب)
    assert!(profiles::get_profiles().iter().all(|p| p.id != "iran"));

    // ---------- مرتب‌سازی و پاک‌سازی ----------
    let first = dns_list::add_dns(&json!({ "name": "A", "primary": "1.1.1.1" }));
    let second = dns_list::add_dns(&json!({ "name": "B", "primary": "2.2.2.2" }));
    let total = dns_list::get_dns_list().len();

    // ترتیب داده‌شده به ابتدای لیست می‌آید و بقیه پشت سرش می‌مانند
    let reordered = dns_list::reorder_dns_list(vec![second.id.clone(), first.id.clone()]);
    assert_eq!(reordered.len(), total, "no entry may be lost while reordering");
    assert_eq!(reordered[0].name, "B");
    assert_eq!(reordered[1].name, "A");

    // شناسه‌های ناشناخته نادیده گرفته می‌شوند و کیت‌ها از دست نمی‌روند
    let partial = dns_list::reorder_dns_list(vec!["nope".into(), first.id.clone()]);
    assert_eq!(partial.len(), total);
    assert_eq!(partial[0].name, "A");
    assert_eq!(partial[1].name, "B");

    assert!(dns_list::clear_dns_list().is_empty());
    assert_eq!(dns_list::get_dns_list().len(), 0);

    // ---------- مرتب‌سازی فولدرها (درگ) ----------
    let folder_a = profiles::add_profile(Some("FolderA".into()), None, None);
    let folder_b = profiles::add_profile(Some("FolderB".into()), None, None);
    let _id_of = |name: &str| -> String {
        profiles::get_profiles()
            .into_iter()
            .find(|p| p.name == name)
            .map(|p| p.id)
            .unwrap_or_default()
    };
    let order = || -> Vec<String> { profiles::get_profiles().into_iter().map(|p| p.id).collect() };

    // قرارداد: [شناسه‌ی درگ‌شده، نشانگر جایگاه] — before: یعنی قبل از لنگر بنشیند
    let _ = profiles::reorder_profiles(vec![folder_a.id.clone(), "before:general".into()]);
    let new_order = order();
    let general_pos = new_order.iter().position(|i| i == "general").unwrap();
    assert!(general_pos > 0);
    assert_eq!(new_order[general_pos - 1], folder_a.id, "dragged folder sits right before general");

    // after: یعنی بلافاصله بعد از لنگر
    let _ = profiles::reorder_profiles(vec![folder_b.id.clone(), "after:general".into()]);
    let new_order = order();
    let general_pos = new_order.iter().position(|i| i == "general").unwrap();
    assert!(general_pos + 1 < new_order.len());
    assert_eq!(new_order[general_pos + 1], folder_b.id, "dragged folder sits right after general");

    // ترتیب مستقیم بر اساس لیست کامل شناسه‌ها
    let direct_reorder = vec![folder_b.id.clone(), folder_a.id.clone()];
    let reordered_direct = profiles::reorder_profiles(direct_reorder);
    assert_eq!(reordered_direct[0].id, folder_b.id);
    assert_eq!(reordered_direct[1].id, folder_a.id);

    // نشانگرهای ناشناس هیچ فولدری را گم نمی‌کنند
    let count = order().len();
    let reordered = profiles::reorder_profiles(vec!["nope".into(), "before:ghost".into()]);
    assert_eq!(reordered.len(), count, "no folder lost with unknown markers");
    assert!(order().contains(&folder_a.id) && order().contains(&folder_b.id));

    // پاک‌سازی فولدرهای تستی
    assert!(profiles::delete_profile(&folder_a.id));
    assert!(profiles::delete_profile(&folder_b.id));

    let _ = fs::remove_dir_all(dir);
}
