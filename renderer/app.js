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
    en: 'Tick the network adapters on the right, then press Apply. If not admin, a UAC prompt appears once.',
  },
  savedList: { fa: 'لیست ذخیره‌شده', en: 'Saved list' },
  searchPh: { fa: 'جستجو…', en: 'Search…' },
  profiles: { fa: 'پروفایل‌ها', en: 'Profiles' },
  profilesTitle: { fa: 'مدیریت پروفایل‌ها', en: 'Manage profiles' },
  profilesNote: {
    fa: 'حذف پروفایل، DNSهای آن را به «عمومی» منتقل می‌کند. پروفایل پیش‌فرض حذف‌شدنی نیست.',
    en: 'Deleting a profile moves its DNS entries to “General”. The default profile cannot be deleted.',
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
  dragHint: { fa: 'برای مرتب‌سازی، ردیف‌ها رو با ماوس بکش و جابه‌جا کن', en: 'Drag rows to reorder them' },
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
  profileDeleteBlocked: { fa: 'پروفایل پیش‌فرض حذف‌شدنی نیست', en: 'Default profile cannot be deleted' },
  about: { fa: 'ساخته‌شده با هوش مصنوعی GLM 5.3 Flash • دیپلوی توسط', en: 'Crafted with GLM 5.3 Flash AI • Deployed by' },
};

let lang = 'fa';

function t(key) {
  const item = I18N[key];
  return item ? item[lang] : key;
}

