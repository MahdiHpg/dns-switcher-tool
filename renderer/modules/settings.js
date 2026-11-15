'use strict';

/**
 * مدیریت تنظیمات ظاهری، سیستمی (Autostart)، پشتیبان‌گیری و همگام‌سازی ابری
 */

import { setLang, getLang, t } from './i18n.js';

let currentSettings = {};
let onSettingsChangedCallback = null;

export const setOnSettingsChanged = (cb) => {
  onSettingsChangedCallback = cb;
};

export const getSettings = () => currentSettings;

export const loadSettings = async () => {
  try {
    currentSettings = (await window.api.getSettings()) || {};
    applyAppearance(currentSettings);

    // بررسی وضعیت شروع خودکار ویندوز
    if (window.api.isAutostartEnabled) {
      const autostart = await window.api.isAutostartEnabled();
      currentSettings.autostart = autostart;
      const chk = document.querySelector('#sAutostart');
      if (chk) chk.checked = autostart;
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
};

export const applyAppearance = (settings) => {
  const root = document.documentElement;

  if (settings.theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }

  if (settings.accentColor) {
    root.style.setProperty('--accent', settings.accentColor);
  }
  if (settings.textColor) {
    root.style.setProperty('--text', settings.textColor);
  }
  if (settings.fontSize) {
    root.style.setProperty('--font-scale', settings.fontSize / 14);
    const valSpan = document.querySelector('#sFontVal');
    if (valSpan) valSpan.textContent = settings.fontSize;
  }
  if (settings.fontFamily) {
    root.style.setProperty('--app-font', `"${settings.fontFamily}", sans-serif`);
  }
  if (settings.animations === false) {
    root.classList.add('no-anim');
  } else {
    root.classList.remove('no-anim');
  }
  if (settings.compact) {
    root.classList.add('compact');
  } else {
    root.classList.remove('compact');
  }

  if (settings.lang) {
    setLang(settings.lang);
  }
};

export const setupSettingsModal = (showToast) => {
  const modal = document.querySelector('#settingsModal');
  const btnOpen = document.querySelector('#btnSettings');
  const btnClose = document.querySelector('#settingsClose');
  const btnDone = document.querySelector('#settingsDone');

  const sAccent = document.querySelector('#sAccent');
  const sAccentReset = document.querySelector('#sAccentReset');
  const sText = document.querySelector('#sText');
  const sTextReset = document.querySelector('#sTextReset');
  const sFont = document.querySelector('#sFont');
  const sFontFamily = document.querySelector('#sFontFamily');
  const sAnim = document.querySelector('#sAnim');
  const sCompact = document.querySelector('#sCompact');
  const sAutostart = document.querySelector('#sAutostart');
  const sRestoreSeed = document.querySelector('#sRestoreSeed');
  const sExport = document.querySelector('#sExport');
  const sImportFile = document.querySelector('#sImportFile');
  const sSyncBtn = document.querySelector('#sSyncBtn');
  const sSyncUrl = document.querySelector('#sSyncUrl');

  const open = () => {
    modal.classList.remove('hidden');
    if (sAccent && currentSettings.accentColor) sAccent.value = currentSettings.accentColor;
    if (sText && currentSettings.textColor) sText.value = currentSettings.textColor;
    if (sFont && currentSettings.fontSize) sFont.value = currentSettings.fontSize;
    if (sFontFamily && currentSettings.fontFamily) sFontFamily.value = currentSettings.fontFamily;
    if (sAnim) sAnim.checked = currentSettings.animations !== false;
    if (sCompact) sCompact.checked = Boolean(currentSettings.compact);
  };

  const close = () => {
    modal.classList.add('hidden');
  };

  if (btnOpen) btnOpen.addEventListener('click', open);
  if (btnClose) btnClose.addEventListener('click', close);
  if (btnDone) btnDone.addEventListener('click', close);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // زبان
  document.querySelectorAll('#langSeg .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      currentSettings.lang = lang;
      setLang(lang);
      window.api.saveSettings({ lang });
    });
  });

  // رنگ اصلی
  if (sAccent) {
    sAccent.addEventListener('input', () => {
      currentSettings.accentColor = sAccent.value;
      applyAppearance(currentSettings);
      window.api.saveSettings({ accentColor: sAccent.value });
    });
  }
  if (sAccentReset) {
    sAccentReset.addEventListener('click', () => {
      delete currentSettings.accentColor;
      document.documentElement.style.removeProperty('--accent');
      if (sAccent) sAccent.value = '#6366f1';
      window.api.saveSettings({ accentColor: null });
    });
  }

  // رنگ متن
  if (sText) {
    sText.addEventListener('input', () => {
      currentSettings.textColor = sText.value;
      applyAppearance(currentSettings);
      window.api.saveSettings({ textColor: sText.value });
    });
  }
  if (sTextReset) {
    sTextReset.addEventListener('click', () => {
      delete currentSettings.textColor;
      document.documentElement.style.removeProperty('--text');
      if (sText) sText.value = '#e6ebf4';
      window.api.saveSettings({ textColor: null });
    });
  }

  // فونت
  if (sFont) {
    sFont.addEventListener('input', () => {
      const val = parseInt(sFont.value, 10);
      currentSettings.fontSize = val;
      applyAppearance(currentSettings);
      window.api.saveSettings({ fontSize: val });
    });
  }
  if (sFontFamily) {
    sFontFamily.addEventListener('change', () => {
      currentSettings.fontFamily = sFontFamily.value;
      applyAppearance(currentSettings);
      window.api.saveSettings({ fontFamily: sFontFamily.value });
    });
  }

  // انیمیشن
  if (sAnim) {
    sAnim.addEventListener('change', () => {
      currentSettings.animations = sAnim.checked;
      applyAppearance(currentSettings);
      window.api.saveSettings({ animations: sAnim.checked });
    });
  }

  // فشرده
  if (sCompact) {
    sCompact.addEventListener('change', () => {
      currentSettings.compact = sCompact.checked;
      applyAppearance(currentSettings);
      window.api.saveSettings({ compact: sCompact.checked });
    });
  }

  // Autostart
  if (sAutostart) {
    sAutostart.addEventListener('change', async () => {
      try {
        await window.api.setAutostart(sAutostart.checked);
        currentSettings.autostart = sAutostart.checked;
        showToast(sAutostart.checked ? 'اجرا همراه با ویندوز فعال شد ✅' : 'اجرا همراه با ویندوز غیرفعال شد');
      } catch (err) {
        showToast(`خطا در تنظیم Autostart: ${err}`);
      }
    });
  }

  // Restore Seed
  if (sRestoreSeed) {
    sRestoreSeed.addEventListener('click', async () => {
      try {
        const res = await window.api.restoreSeed();
        showToast(t('seedRestored'));
        if (onSettingsChangedCallback) onSettingsChangedCallback();
      } catch (err) {
        showToast(`خطا: ${err}`);
      }
    });
  }

  // Backup Export
  if (sExport) {
    sExport.addEventListener('click', async () => {
      try {
        const data = await window.api.exportBackup();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dns-switcher-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(t('backupExported'));
      } catch (err) {
        showToast(`خطا در صدور بکاپ: ${err}`);
      }
    });
  }

  // Backup Import
  if (sImportFile) {
    sImportFile.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const res = await window.api.importBackup(json);
        if (res && res.ok) {
          showToast(t('backupImported', { n: res.imported || 0 }));
          if (onSettingsChangedCallback) onSettingsChangedCallback();
        } else {
          showToast(`خطا در واردسازی: ${res.error || 'فرمت نامعتبر'}`);
        }
      } catch (err) {
        showToast(`خطا در خواندن فایل: ${err.message || err}`);
      }
      sImportFile.value = '';
    });
  }

  // Online Sync
  if (sSyncBtn && sSyncUrl) {
    sSyncBtn.addEventListener('click', async () => {
      const url = sSyncUrl.value.trim();
      if (!url) {
        showToast(t('urlRequired'));
        return;
      }
      sSyncBtn.disabled = true;
      sSyncBtn.textContent = '…';
      try {
        const res = await window.api.fetchRemoteDns(url);
        if (res && res.ok) {
          showToast(t('syncSuccess', { n: res.added || 0 }));
          if (onSettingsChangedCallback) onSettingsChangedCallback();
        } else {
          showToast(`خطا در دریافت آنلاین: ${res.error || 'خطای شبکه'}`);
        }
      } catch (err) {
        showToast(`خطا: ${err.message || err}`);
      } finally {
        sSyncBtn.disabled = false;
        sSyncBtn.innerHTML = `🔄 <span>${t('syncOnline')}</span>`;
      }
    });
  }
};
