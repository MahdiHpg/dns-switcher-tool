'use strict';

const $ = (sel) => document.querySelector(sel);

// ---------- i18n ----------
const I18N = {
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
    en: 'Deleting a folder moves its DNS entries to the General folder. Only General cannot be deleted; right-click any folder to rename it, change its icon, or delete it. Drag rows by the ⠿ handle to reorder them.',
  },
  newProfilePh: { fa: 'نام پروفایل جدید', en: 'New profile name' },
  clearList: { fa: 'پاکسازی لیست', en: 'Clear list' },
  confirmClearList: {
    fa: 'کل لیست DNSها پاک شود؟ (بازگردانی از دکمه‌ی تنظیمات ممکن است)',
    en: 'Clear the whole DNS list? (You can restore defaults from Settings)',
  },
  listCleared: { fa: 'لیست پاک شد', en: 'List cleared' },
  settingsTitle: { fa: 'تنظیمات ظاهری', en: 'Appearance settings' },
  accentColor: { fa: 'رنگ اصلی پوسته', en: 'Accent color' },
  textColor: { fa: 'رنگ متن‌ها', en: 'Text color' },
  fontSize: { fa: 'اندازه فونت', en: 'Font size' },
  fontFamily: { fa: 'فونت', en: 'Font family' },
  animations: { fa: 'انیمیشن‌ها فعال باشد', en: 'Enable animations' },
  compact: { fa: 'حالت فشرده', en: 'Compact mode' },
  reset: { fa: 'پیش‌فرض', en: 'Reset' },
  restoreSeed: { fa: 'بازگردانی DNSهای پیش‌فرض', en: 'Restore default DNS kits' },
  seedRestored: { fa: 'DNSهای پیش‌فرض بازگردانی شد', en: 'Default kits restored' },
  dragHint: { fa: 'برای مرتب‌سازی، ردیف‌ها رو با ماوس بکش و جابه‌جا کن — DNS را روی فولدر بکش تا منتقل شود', en: 'Drag rows to reorder — drag a DNS onto a folder to move it' },
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
    en: 'Delete folder “{name}”? Its {n} DNS entries will move to the General folder.',
  },
  folderDeleted: { fa: 'فولدر حذف شد', en: 'Folder deleted' },
  folderRenamed: { fa: 'نام فولدر تغییر کرد', en: 'Folder renamed' },
  iconUpdated: { fa: 'آیکون به‌روزرسانی شد', en: 'Icon updated' },
  folderReordered: { fa: 'ترتیب فولدرها ذخیره شد', en: 'Folder order saved' },
  newFolderNamePh: { fa: 'نام جدید فولدر…', en: 'New folder name…' },
  generalLocked: { fa: 'فولدر «عمومی» حذف‌شدنی نیست', en: 'The General folder cannot be deleted' },
  language: { fa: 'زبان', en: 'Language' },
  langFa: { fa: 'فارسی', en: 'Persian' },
  langEn: { fa: 'انگلیسی', en: 'English' },
  switchTo: { fa: 'تغییر به {lang}', en: 'Switch to {lang}' },
  theme: { fa: 'پوسته', en: 'Theme' },
  close: { fa: 'بستن', en: 'Close' },
  color: { fa: 'رنگ', en: 'Color' },
  primaryDns: { fa: 'DNS اصلی', en: 'Primary DNS' },
  secondaryDns: { fa: 'DNS ثانویه', en: 'Secondary DNS' },
  fontVazir: { fa: 'وزیرمتن (پیش‌فرض)', en: 'Vazirmatn (default)' },
  fontIranSans: { fa: 'ایران‌سنس (سیستمی)', en: 'IRANSans (system)' },
  namePh: { fa: 'مثلاً: شکن', en: 'e.g. Shekan' },
  imported: { fa: '{n} DNS وارد شد ✅', en: '{n} DNS imported ✅' },
  noImport: { fa: 'هیچ DNS جدیدی در فایل پیدا نشد', en: 'No new DNS found in file(s)' },
  openLinkErr: { fa: 'باز کردن لینک ناموفق بود: {err}', en: 'Could not open link: {err}' },
  profileDeleteBlocked: { fa: 'پروفایل پیش‌فرض حذف‌شدنی نیست', en: 'Default profile cannot be deleted' },
  about: { fa: 'ساخته‌شده با هوش مصنوعی GLM 5.3 Flash • دیپلوی توسط', en: 'Crafted with GLM 5.3 Flash AI • Deployed by' },
};

const LANGS = ['fa', 'en'];
const DEFAULT_LANG = 'fa';

let lang = DEFAULT_LANG;

function normalizeLang(value) {
  return LANGS.includes(value) ? value : DEFAULT_LANG;
}

function dirOf(code) {
  return code === 'fa' ? 'rtl' : 'ltr';
}

function langName(code) {
  return t(code === 'fa' ? 'langFa' : 'langEn');
}

/** `t('imported', { n: 3 })` — جایگزینی `{placeholder}` در متن ترجمه‌شده */
function t(key, vars) {
  const item = I18N[key];
  let out = item ? item[lang] || item[DEFAULT_LANG] : key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      out = out.split(`{${name}}`).join(String(value));
    }
  }
  return out;
}

function applyI18n() {
  document.documentElement.lang = lang;
  document.documentElement.dir = dirOf(lang);
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
}

function syncLangControls() {
  const other = lang === 'fa' ? 'en' : 'fa';
  const tag = document.getElementById('langTag');
  if (tag) tag.textContent = other === 'en' ? 'EN' : 'Fa';
  const toggle = document.getElementById('langToggle');
  if (toggle) toggle.title = t('switchTo', { lang: langName(other) });
  document.querySelectorAll('#langSeg .seg-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/** زبان را عوض می‌کند: جهت صفحه، متن‌های ثابت و بخش‌های پویا را تازه می‌کند و ذخیره می‌کند */
async function setLang(next, persist = true) {
  const code = normalizeLang(next);
  if (code === lang && document.documentElement.dir === dirOf(code)) return;
  lang = code;
  applyI18n();
  syncLangControls();
  if (!statusBusy) status(t('ready'), false);
  renderAbout();
  renderAdapters();
  renderAll();
  if (!$('#modal').classList.contains('hidden')) {
    $('#modalTitle').textContent = editingId ? t('editDnsTitle') : t('addDnsTitle');
  }
  if (!$('#profilesModal').classList.contains('hidden')) renderProfilesList();
  if (persist) await window.api.saveSettings({ lang: code });
}

// ---------- state ----------
let dnsList = [];
let profiles = [];
let selectedDnsId = null;
let currentProfile = 'all';
let adapters = [];
let selectedAdapters = new Set();
let editingId = null;
let appInfo = null;
let dragState = null; // { type: 'dns'|'folder-chip'|'folder-row', id: string }
let statusBusy = false;
let dropLineEl = null;

// ---------- utils ----------
const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
function isValidIp(ip) {
  const m = IPV4_RE.exec(String(ip || '').trim());
  return !!m && m.slice(1).every((o) => Number(o) <= 255);
}

function status(msg, busy) {
  statusBusy = !!busy;
  $('#statusText').textContent = msg;
  $('#spinner').classList.toggle('hidden', !busy);
}

function toast(msg, kind = 'ok') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = `toast ${kind}`;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), 2600);
}