function applyI18n() {
  document.documentElement.lang = lang;
  document.documentElement.dir = 'rtl';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
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
let dragState = null;

// ---------- utils ----------
const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
function isValidIp(ip) {
  const m = IPV4_RE.exec(String(ip || '').trim());
  return !!m && m.slice(1).every((o) => Number(o) <= 255);
}

function status(msg, busy) {
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

async function initAppearance() {
  const s = await window.api.getSettings();
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
        <span class="dd-item-icon" style="color: ${itemColor}">${escapeHtml(prof.icon)}</span>
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

// ---------- profile chips ----------
function renderProfileChips() {
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
  box.appendChild(all);

  for (const p of profiles) {
    const chip = document.createElement('button');
    chip.className = 'chip' + (currentProfile === p.id ? ' active' : '');
    chip.textContent = `${p.icon} ${p.name}`;
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
    chip.addEventListener('click', () => {
      currentProfile = p.id;
      renderProfileChips();
      renderDnsList();
    });
    box.appendChild(chip);
  }
}

// ---------- dns list with drag reorder ----------
function matchActive(d) {
  const ips = new Set([d.primary, d.secondary].filter(Boolean));
  return adapters.some((a) => (a.dns || []).some((ip) => ips.has(ip)));
}

function visibleDns() {
  const q = ($('#search').value || '').trim().toLowerCase();
  return dnsList
    .filter((d) => currentProfile === 'all' || d.profileId === currentProfile)
    .filter((d) => !q || d.name.toLowerCase().includes(q) || d.primary.includes(q) || (d.secondary || '').includes(q));
}

function renderDnsList() {
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
  $('#dragHint').classList.toggle('hidden', items.length < 2 || !!($('#search').value || '').trim());

  for (const d of items) {
    const active = matchActive(d);
    const prof = profileOf(d.profileId);
    const row = document.createElement('div');
    row.className = 'dns-row' + (active ? ' active' : '');
    row.draggable = true;
    row.dataset.id = d.id;
    const pColor = prof.color || 'var(--accent)';
    row.style.setProperty('--row-accent', pColor);
    row.innerHTML = `
      <span class="drag-handle" title="⠿">⠿</span>
      <span class="dns-row-icon" title="${escapeHtml(prof.name)}">${escapeHtml(prof.icon)}</span>
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
}

function attachDragHandlers(row) {
  row.addEventListener('dragstart', (e) => {
    dragState = { id: row.dataset.id };
    row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', row.dataset.id); } catch {}
  });
  row.addEventListener('dragend', async () => {
    row.classList.remove('dragging');
    document.querySelectorAll('.dns-row.drop-target').forEach((r) => r.classList.remove('drop-target'));
    if (!dragState) return;
    const box = $('#dnsList');
    const orderedIds = Array.from(box.querySelectorAll('.dns-row')).map((r) => r.dataset.id);
    dragState = null;
    dnsList = await window.api.reorderDnsList(orderedIds);
    renderDnsList();
  });
  row.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (row.dataset.id !== dragState?.id) row.classList.add('drop-target');
  });
  row.addEventListener('dragleave', () => row.classList.remove('drop-target'));
  row.addEventListener('drop', (e) => {
    e.preventDefault();
    row.classList.remove('drop-target');
    const srcId = dragState?.id || (() => { try { return e.dataTransfer.getData('text/plain'); } catch { return null; } })();
    if (!srcId || srcId === row.dataset.id) return;
    const box = $('#dnsList');
    const src = box.querySelector(`.dns-row[data-id="${srcId}"]`);
    if (src && src !== row) box.insertBefore(src, row);
  });
}

function updateActiveBadge() {
  const badge = $('#activeBadge');
  const active = dnsList.find((d) => matchActive(d));
  if (active) {
    badge.textContent = `${t('activeOn')}: ${active.name}`;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

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
    opt.textContent = `${p.icon} ${p.name}`;
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
  $('#npIcon').value = '';
  $('#profilesModal').classList.remove('hidden');
}

function renderProfilesList() {
  const box = $('#profilesList');
  box.innerHTML = '';
  for (const p of profiles) {
    const row = document.createElement('div');
    row.className = 'profile-row';
    const isDefault = p.id === 'general';
    const color = p.color || 'var(--accent)';
    row.style.borderInlineStart = `3px solid ${color}`;
    row.innerHTML = `
      <input class="profile-icon" type="text" maxlength="4" value="${escapeHtml(p.icon)}" ${isDefault ? 'disabled' : ''} />
      <input class="profile-name" type="text" value="${escapeHtml(p.name)}" ${isDefault ? 'disabled' : ''} />
      <input class="profile-color" type="color" value="${escapeHtml(color)}" ${isDefault ? '' : ''} title="${t('accentColor')}" />
      <span class="profile-count">${dnsList.filter((d) => d.profileId === p.id).length}</span>
      ${isDefault ? '<span class="profile-lock">🔒</span>' : '<button class="row-btn danger prof-del" title="' + t('delete') + '">🗑</button>'}
    `;
    row.querySelector('.profile-color').addEventListener('input', async (e) => {
      await window.api.updateProfile(p.id, { color: e.target.value });
      await loadDnsData();
      renderAll();
    });
    if (!isDefault) {
      row.querySelector('.profile-icon').addEventListener('change', async (e) => {
        await window.api.updateProfile(p.id, { icon: e.target.value.trim() || '📁' });
        await loadDnsData();
        renderAll();
      });
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

async function addProfileFromInput() {
  const name = $('#npName').value.trim();
  if (!name) return;
  const icon = $('#npIcon').value.trim() || '📁';
  const color = $('#npColor').value;
  await window.api.addProfile(name, icon, color);
  $('#npName').value = '';
  $('#npIcon').value = '';
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
      if (!r || !r.ok) toast('Open link failed: ' + ((r && r.error) || ''), 'err');
    });
  });
  el.appendChild(a);
  el.title = `${appInfo.builtWith} • v${appInfo.version}`;
}

// ---------- boot ----------
async function boot() {
  applyI18n();
  await initAppearance();
  appInfo = await window.api.getAppInfo();
  renderAbout();
  await loadAllData();
  renderAll();

  $('#search').addEventListener('input', renderDnsList);
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
    toast(r.added ? `${r.added} DNS imported ✅` : 'No new DNS found in file(s)');
  });

  // modals: close ONLY via buttons/Escape — clicking the backdrop intentionally does nothing
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalCancel').addEventListener('click', closeModal);
  $('#modalSave').addEventListener('click', saveModal);
  $('#profilesClose').addEventListener('click', () => $('#profilesModal').classList.add('hidden'));
  $('#profilesDone').addEventListener('click', () => $('#profilesModal').classList.add('hidden'));
  $('#npAdd').addEventListener('click', addProfileFromInput);
  $('#npName').addEventListener('keydown', (e) => e.key === 'Enter' && addProfileFromInput());
  $('#settingsClose').addEventListener('click', () => $('#settingsModal').classList.add('hidden'));
  $('#settingsDone').addEventListener('click', () => $('#settingsModal').classList.add('hidden'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
      $('#modal').classList.add('hidden');
      $('#profilesModal').classList.add('hidden');
      $('#settingsModal').classList.add('hidden');
      editingId = null;
    }
  });

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
