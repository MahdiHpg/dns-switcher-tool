'use strict';

/**
 * فرهنگ لغات و سیستم چندزبانه (فارسی و انگلیسی)
 */

export const I18N = {
  appName: { fa: 'DNS Switcher', en: 'DNS Switcher' },
  appTagline: { fa: 'سوییچر سریع DNS', en: 'Fast DNS switching' },
  interfaces: { fa: 'رابط‌های شبکه', en: 'Network adapters' },
  loading: { fa: 'در حال بارگذاری…', en: 'Loading…' },
  flushDns: { fa: 'پاک‌سازی کش DNS', en: 'Flush DNS cache' },
  settings: { fa: 'تنظیمات', en: 'Settings' },
  manageDns: { fa: 'مدیریت DNS', en: 'DNS Manager' },
  import: { fa: 'وارد کردن', en: 'Import' },
  addDns: { fa: 'افزودن DNS', en: 'Add DNS' },
  chooseLabel: { fa: 'انتخاب سرور DNS', en: 'Choose DNS server' },
  apply: { fa: 'تنظیم کن', en: 'Apply' },
  clearDns: { fa: 'پاکسازی DNS', en: 'Clear DNS' },
  applyHint: {
    fa: 'اول کارت‌های شبکه رو از سمت راست تیک بزن، بعد «تنظیم کن» رو بزن. اگه ادمین نباشی یه بار پنجره‌ی UAC میاد.',
    en: 'Tick the network adapters in the sidebar, then press Apply. If you are not admin, a UAC prompt appears once.',
  },
  savedList: { fa: 'لیست ذخیره‌شده', en: 'Saved list' },
  searchPh: { fa: 'جستجو…', en: 'Search…' },
  profiles: { fa: 'پروفایل‌ها', en: 'Profiles' },
  profilesTitle: { fa: 'مدیریت پروفایل‌ها', en: 'Manage profiles' },
  profilesNote: {
    fa: 'حذف فولدر، DNSهای آن را به فولدر «عمومی» منتقل می‌کند. فقط فولدر «عمومی» حذف‌شدنی نیست؛ راست‌کلیک روی هر فولدر برای تغییر نام، آیکون یا حذف. برای مرتب‌سازی، ردیف‌ها را از دسته‌ی ⠿ بکشید.',
    en: 'Deleting a folder moves its DNS entries to General. Only General cannot be deleted; right-click any folder to rename, change icon or delete.',
  },
  newProfilePh: { fa: 'نام پروفایل جدید', en: 'New profile name' },
  clearList: { fa: 'پاکسازی لیست', en: 'Clear list' },
  confirmClearList: {
    fa: 'کل لیست DNSها پاک شود؟ (بازگردانی از دکمه‌ی تنظیمات ممکن است)',
    en: 'Clear the whole DNS list? (You can restore defaults from Settings)',
  },
  listCleared: { fa: 'لیست پاک شد', en: 'List cleared' },
  settingsTitle: { fa: 'تنظیمات سیستم و ظاهر', en: 'System & Appearance' },
  accentColor: { fa: 'رنگ اصلی پوسته', en: 'Accent color' },
  textColor: { fa: 'رنگ متن‌ها', en: 'Text color' },
  fontSize: { fa: 'اندازه فونت', en: 'Font size' },
  fontFamily: { fa: 'فونت', en: 'Font family' },
  animations: { fa: 'انیمیشن‌ها فعال باشد', en: 'Enable animations' },
  compact: { fa: 'حالت فشرده', en: 'Compact mode' },
  reset: { fa: 'پیش‌فرض', en: 'Reset' },
  restoreSeed: { fa: 'بازگردانی DNSهای پیش‌فرض', en: 'Restore default DNS kits' },
  seedRestored: { fa: 'DNSهای پیش‌فرض بازگردانی شد', en: 'Default kits restored' },
  dragHint: {
    fa: 'برای مرتب‌سازی، ردیف‌ها رو با ماوس بکش و جابه‌جا کن — DNS را روی فولدر بکش تا منتقل شود',
    en: 'Drag rows to reorder — drag a DNS onto a folder to move it',
  },
  dnsMoved: { fa: '«{name}» به فولدر «{folder}» منتقل شد', en: '“{name}” moved to “{folder}”' },
  sortingDisabledSearch: { fa: 'حین جستجو، جابه‌جایی غیرفعال است', en: 'Reordering is disabled while searching' },
  dnsReordered: { fa: 'ترتیب DNSها ذخیره شد', en: 'DNS order saved' },
  ready: { fa: 'آماده', en: 'Ready' },
  addDnsTitle: { fa: 'افزودن DNS جدید', en: 'Add new DNS' },
  editDnsTitle: { fa: 'ویرایش DNS', en: 'Edit DNS' },
  fieldName: { fa: 'نام', en: 'Name' },
  profile: { fa: 'پروفایل', en: 'Profile' },
  cancel: { fa: 'انصراف', en: 'Cancel' },
  save: { fa: 'ذخیره', en: 'Save' },
  delete: { fa: 'حذف', en: 'Delete' },
  edit: { fa: 'ویرایش', en: 'Edit' },
  done: { fa: 'تمام', en: 'Done' },
  all: { fa: 'همه', en: 'All' },
  emptyList: { fa: 'هنوز DNS ای اضافه نشده. از دکمه‌ی بالا اضافه کن.', en: 'No DNS yet. Add one from the button above.' },
  noMatch: { fa: 'نتیجه‌ای پیدا نشد.', en: 'No match found.' },
  noAdapters: { fa: 'کارت شبکه‌ای پیدا نشد', en: 'No adapters found' },
  uacHint: { fa: 'در پنجره‌ی UAC تأیید کن…', en: 'Confirm the UAC prompt…' },
  uacCanceled: { fa: 'عملیات لغو شد (UAC تأیید نشد).', en: 'Operation canceled (UAC declined).' },
  applying: { fa: 'در حال تنظیم DNS…', en: 'Applying DNS…' },
  clearing: { fa: 'در حال پاکسازی DNS…', en: 'Clearing DNS…' },
  flushing: { fa: 'در حال پاک‌سازی کش…', en: 'Flushing cache…' },
  flushed: { fa: 'کش DNS پاک شد ✅', en: 'DNS cache flushed ✅' },
  applied: { fa: 'DNS با موفقیت تنظیم شد', en: 'DNS applied successfully' },
  cleared: { fa: 'DNS پاکسازی شد (خودکار/DHCP)', en: 'DNS cleared (auto/DHCP)' },
  applyErr: { fa: 'خطا در تنظیم DNS', en: 'Failed to apply DNS' },
  clearErr: { fa: 'خطا در پاکسازی DNS', en: 'Failed to clear DNS' },
  needDns: { fa: 'اول یه DNS انتخاب کن', en: 'Select a DNS first' },
  needAdapter: { fa: 'حداقل یه کارت شبکه انتخاب کن', en: 'Select at least one adapter' },
  chooseFirst: { fa: 'انتخاب کن…', en: 'Choose…' },
  confirmDelete: { fa: 'این DNS حذف شود؟', en: 'Delete this DNS?' },
  confirmDeleteProfile: { fa: 'این پروفایل حذف شود؟ DNSهایش به «عمومی» منتقل می‌شوند.', en: 'Delete this profile? Its DNS entries move to General.' },
  deleted: { fa: 'حذف شد', en: 'Deleted' },
  saved: { fa: 'ذخیره شد ✅', en: 'Saved ✅' },
  invalidIp: { fa: 'آی‌پی معتبر نیست', en: 'Invalid IP address' },
  nameRequired: { fa: 'نام لازم است', en: 'Name is required' },
  activeOn: { fa: 'فعال روی', en: 'Active on' },
  retry: { fa: 'تلاش دوباره', en: 'Retry' },
  folders: { fa: 'فولدرها', en: 'Folders' },
  removeFolder: { fa: 'حذف فولدر', en: 'Remove folder' },
  renameFolder: { fa: 'تغییر نام فولدر', en: 'Rename folder' },
  changeIcon: { fa: 'تغییر آیکون', en: 'Change icon' },
  chooseIcon: { fa: 'انتخاب آیکون', en: 'Choose icon' },
  confirmDeleteFolder: {
    fa: 'فولدر «{name}» حذف شود؟ {n} DNS آن به فولدر «عمومی» منتقل می‌شود.',
    en: 'Delete folder “{name}”? Its {n} DNS entries will move to General.',
  },
  folderDeleted: { fa: 'فولدر حذف شد', en: 'Folder deleted' },
  folderRenamed: { fa: 'نام فولدر تغییر کرد', en: 'Folder renamed' },
  iconUpdated: { fa: 'آیکون به‌روزرسانی شد', en: 'Icon updated' },
  folderReordered: { fa: 'ترتیب فولدرها ذخیره شد', en: 'Folder order saved' },
  newFolderNamePh: { fa: 'نام جدید فولدر…', en: 'New folder name…' },

  // کلیدهای جدید اضافه شده
  checkSanctions: { fa: 'تست تحریم‌ها 🩺', en: 'Sanctions Check 🩺' },
  fastestDns: { fa: 'سریع‌ترین', en: 'Fastest' },
  testPing: { fa: 'تست پینگ', en: 'Test Ping' },
  reachabilityTitle: { fa: '🩺 وضعیت دسترسی به سرویس‌های تحریم‌شده', en: '🩺 Sanctions & Reachability Status' },
  reachabilityDesc: {
    fa: 'بررسی زنده و مستقیم اتصال به سرورهای تحریم‌شده با DNS فعال فعلی:',
    en: 'Real-time test of connection to sanctioned servers using the active DNS:',
  },
  recheck: { fa: 'بررسی مجدد', en: 'Recheck' },
  advancedSettings: { fa: 'تنظیمات پیشرفته (IPv6 و DoH)', en: 'Advanced (IPv6 & DoH)' },
  autostart: { fa: 'اجرا هنگام بالا آمدن ویندوز (Autostart)', en: 'Start with Windows (Autostart)' },
  exportBackup: { fa: 'پشتیبان‌گیری (Export)', en: 'Export Backup' },
  importBackup: { fa: 'بازگردانی (Import)', en: 'Import Backup' },
  syncOnline: { fa: 'دریافت آنلاین', en: 'Sync Online' },
  backupExported: { fa: 'فایل پشتیبان با موفقیت صادر شد ✅', en: 'Backup exported successfully ✅' },
  backupImported: { fa: 'تعداد {n} کیت DNS از پشتیبان افزوده شد ✅', en: '{n} DNS entries imported from backup ✅' },
  syncSuccess: { fa: 'تعداد {n} کیت از سرور آنلاین دریافت شد ✅', en: '{n} entries synced from online URL ✅' },
  testingPing: { fa: 'در حال سنجش پینگ سرورها…', en: 'Pinging DNS servers…' },
  fastestApplied: { fa: '«{name}» با تأخیر {ms}ms به‌عنوان سریع‌ترین انتخاب شد ⚡', en: '“{name}” ({ms}ms) selected as fastest ⚡' },
  noDnsToPing: { fa: 'سروری برای تست پینگ وجود ندارد', en: 'No DNS servers to ping' },
  urlRequired: { fa: 'آدرس URL لازم است', en: 'URL is required' },
};

let currentLang = 'fa';

export const getLang = () => currentLang;

export const setLang = (lang) => {
  currentLang = lang === 'en' ? 'en' : 'fa';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
  const tag = document.querySelector('#langTag');
  if (tag) tag.textContent = currentLang === 'fa' ? 'EN' : 'فا';
  applyI18n();
};

export const t = (key, params = {}) => {
  const entry = I18N[key];
  let text = (entry && entry[currentLang]) || (entry && entry.fa) || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return text;
};

export const applyI18n = () => {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    const key = el.getAttribute('data-i18n-ph');
    el.setAttribute('placeholder', t(key));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });
};