function fmtIps(d) {
  const parts = [d.primary];
  if (d.secondary) parts.push(d.secondary);
  return parts.filter(Boolean).join(' , ');
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function profileOf(id) {
  return profiles.find((p) => p.id === id) || profiles.find((p) => p.id === 'general') || { name: '—', icon: '📁' };
}

// ---------- appearance settings ----------
async function applyAppearance(s) {
  const root = document.documentElement;
  if (s.accent) root.style.setProperty('--accent', s.accent);
  if (s.text) root.style.setProperty('--text', s.text);
  // font size slider (12..18) maps to a scale factor around the 14px design size
  root.style.setProperty('--font-scale', String((s.fontSize || 14) / 14));
  root.style.setProperty('--app-font', `'${s.fontFamily || 'Vazirmatn'}', "Vazirmatn", "Segoe UI", Tahoma, sans-serif`);
  root.classList.toggle('no-anim', s.animations === false);
  root.classList.toggle('compact', !!s.compact);
}

async function initAppearance(s) {
  document.documentElement.dataset.theme = s.theme || 'dark';
  await applyAppearance(s);

  $('#themeToggle').addEventListener('click', async () => {
    const cur = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    await window.api.saveSettings({ theme: next });
  });

  // settings modal controls
  $('#sAccent').value = s.accent || '#6366f1';
  $('#sText').value = s.text || '#e6ebf4';
  $('#sFont').value = s.fontSize || 14;
  $('#sFontVal').textContent = s.fontSize || 14;
  $('#sFontFamily').value = s.fontFamily || 'Vazirmatn';
  $('#sAnim').checked = s.animations !== false;
  $('#sCompact').checked = !!s.compact;

  $('#sAccent').addEventListener('input', async (e) => {
    document.documentElement.style.setProperty('--accent', e.target.value);
    await window.api.saveSettings({ accent: e.target.value });
  });
  $('#sAccentReset').addEventListener('click', async () => {
    $('#sAccent').value = '#6366f1';
    document.documentElement.style.removeProperty('--accent');
    await window.api.saveSettings({ accent: '' });
  });
  $('#sText').addEventListener('input', async (e) => {
    document.documentElement.style.setProperty('--text', e.target.value);
    await window.api.saveSettings({ text: e.target.value });
  });
  $('#sTextReset').addEventListener('click', async () => {
    $('#sText').value = '#e6ebf4';
    document.documentElement.style.removeProperty('--text');
    await window.api.saveSettings({ text: '' });
  });
  $('#sFont').addEventListener('input', async (e) => {
    $('#sFontVal').textContent = e.target.value;
    document.documentElement.style.setProperty('--font-scale', String(Number(e.target.value) / 14));
    await window.api.saveSettings({ fontSize: Number(e.target.value) });
  });
  $('#sFontFamily').addEventListener('change', async (e) => {
    document.documentElement.style.setProperty('--app-font', `'${e.target.value}', "Vazirmatn", "Segoe UI", Tahoma, sans-serif`);
    await window.api.saveSettings({ fontFamily: e.target.value });
  });
  $('#sAnim').addEventListener('change', async (e) => {
    document.documentElement.classList.toggle('no-anim', !e.target.checked);
    await window.api.saveSettings({ animations: e.target.checked });
  });
  $('#sCompact').addEventListener('change', async (e) => {
    document.documentElement.classList.toggle('compact', e.target.checked);
    await window.api.saveSettings({ compact: e.target.checked });
  });
  $('#sRestoreSeed').addEventListener('click', async () => {
    const r = await window.api.restoreSeed();
    if (r && r.added >= 0) {
      await loadAllData();
      renderAll();
      toast(t('seedRestored'));
    }
  });
}

// ---------- adapters ----------
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_res, rej) => setTimeout(() => rej(new Error(label || 'timeout')), ms)),
  ]);
}

async function loadAdapters(silent) {
  if (!silent) {
    status(t('loading'), true);
    $('#adapterList').innerHTML = `<div class="dd-empty">${t('loading')}</div>`;
  }
  try {
    const r = await withTimeout(window.api.getAdapters(), 30000, 'PowerShell timeout');
    if (!r.ok) throw new Error(r.error || 'unknown');
    adapters = r.adapters;
    const names = new Set(adapters.map((a) => a.name));
    for (const n of Array.from(selectedAdapters)) if (!names.has(n)) selectedAdapters.delete(n);
    if (selectedAdapters.size === 0) {
      adapters.filter((a) => a.connected).forEach((a) => selectedAdapters.add(a.name));
    }
    renderAdapters();
    renderDnsList();
  } catch (e) {
    if (!silent || adapters.length === 0) {
      const msg = escapeHtml(e.message || String(e));
      $('#adapterList').innerHTML = `
        <div class="dd-empty">
          ${msg}<br /><br />
          <button class="btn btn-ghost" id="btnRetryAdapters">⟳ ${t('retry')}</button>
        </div>`;
      document.getElementById('btnRetryAdapters')?.addEventListener('click', () => loadAdapters(false));
    }
  } finally {
    if (!silent) status(t('ready'), false);
  }
}

function renderAdapters() {
  const box = $('#adapterList');
  if (!adapters.length) {
    box.innerHTML = `<div class="dd-empty">${t('noAdapters')}</div>`;
    return;
  }
  box.innerHTML = '';
  for (const a of adapters) {
    const div = document.createElement('div');
    div.className = 'adapter-item' + (selectedAdapters.has(a.name) ? ' selected' : '');
    const ips = (a.dns || []).join(' , ');
    div.innerHTML = `
      <div class="adapter-check">✓</div>
      <div class="adapter-info">
        <div class="adapter-name"></div>
        ${ips ? `<div class="adapter-current">${escapeHtml(ips)}</div>` : ''}
      </div>
      <div class="adapter-dot ${a.connected ? 'up' : ''}" title="${escapeHtml(a.status || '')}"></div>
    `;
    div.querySelector('.adapter-name').textContent = a.name;
    div.title = a.description || a.name;
    div.addEventListener('click', () => {
      if (selectedAdapters.has(a.name)) selectedAdapters.delete(a.name);
      else selectedAdapters.add(a.name);
      renderAdapters();
    });
    box.appendChild(div);
  }
}

// ---------- dropdown ----------
let ddMenuEl = null;
let ddBtnEl = null;

function closeDropdown() {
  if (ddMenuEl) ddMenuEl.classList.add('hidden');
  if (ddBtnEl) ddBtnEl.classList.remove('open');
}

function renderDropdown() {
  const root = $('#ddRoot');
  const sel = dnsList.find((d) => d.id === selectedDnsId);
  root.innerHTML = '';
  ddMenuEl = null;
  ddBtnEl = null;

  const wrap = document.createElement('div');
  wrap.className = 'dropdown';

  const btn = document.createElement('button');
  btn.className = 'dd-btn';
  btn.type = 'button';
  const selColor = sel ? profileOf(sel.profileId).color || 'var(--accent)' : 'var(--accent)';
  btn.innerHTML = `
    <div class="dd-avatar" style="background: ${selColor}; box-shadow: 0 6px 16px ${sel ? selColor + '66' : 'transparent'}">${sel ? escapeHtml(initials(sel.name)) : '?'}</div>
    <div class="dd-meta">
      <div class="dd-name">${sel ? escapeHtml(sel.name) : t('chooseFirst')}</div>
      <div class="dd-ips">${sel ? escapeHtml(fmtIps(sel)) : '&nbsp;'}</div>
    </div>
    <svg class="dd-caret" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
  `;

  const menu = document.createElement('div');
  menu.className = 'dd-menu hidden';

  if (!dnsList.length) {
    menu.innerHTML = `<div class="dd-empty">${t('emptyList')}</div>`;
  } else {
    for (const d of dnsList) {
      const prof = profileOf(d.profileId);
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'dd-item' + (d.id === selectedDnsId ? ' active' : '');
      const itemColor = prof.color || 'var(--accent)';
      item.innerHTML = `
        <span class="dd-item-icon" style="color: ${itemColor}">${profileIconHtml(prof)}</span>
        <div class="dd-item-name">${escapeHtml(d.name)}</div>
        <div class="dd-item-ips">${escapeHtml(fmtIps(d))}</div>
      `;
      item.addEventListener('click', () => {
        selectedDnsId = d.id;
        closeDropdown();
        renderDropdown();
        renderDnsList();
      });
      menu.appendChild(item);
    }
  }

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden') === false;
    btn.classList.toggle('open', open);
  });

  ddMenuEl = menu;
  ddBtnEl = btn;

  wrap.appendChild(btn);
  wrap.appendChild(menu);
  root.appendChild(wrap);
}

function initials(name) {
  return String(name).trim().slice(0, 2).toUpperCase();
}

// ---------- folder chips (✕ delete, drag reorder, right-click menu, icon picker) ----------
// آیکون‌ها SVG خطی‌اند: هر فولدر یک «کلید» دارد و SVG با رنگ همان فولدر (currentColor) رندر می‌شود.
// کلیدها و SVGها از بک‌اند می‌آیند (store_folder_icons / store_icon_svgs) و اینجا کش می‌شوند.
const FOLDER_ICON_KEYS_FALLBACK = [
  'folder', 'folder-open', 'globe', 'shield', 'zap', 'rocket', 'gamepad', 'laptop',
  'star', 'lock', 'home', 'flag', 'archive', 'target', 'link', 'settings',
];
let FOLDER_ICON_KEYS = [];
const ICON_SVG_CACHE = new Map(); // مقدار ذخیره‌شده (کلید یا ایموجی) → HTML آماده

function profileIconHtml(profile) {
  const raw = (profile && profile.icon) || '';
  const cached = ICON_SVG_CACHE.get(raw);
  if (cached) return cached;
  return `<span class="profile-emoji">${escapeHtml(raw)}</span>`;
}

/** کلیدها و SVGها را از بک‌اند می‌گیرد — قبل از اولین رندر فراخوانی می‌شود */
async function warmIconCache() {
  if (!window.api.folderIcons || !window.api.iconSvgs) return;
  try {
    const keys = await window.api.folderIcons();
    if (Array.isArray(keys) && keys.length) FOLDER_ICON_KEYS = keys;
    const values = new Set(FOLDER_ICON_KEYS);
    for (const p of profiles) values.add(p.icon || '');
    const list = [...values].filter(Boolean);
    const svgs = await window.api.iconSvgs(list);
    list.forEach((value, i) => { if (svgs[i]) ICON_SVG_CACHE.set(value, svgs[i]); });
  } catch {
    // بدون کش: آیکون‌ها به‌صورت متن خام/ایموجی نمایش داده می‌شوند
  }
}

let folderMenuEl = null;
let iconPickerEl = null;

function closeFolderMenu() {
  if (folderMenuEl) folderMenuEl.remove();
  folderMenuEl = null;
}

function closeIconPicker() {
  if (iconPickerEl) iconPickerEl.remove();
  iconPickerEl = null;
}

function openIconPicker(anchorEl, currentIcon, onPick) {
  closeIconPicker();
  const picker = document.createElement('div');
  picker.className = 'icon-picker';
  const title = document.createElement('div');
  title.className = 'icon-picker-title';
  title.textContent = t('chooseIcon');
  picker.appendChild(title);
  const grid = document.createElement('div');
  grid.className = 'icon-picker-grid';
  const keys = FOLDER_ICON_KEYS.length ? FOLDER_ICON_KEYS : FOLDER_ICON_KEYS_FALLBACK;
  for (const key of keys) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'icon-cell' + (key === currentIcon ? ' current' : '');
    cell.dataset.icon = key;
    cell.title = key;
    cell.innerHTML = profileIconHtml({ icon: key });
    cell.addEventListener('click', () => {
      closeIconPicker();
      onPick(key);
    });
    grid.appendChild(cell);
  }
  picker.appendChild(grid);
  document.body.appendChild(picker);
  const r = anchorEl.getBoundingClientRect();
  const pw = picker.offsetWidth, ph = picker.offsetHeight;
  picker.style.left = Math.max(8, Math.min(r.left, innerWidth - pw - 8)) + 'px';
  picker.style.top = Math.max(8, Math.min(r.bottom + 6, innerHeight - ph - 8)) + 'px';
  iconPickerEl = picker;
}

async function setProfileIcon(profile, icon) {
  await window.api.updateProfile(profile.id, { icon });
  await loadDnsData();
  renderAll();
  if (!$('#profilesModal').classList.contains('hidden')) renderProfilesList();
  toast(t('iconUpdated'));
}

function openFolderMenu(anchorEl, profile) {
  closeFolderMenu();
  closeIconPicker();
  const menu = document.createElement('div');
  menu.className = 'ctx-menu';
  const items = [
    { label: t('renameFolder'), action: () => renameFolderInline(anchorEl, profile) },
    { label: t('changeIcon'), action: () => openIconPicker(anchorEl, profile.icon, (icon) => setProfileIcon(profile, icon)) },
  ];
  if (profile.id !== 'general') {
    items.push({ danger: true, label: t('removeFolder'), action: () => deleteFolderFlow(profile) });
  } else {
    items.push({ disabled: true, label: t('generalLocked') });
  }
  for (const item of items) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ctx-item' + (item.danger ? ' danger' : '');
    btn.textContent = item.label;
    if (item.disabled) btn.disabled = true;
    else btn.addEventListener('click', () => { closeFolderMenu(); item.action(); });
    menu.appendChild(btn);
  }
  document.body.appendChild(menu);
  const r = anchorEl.getBoundingClientRect();
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  menu.style.left = Math.max(8, Math.min(r.left, innerWidth - mw - 8)) + 'px';
  menu.style.top = Math.max(8, Math.min(r.bottom + 4, innerHeight - mh - 8)) + 'px';
  folderMenuEl = menu;
}

function renameFolderInline(chipEl, profile) {
  const label = chipEl.querySelector('.chip-label');
  if (!label) return;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'chip-rename';
  input.maxLength = 40;
  input.value = profile.name;
  label.replaceWith(input);
  input.focus();
  input.select();
  let finished = false;
  const finish = async (save) => {
    if (finished) return;
    finished = true;
    const value = input.value.trim();
    input.replaceWith(label);
    if (save && value && value !== profile.name) {
      await window.api.updateProfile(profile.id, { name: value });
      await loadDnsData();
      renderAll();
      if (!$('#profilesModal').classList.contains('hidden')) renderProfilesList();
      toast(t('folderRenamed'));
    }
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    else if (e.key === 'Escape') finish(false);
  });
  input.addEventListener('blur', () => finish(true));
}

async function deleteFolderFlow(profile) {
  const count = dnsList.filter((d) => d.profileId === profile.id).length;
  if (!confirm(t('confirmDeleteFolder', { name: profile.name, n: count }))) return;
  await window.api.deleteProfile(profile.id);
  if (currentProfile === profile.id) currentProfile = 'all';
  await loadDnsData();
  renderAll();
  if (!$('#profilesModal').classList.contains('hidden')) renderProfilesList();
  toast(t('folderDeleted'));
}

let folderDragId = null;

/** درگ فولدرها را از هر دو لیست (چیپ‌ها و مودال پروفایل‌ها) مدیریت می‌کند.
 *  dragMode: 'chips' | 'rows' — هر لیست state خودش را دارد تا درگ هم‌زمان تداخل نکند */
let dragMode = null;
let rowDrop = null; // { id, before } — هدف درگ ردیف‌های مودال (به‌جای جابه‌جایی DOM حین درگ)

/** نشانگر جایگاه نسبت به نقطه‌ی وسط قطره‌گذار — در RTL جهت افقی برعکس می‌شود */
const dropIsBefore = (dropEl, clientX) => {
  const rect = dropEl.getBoundingClientRect();
  const before = (clientX - rect.left) < rect.width / 2;
  return document.documentElement.dir === 'rtl' ? !before : before;
};

const verticalDropBefore = (dropEl, clientY) => {
  const rect = dropEl.getBoundingClientRect();
  return clientY < rect.top + rect.height / 2;
};

const isSearchActive = () => !!($('#search').value || '').trim();

const clearChipDropMarks = () => {
  document.querySelectorAll('.folder-chip.drop-before, .folder-chip.drop-after, .folder-chip.dns-over').forEach((c) => {
    c.classList.remove('drop-before', 'drop-after', 'dns-over', 'drop-target');
  });
};

const showChipDropMark = (chip, before) => {
  chip.classList.add(before ? 'drop-before' : 'drop-after');
};

const ensureDropLine = () => {
  if (!dropLineEl) {
    dropLineEl = document.createElement('div');
    dropLineEl.className = 'dns-drop-line';
  }
  return dropLineEl;
};

const placeDnsDropLine = (container, targetRow, before) => {
  const line = ensureDropLine();
  if (!targetRow) {
    container.appendChild(line);
    return;
  }
  if (before) container.insertBefore(line, targetRow);
  else container.insertBefore(line, targetRow.nextSibling);
};

const clearDropLine = () => {
  if (dropLineEl && dropLineEl.parentNode) dropLineEl.parentNode.removeChild(dropLineEl);
};

const clearDnsRowMarks = () => {
  document.querySelectorAll('.dns-row.drop-before, .dns-row.drop-after, .dns-row.drop-target').forEach((r) => {
    r.classList.remove('drop-before', 'drop-after', 'drop-target');
  });
};

const autoScrollContainer = (container, clientY) => {
  const rect = container.getBoundingClientRect();
  const edge = 44;
  if (clientY - rect.top < edge) container.scrollBy({ top: -10, behavior: 'auto' });
  else if (rect.bottom - clientY < edge) container.scrollBy({ top: 10, behavior: 'auto' });
};

/** بعد از جابه‌جایی DOM، ترتیب جدید را با backend ذخیره می‌کند */
const commitFolderReorder = async (draggedId, orderedIds) => {
  if (!orderedIds) {
    orderedIds = [...$('#profileChips').querySelectorAll('.folder-chip')].map((c) => c.dataset.id);
  }
  const before = profiles.map((p) => p.id).join(',');
  profiles = await window.api.reorderProfiles(orderedIds);
  renderAll();
  if (!$('#profilesModal').classList.contains('hidden')) renderProfilesList();
  if (profiles.map((p) => p.id).join(',') !== before) toast(t('folderReordered'));
};

const moveDnsToProfile = async (dnsId, targetProfileId) => {
  const entry = dnsList.find((d) => d.id === dnsId);
  if (!entry || entry.profileId === targetProfileId) return;
  const prof = profileOf(targetProfileId);
  await window.api.updateDns(dnsId, { profileId: targetProfileId });
  await loadDnsData();
  renderAll();
  if (!$('#profilesModal').classList.contains('hidden')) renderProfilesList();
  toast(t('dnsMoved', { name: entry.name, folder: prof.name }));
};

const renderProfileChips = () => {
  const box = $('#profileChips');
  box.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'chip' + (currentProfile === 'all' ? ' active' : '');
  all.textContent = `✳ ${t('all')}`;
  all.addEventListener('click', () => {
    currentProfile = 'all';
    renderProfileChips();
    renderDnsList();
  });
  // درگ فولدر روی دکمه‌ی «همه» -> انتقال به ابتدای لیست فولدرها
  all.addEventListener('dragover', (e) => {
    if (dragMode !== 'chips' || !folderDragId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    clearChipDropMarks();
    const firstChip = box.querySelector('.folder-chip');
    if (firstChip && firstChip.dataset.id !== folderDragId) {
      firstChip.classList.add('drop-before');
    }
  });
  all.addEventListener('dragleave', () => clearChipDropMarks());
  all.addEventListener('drop', async (e) => {
    if (dragMode !== 'chips' || !folderDragId) return;
    e.preventDefault();
    clearChipDropMarks();
    const draggedChip = box.querySelector(`.folder-chip[data-id="${folderDragId}"]`);
    const firstChip = box.querySelector('.folder-chip');
    if (draggedChip && firstChip && draggedChip !== firstChip) {
      box.insertBefore(draggedChip, firstChip);
      const orderedIds = [...box.querySelectorAll('.folder-chip')].map((c) => c.dataset.id);
      await commitFolderReorder(folderDragId, orderedIds);
    }
  });
  box.appendChild(all);

  for (const p of profiles) {
    const chip = document.createElement('div');
    chip.className = 'chip folder-chip' + (currentProfile === p.id ? ' active' : '');
    chip.draggable = true;
    chip.dataset.id = p.id;
    const color = p.color || 'var(--accent)';
    if (currentProfile === p.id) {
      chip.style.background = color;
      chip.style.borderColor = color;
      chip.style.color = '#fff';
      chip.style.boxShadow = `0 4px 12px ${color}66`;
    } else {
      chip.style.borderColor = color + '55';
      chip.style.color = color;
    }
    chip.title = p.name;
    chip.innerHTML = `
      <span class="chip-icon">${profileIconHtml(p)}</span>
      <span class="chip-label">${escapeHtml(p.name)}</span>
      ${p.id !== 'general' ? '<span class="chip-x" title="' + escapeHtml(t('removeFolder')) + '">✕</span>' : ''}
    `;
    chip.addEventListener('click', (e) => {
      if (e.target.closest('.chip-x') || e.target.closest('.chip-rename')) return;
      currentProfile = p.id;
      renderProfileChips();
      renderDnsList();
    });
    const xBtn = chip.querySelector('.chip-x');
    if (xBtn) xBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteFolderFlow(p); });
    chip.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openFolderMenu(chip, p);
    });
    chip.addEventListener('dragstart', (e) => {
      if (dragState && dragState.type === 'dns') return;
      if (dragMode === 'rows') return;
      dragMode = 'chips';
      folderDragId = p.id;
      dragState = { type: 'folder-chip', id: p.id };
      chip.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', p.id); e.dataTransfer.setData('application/x-folder', p.id); } catch {}
    });
    chip.addEventListener('dragend', async () => {
      chip.classList.remove('dragging');
      clearChipDropMarks();
      if (dragMode !== 'chips') { dragState = null; return; }
      dragMode = null;
      const draggedId = folderDragId;
      folderDragId = null;
      dragState = null;
      if (!draggedId) return;
      const orderedIds = [...box.querySelectorAll('.folder-chip')].map((c) => c.dataset.id);
      await commitFolderReorder(draggedId, orderedIds);
    });
    chip.addEventListener('dragover', (e) => {
      autoScrollContainer(box, e.clientY);
      // انتقال DNS به فولدر
      if (dragState && dragState.type === 'dns') {
        const src = dnsList.find((d) => d.id === dragState.id);
        if (!src || src.profileId === p.id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        clearDropLine();
        clearDnsRowMarks();
        chip.classList.add('dns-over');
        return;
      }
      if (dragMode !== 'chips' || !folderDragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (folderDragId === p.id) return;
      const before = dropIsBefore(chip, e.clientX);
      clearChipDropMarks();
      showChipDropMark(chip, before);
    });
    chip.addEventListener('dragleave', (e) => {
      if (e.relatedTarget && chip.contains(e.relatedTarget)) return;
      chip.classList.remove('dns-over', 'drop-target', 'drop-before', 'drop-after');
    });
    chip.addEventListener('drop', async (e) => {
      e.preventDefault();
      chip.classList.remove('dns-over', 'drop-target', 'drop-before', 'drop-after');
      clearDropLine();
      clearDnsRowMarks();
      // رهاسازی DNS روی فولدر -> انتقال به این فولدر
      if (dragState && dragState.type === 'dns') {
        const dnsId = dragState.id;
        dragState = null;
        e.stopPropagation();
        await moveDnsToProfile(dnsId, p.id);
        return;
      }
      if (dragMode !== 'chips' || !folderDragId || folderDragId === p.id) return;
      const draggedChip = box.querySelector(`.folder-chip[data-id="${folderDragId}"]`);
      const before = dropIsBefore(chip, e.clientX);
      if (draggedChip && draggedChip !== chip) {
        box.insertBefore(draggedChip, before ? chip : chip.nextSibling);
        const orderedIds = [...box.querySelectorAll('.folder-chip')].map((c) => c.dataset.id);
        await commitFolderReorder(folderDragId, orderedIds);
      }
    });
    box.appendChild(chip);
  }

  // درگ چیپ روی فضای خالی انتهای نوار فولدرها
  box.addEventListener('dragover', (e) => {
    if (dragState && dragState.type === 'dns') return;
    if (dragMode !== 'chips' || !folderDragId) return;
    if (e.target === box || !e.target.closest('.folder-chip')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      clearChipDropMarks();
      const last = box.querySelector('.folder-chip:last-of-type');
      if (last && last.dataset.id !== folderDragId) last.classList.add('drop-after');
    }
  });
  box.addEventListener('drop', async (e) => {
    if (dragState && dragState.type === 'dns') return;
    if (dragMode !== 'chips' || !folderDragId) return;
    if (e.target === box || !e.target.closest('.folder-chip')) {
      e.preventDefault();
      clearChipDropMarks();
      const draggedChip = box.querySelector(`.folder-chip[data-id="${folderDragId}"]`);
      if (draggedChip) {
        box.appendChild(draggedChip);
        const orderedIds = [...box.querySelectorAll('.folder-chip')].map((c) => c.dataset.id);
        await commitFolderReorder(folderDragId, orderedIds);
      }
    }
  });
};

// ---------- dns list with drag reorder ----------
const matchActive = (d) => {
  const ips = new Set([d.primary, d.secondary].filter(Boolean));
  return adapters.some((a) => (a.dns || []).some((ip) => ips.has(ip)));
};

const visibleDns = () => {
  const q = ($('#search').value || '').trim().toLowerCase();
  return dnsList
    .filter((d) => currentProfile === 'all' || d.profileId === currentProfile)
    .filter((d) => !q || d.name.toLowerCase().includes(q) || d.primary.includes(q) || (d.secondary || '').includes(q));
};

const commitDnsReorder = async () => {
  const box = $('#dnsList');
  const visibleOrderedIds = Array.from(box.querySelectorAll('.dns-row')).map((r) => r.dataset.id);
  if (!visibleOrderedIds.length) return;
  let fullOrderedIds;
  if (currentProfile === 'all' && !isSearchActive()) {
    fullOrderedIds = visibleOrderedIds;
  } else {
    // جایگزین کردن ترتیبی ردیف‌های فولدر فعلی در میان کل لیست، بدون تغییر موقعیت سایر فولدرها
    const queue = [...visibleOrderedIds];
    fullOrderedIds = dnsList.map((d) => {
      if (d.profileId === currentProfile && queue.length > 0) {
        return queue.shift();
      }
      return d.id;
    });
  }
  const before = dnsList.map((d) => d.id).join(',');
  dnsList = await window.api.reorderDnsList(fullOrderedIds);
  renderDnsList();
  if (dnsList.map((d) => d.id).join(',') !== before) {
    toast(t('dnsReordered'));
  }
};

const renderDnsList = () => {
  const box = $('#dnsList');
  const items = visibleDns();

  box.innerHTML = '';
  if (!dnsList.length) {
    box.innerHTML = `<div class="dd-empty">${t('emptyList')}</div>`;
    $('#dragHint').classList.add('hidden');
    return;
  }
  if (!items.length) {
    box.innerHTML = `<div class="dd-empty">${t('noMatch')}</div>`;
    $('#dragHint').classList.add('hidden');
    return;
  }
  const searchActive = isSearchActive();
  $('#dragHint').classList.toggle('hidden', items.length < 2 || searchActive);

  for (const d of items) {
    const active = matchActive(d);
    const prof = profileOf(d.profileId);
    const row = document.createElement('div');
    row.className = 'dns-row' + (active ? ' active' : '');
    row.draggable = !searchActive;
    if (searchActive) row.title = t('sortingDisabledSearch');
    row.dataset.id = d.id;
    const pColor = prof.color || 'var(--accent)';
    row.style.setProperty('--row-accent', pColor);
    row.innerHTML = `
      <span class="drag-handle" title="⠿">⠿</span>
      <span class="dns-row-icon" title="${escapeHtml(prof.name)}">${profileIconHtml(prof)}</span>
      <div class="dns-row-name">${escapeHtml(d.name)}</div>
      <div class="dns-row-ips">${escapeHtml(fmtIps(d))}</div>
      <div class="dns-row-actions">
        <button class="row-btn act-apply" title="${t('apply')}">✓</button>
        <button class="row-btn act-edit" title="${t('edit')}">✎</button>
        <button class="row-btn danger act-del" title="${t('delete')}">🗑</button>
      </div>
    `;
    row.querySelector('.act-apply').addEventListener('click', () => {
      selectedDnsId = d.id;
      renderDropdown();
      applyDns();
    });
    row.querySelector('.act-edit').addEventListener('click', () => openModal(d));
    row.querySelector('.act-del').addEventListener('click', async () => {
      if (!confirm(t('confirmDelete'))) return;
      await window.api.deleteDns(d.id);
      if (selectedDnsId === d.id) selectedDnsId = null;
      await loadDnsData();
      renderAll();
      toast(t('deleted'));
    });

    attachDragHandlers(row);
    box.appendChild(row);
  }
  updateActiveBadge();
};

const attachDragHandlers = (row) => {
  row.addEventListener('dragstart', (e) => {
    if (isSearchActive()) {
      e.preventDefault();
      toast(t('sortingDisabledSearch'), 'err');
      return;
    }
    if (e.target.closest('.row-btn')) {
      e.preventDefault();
      return;
    }
    dragState = { type: 'dns', id: row.dataset.id };
    dragMode = 'dns';
    row.classList.add('dragging');
    $('#dnsList').classList.add('drag-active');
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', row.dataset.id);
      e.dataTransfer.setData('application/x-dns-id', row.dataset.id);
    } catch {}
  });

  row.addEventListener('dragover', (e) => {
    if (dragState?.type !== 'dns') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragState.id === row.dataset.id) return;
    autoScrollContainer($('#dnsList'), e.clientY);
    const before = verticalDropBefore(row, e.clientY);
    clearDnsRowMarks();
    row.classList.add(before ? 'drop-before' : 'drop-after');
    placeDnsDropLine($('#dnsList'), row, before);
  });

  row.addEventListener('dragleave', (e) => {
    if (e.relatedTarget && row.contains(e.relatedTarget)) return;
    row.classList.remove('drop-before', 'drop-after', 'drop-target');
  });

  row.addEventListener('drop', async (e) => {
    if (dragState?.type !== 'dns') return;
    e.preventDefault();
    e.stopPropagation();
    const srcId = dragState.id;
    clearDnsRowMarks();
    clearDropLine();
    if (!srcId || srcId === row.dataset.id) return;
    const box = $('#dnsList');
    const src = box.querySelector(`.dns-row[data-id="${srcId}"]`);
    if (src && src !== row) {
      const before = verticalDropBefore(row, e.clientY);
      if (before) box.insertBefore(src, row);
      else box.insertBefore(src, row.nextSibling);
      await commitDnsReorder();
    }
  });

  row.addEventListener('dragend', () => {
    row.classList.remove('dragging');
    $('#dnsList').classList.remove('drag-active');
    clearDnsRowMarks();
    clearDropLine();
    clearChipDropMarks();
    dragState = null;
    dragMode = null;
  });
};

const updateActiveBadge = () => {
  const badge = $('#activeBadge');
  const active = dnsList.find((d) => matchActive(d));
  if (active) {
    badge.textContent = `${t('activeOn')}: ${active.name}`;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
};

// ---------- apply / clear / flush ----------
async function applyDns() {
  const d = dnsList.find((x) => x.id === selectedDnsId);
  if (!d) {
    toast(t('needDns'), 'err');
    return;
  }
  if (selectedAdapters.size === 0) {
    toast(t('needAdapter'), 'err');
    return;
  }
  const servers = [d.primary, d.secondary].filter(Boolean).filter(isValidIp);
  if (!servers.length) {
    toast(t('invalidIp'), 'err');
    return;
  }
  status(t('uacHint'), true);
  closeDropdown();
  const r = await window.api.applyDns({
    servers,
    adapters: Array.from(selectedAdapters),
    flush: true,
  });
  if (r.canceled) {
    status(t('ready'), false);
    toast(t('uacCanceled'), 'err');
    return;
  }
  if (!r.ok) {
    status(t('ready'), false);
    toast(`${t('applyErr')}: ${r.error || ''}`, 'err');
    return;
  }
  const errors = (r.log || []).filter((l) => l.status === 'err');
  status(t('ready'), false);
  if (errors.length) toast(`${t('applyErr')} (${errors.length})`, 'err');
  else toast(t('applied'));
  await loadAdapters(true);
}

async function clearNetworkDns() {
  if (selectedAdapters.size === 0) {
    toast(t('needAdapter'), 'err');
    return;
  }
  status(t('clearing'), true);
  const r = await window.api.clearDns({ adapters: Array.from(selectedAdapters), flush: true });
  if (r.canceled) {
    status(t('ready'), false);
    toast(t('uacCanceled'), 'err');
    return;
  }
  if (!r.ok) {
    status(t('ready'), false);
    toast(`${t('clearErr')}: ${r.error || ''}`, 'err');
    return;
  }
  status(t('ready'), false);
  toast(t('cleared'));
  await loadAdapters(true);
}

async function flushCache() {
  status(t('flushing'), true);
  const r = await window.api.flushDns();
  status(t('ready'), false);
  toast(r.ok ? t('flushed') : `${r.error || 'Error'}`, r.ok ? 'ok' : 'err');
}

// ---------- DNS modal ----------
function fillProfileSelect() {
  const sel = $('#fProfile');
  sel.innerHTML = '';
  for (const p of profiles) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name}`;
    sel.appendChild(opt);
  }
}

function openModal(dns) {
  editingId = dns ? dns.id : null;
  fillProfileSelect();
  $('#modalTitle').textContent = editingId ? t('editDnsTitle') : t('addDnsTitle');
  $('#fName').value = dns ? dns.name : '';
  $('#fPrimary').value = dns ? dns.primary : '';
  $('#fSecondary').value = dns ? dns.secondary : '';
  $('#fProfile').value = dns ? dns.profileId : (currentProfile !== 'all' ? currentProfile : 'general');
  $('#modal').classList.remove('hidden');
  $('#fName').focus();
}

function closeModal() {
  $('#modal').classList.add('hidden');
  editingId = null;
}

async function saveModal() {
  const name = $('#fName').value.trim();
  const primary = $('#fPrimary').value.trim();
  const secondary = $('#fSecondary').value.trim();
  const profileId = $('#fProfile').value || 'general';
  if (!name) return toast(t('nameRequired'), 'err');
  if (!isValidIp(primary)) return toast(t('invalidIp'), 'err');
  if (secondary && !isValidIp(secondary)) return toast(t('invalidIp'), 'err');

  if (editingId) await window.api.updateDns(editingId, { name, primary, secondary, profileId });
  else {
    const item = await window.api.addDns({ name, primary, secondary, profileId });
    selectedDnsId = item.id;
  }
  closeModal();
  await loadDnsData();
  renderAll();
  toast(t('saved'));
}

// ---------- profiles manager ----------
function openProfiles() {
  renderProfilesList();
  $('#npName').value = '';
  newProfileIcon = 'folder';
  $('#npIcon').innerHTML = profileIconHtml({ icon: 'folder' });
  $('#profilesModal').classList.remove('hidden');
}

const renderProfilesList = () => {
  const box = $('#profilesList');
  box.innerHTML = '';
  for (const p of profiles) {
    const row = document.createElement('div');
    row.className = 'profile-row';
    const isDefault = p.id === 'general';
    const color = p.color || 'var(--accent)';
    row.style.borderInlineStart = `3px solid ${color}`;
    row.dataset.id = p.id;
    row.innerHTML = `
      <span class="drag-handle" title="⠿">⠿</span>
      <button type="button" class="profile-icon-btn" title="${t('changeIcon')}">${profileIconHtml(p)}</button>
      <input class="profile-name" type="text" value="${escapeHtml(p.name)}" ${isDefault ? 'disabled' : ''} />
      <input class="profile-color" type="color" value="${escapeHtml(color)}" ${isDefault ? '' : ''} title="${t('accentColor')}" />
      <span class="profile-count">${dnsList.filter((d) => d.profileId === p.id).length}</span>
      ${isDefault ? '<span class="profile-lock">🔒</span>' : '<button class="row-btn danger prof-del" title="' + t('delete') + '">🗑</button>'}
    `;
    // درگ ردیف‌ها
    row.draggable = true;
    row.addEventListener('dragstart', (e) => {
      if (e.target.closest('input') || e.target.closest('button')) {
        e.preventDefault();
        return;
      }
      dragMode = 'rows';
      folderDragId = p.id;
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', p.id); } catch {}
    });
    row.addEventListener('dragover', (e) => {
      if (dragMode !== 'rows' || !folderDragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (folderDragId === p.id) return;
      const before = verticalDropBefore(row, e.clientY);
      box.querySelectorAll('.profile-row.drop-before, .profile-row.drop-after').forEach((r) => {
        r.classList.remove('drop-before', 'drop-after');
      });
      row.classList.add(before ? 'drop-before' : 'drop-after');
    });
    row.addEventListener('dragleave', (e) => {
      if (e.relatedTarget && row.contains(e.relatedTarget)) return;
      row.classList.remove('drop-before', 'drop-after', 'drop-target');
    });
    row.addEventListener('drop', async (e) => {
      if (dragMode !== 'rows' || !folderDragId || folderDragId === p.id) return;
      e.preventDefault();
      row.classList.remove('drop-before', 'drop-after', 'drop-target');
      const srcRow = box.querySelector(`.profile-row[data-id="${folderDragId}"]`);
      if (srcRow && srcRow !== row) {
        const before = verticalDropBefore(row, e.clientY);
        if (before) box.insertBefore(srcRow, row);
        else box.insertBefore(srcRow, row.nextSibling);
        const ids = Array.from(box.querySelectorAll('.profile-row')).map((r) => r.dataset.id);
        await commitFolderReorder(folderDragId, ids);
      }
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      box.querySelectorAll('.profile-row').forEach((r) => {
        r.classList.remove('drop-target', 'drop-before', 'drop-after');
      });
      dragMode = null;
      folderDragId = null;
    });
    row.querySelector('.profile-icon-btn').addEventListener('click', (e) => openIconPicker(e.currentTarget, p.icon, (icon) => setProfileIcon(p, icon)));
    row.querySelector('.profile-color').addEventListener('input', async (e) => {
      await window.api.updateProfile(p.id, { color: e.target.value });
      await loadDnsData();
      renderAll();
    });
    if (!isDefault) {
      row.querySelector('.profile-name').addEventListener('change', async (e) => {
        const v = e.target.value.trim();
        if (!v) return;
        await window.api.updateProfile(p.id, { name: v });
        await loadDnsData();
        renderAll();
      });
      row.querySelector('.prof-del').addEventListener('click', async () => {
        if (!confirm(t('confirmDeleteProfile'))) return;
        await window.api.deleteProfile(p.id);
        if (currentProfile === p.id) currentProfile = 'all';
        await loadDnsData();
        renderAll();
        renderProfilesList();
      });
    }
    box.appendChild(row);
  }
}

let newProfileIcon = 'folder';

async function addProfileFromInput() {
  const name = $('#npName').value.trim();
  if (!name) return;
  const icon = newProfileIcon || 'folder';
  const color = $('#npColor').value;
  await window.api.addProfile(name, icon, color);
  $('#npName').value = '';
  newProfileIcon = 'folder';
  $('#npIcon').innerHTML = profileIconHtml({ icon: 'folder' });
  $('#npColor').value = '#a855f7';
  await loadDnsData();
  renderAll();
  renderProfilesList();
}

// ---------- data ----------
async function loadDnsData() {
  dnsList = await window.api.getDnsList();
  profiles = await window.api.getProfiles();
  if (selectedDnsId && !dnsList.find((d) => d.id === selectedDnsId)) selectedDnsId = null;
  if (!selectedDnsId && dnsList.length) selectedDnsId = dnsList[0].id;
}

async function loadAllData() {
  await loadDnsData();
  // drop current profile filter if that profile vanished
  if (currentProfile !== 'all' && !profiles.some((p) => p.id === currentProfile)) currentProfile = 'all';
}

function renderAll() {
  renderProfileChips();
  renderDropdown();
  renderDnsList();
}

function renderAbout() {
  if (!appInfo) return;
  const el = $('#aboutLine');
  el.innerHTML = '';
  const span = document.createElement('span');
  span.textContent = `${t('about')} `;
  el.appendChild(span);
  const a = document.createElement('a');
  a.href = appInfo.site; // real href so middle-click / ctrl+click also work when possible
  a.textContent = appInfo.deployedBy;
  a.addEventListener('click', (e) => {
    e.preventDefault();
    window.api.openExternal(appInfo.site).then((r) => {
      if (!r || !r.ok) toast(t('openLinkErr', { err: (r && r.error) || '' }), 'err');
    });
  });
  el.appendChild(a);
  el.title = `${appInfo.builtWith} • v${appInfo.version}`;
}

// ---------- boot ----------
async function boot() {
  let s = {};
  try {
    s = (await window.api.getSettings()) || {};
  } catch {
    s = {};
  }
  lang = normalizeLang(s.lang);
  applyI18n();
  syncLangControls();
  await initAppearance(s);
  appInfo = await window.api.getAppInfo();
  renderAbout();
  await loadAllData();
  await warmIconCache();
  renderAll();

  const dnsListBox = $('#dnsList');
  dnsListBox.addEventListener('dragover', (e) => {
    if (dragState?.type !== 'dns') return;
    if (e.target === dnsListBox || !e.target.closest('.dns-row')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      clearDnsRowMarks();
      placeDnsDropLine(dnsListBox, null, false);
    }
  });
  dnsListBox.addEventListener('dragleave', (e) => {
    if (e.relatedTarget && dnsListBox.contains(e.relatedTarget)) return;
    clearDropLine();
  });
  dnsListBox.addEventListener('drop', async (e) => {
    if (dragState?.type !== 'dns') return;
    if (e.target === dnsListBox || !e.target.closest('.dns-row')) {
      e.preventDefault();
      const srcId = dragState.id;
      clearDnsRowMarks();
      clearDropLine();
      if (!srcId) return;
      const src = dnsListBox.querySelector(`.dns-row[data-id="${srcId}"]`);
      if (src) {
        dnsListBox.appendChild(src);
        await commitDnsReorder();
      }
    }
  });

  const profListBox = $('#profilesList');
  profListBox.addEventListener('dragover', (e) => {
    if (dragMode !== 'rows' || !folderDragId) return;
    if (e.target === profListBox || !e.target.closest('.profile-row')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      profListBox.querySelectorAll('.profile-row.drop-before, .profile-row.drop-after').forEach((r) => {
        r.classList.remove('drop-before', 'drop-after');
      });
      const last = profListBox.querySelector('.profile-row:last-of-type');
      if (last && last.dataset.id !== folderDragId) last.classList.add('drop-after');
    }
  });
  profListBox.addEventListener('drop', async (e) => {
    if (dragMode !== 'rows' || !folderDragId) return;
    if (e.target === profListBox || !e.target.closest('.profile-row')) {
      e.preventDefault();
      profListBox.querySelectorAll('.profile-row').forEach((r) => r.classList.remove('drop-target', 'drop-before', 'drop-after'));
      const srcRow = profListBox.querySelector(`.profile-row[data-id="${folderDragId}"]`);
      if (srcRow) {
        profListBox.appendChild(srcRow);
        const ids = Array.from(profListBox.querySelectorAll('.profile-row')).map((r) => r.dataset.id);
        await commitFolderReorder(folderDragId, ids);
      }
    }
  });

  $('#search').addEventListener('input', renderDnsList);
  $('#langToggle').addEventListener('click', () => setLang(lang === 'fa' ? 'en' : 'fa'));
  $('#langSeg').addEventListener('click', (e) => {
    const btn = e.target.closest('.seg-btn');
    if (btn) setLang(btn.dataset.lang);
  });
  $('#btnApply').addEventListener('click', applyDns);
  $('#btnClear').addEventListener('click', clearNetworkDns);
  $('#btnFlush').addEventListener('click', flushCache);
  $('#btnAdd').addEventListener('click', () => openModal(null));
  $('#btnProfiles').addEventListener('click', openProfiles);
  $('#btnSettings').addEventListener('click', () => $('#settingsModal').classList.remove('hidden'));
  $('#btnClearList').addEventListener('click', async () => {
    if (!confirm(t('confirmClearList'))) return;
    await window.api.clearDnsList();
    selectedDnsId = null;
    await loadDnsData();
    renderAll();
    toast(t('listCleared'));
  });
  $('#btnImport').addEventListener('click', async () => {
    const r = await window.api.importBatFiles();
    if (r.canceled) return;
    await loadDnsData();
    renderAll();
    toast(r.added ? t('imported', { n: r.added }) : t('noImport'));
  });

  // modals: close ONLY via buttons/Escape — clicking the backdrop intentionally does nothing
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalCancel').addEventListener('click', closeModal);
  $('#modalSave').addEventListener('click', saveModal);
  $('#profilesClose').addEventListener('click', () => $('#profilesModal').classList.add('hidden'));
  $('#profilesDone').addEventListener('click', () => $('#profilesModal').classList.add('hidden'));
  $('#npAdd').addEventListener('click', addProfileFromInput);
  $('#npName').addEventListener('keydown', (e) => e.key === 'Enter' && addProfileFromInput());
  $('#npIcon').addEventListener('click', (e) => {
    openIconPicker(e.currentTarget, newProfileIcon, (icon) => {
      newProfileIcon = icon;
      $('#npIcon').innerHTML = profileIconHtml({ icon });
    });
  });
  $('#settingsClose').addEventListener('click', () => $('#settingsModal').classList.add('hidden'));
  $('#settingsDone').addEventListener('click', () => $('#settingsModal').classList.add('hidden'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
      closeFolderMenu();
      closeIconPicker();
      $('#modal').classList.add('hidden');
      $('#profilesModal').classList.add('hidden');
      $('#settingsModal').classList.add('hidden');
      editingId = null;
    }
  });

  document.addEventListener('click', (e) => {
    if (folderMenuEl && !e.target.closest('.ctx-menu')) closeFolderMenu();
    if (iconPickerEl && !e.target.closest('.icon-picker')) closeIconPicker();
  }, true);

  ['fName', 'fPrimary', 'fSecondary'].forEach((id) => {
    document.getElementById(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveModal();
    });
  });

  // dropdown outside click
  document.addEventListener('click', (e) => {
    if (ddMenuEl && !ddMenuEl.classList.contains('hidden') && !e.target.closest('.dropdown')) closeDropdown();
  });

  await loadAdapters();
  setInterval(() => loadAdapters(true), 30000);
}

document.addEventListener('DOMContentLoaded', boot);
