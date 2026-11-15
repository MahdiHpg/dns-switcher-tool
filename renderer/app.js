'use strict';

/**
 * DNS Switcher — اسکریپت هماهنگ‌کنندهٔ اصلی (Orchestrator)
 *
 * طبق قوانین معماری پروژه، توابع به ماژول‌های مجزا شکسته شده‌اند:
 * i18n, adapters, profiles, dnsList, settings, benchmark, reachability.
 */

import { t, setLang, getLang } from './modules/i18n.js';
import { loadAdapters, getSelectedAdapterNames, setOnAdapterChange } from './modules/adapters.js';
import { loadProfiles, setupProfilesModal, setOnProfileFilterChange, setOnProfilesUpdated } from './modules/profiles.js';
import {
  loadDnsList,
  getSelectedDns,
  setSelectedDnsId,
  setFilterProfileId,
  setSearchQuery,
  openAddEditModal,
  setupModalEvents,
  renderDnsList,
  renderDropdown,
} from './modules/dnsList.js';
import { loadSettings, setupSettingsModal, applyAppearance, getSettings, setOnSettingsChanged } from './modules/settings.js';
import { pingMultipleIps, findFastestDns } from './modules/benchmark.js';
import { setupReachabilityModal } from './modules/reachability.js';

let activeDnsEntry = null;
let activeStartTime = null;
let timerInterval = null;

const showToast = (message) => {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2600);
};

const setStatus = (text, isBusy = false) => {
  const statusEl = document.querySelector('#statusText');
  const spinner = document.querySelector('#spinner');
  if (statusEl) statusEl.textContent = text;
  if (spinner) {
    if (isBusy) spinner.classList.remove('hidden');
    else spinner.classList.add('hidden');
  }
};

const updateActiveBadge = () => {
  const badge = document.querySelector('#activeBadge');
  const timer = document.querySelector('#activeTimer');

  if (!badge) return;

  if (activeDnsEntry) {
    badge.textContent = `${t('activeOn')}: ${activeDnsEntry.name}`;
    badge.classList.remove('hidden');
    if (timer) timer.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
    if (timer) timer.classList.add('hidden');
    clearInterval(timerInterval);
  }
};

const startActiveTimer = () => {
  clearInterval(timerInterval);
  activeStartTime = Date.now();
  const timer = document.querySelector('#activeTimer');

  const update = () => {
    if (!timer || !activeStartTime) return;
    const diff = Math.floor((Date.now() - activeStartTime) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    const pad = (n) => String(n).padStart(2, '0');
    timer.textContent = `⏱ ${pad(mins)}:${pad(secs)}`;
  };

  update();
  timerInterval = setInterval(update, 1000);
};

const setupActions = () => {
  const btnApply = document.querySelector('#btnApply');
  const btnClear = document.querySelector('#btnClear');
  const btnFlush = document.querySelector('#btnFlush');
  const btnFastest = document.querySelector('#btnFastest');
  const btnPingAll = document.querySelector('#btnPingAll');
  const btnAdd = document.querySelector('#btnAdd');
  const btnImport = document.querySelector('#btnImport');
  const btnClearList = document.querySelector('#btnClearList');
  const searchInput = document.querySelector('#search');
  const themeToggle = document.querySelector('#themeToggle');
  const langToggle = document.querySelector('#langToggle');
  const sidebarToggle = document.querySelector('#sidebarToggle');
  const sidebarBackdrop = document.querySelector('#sidebarBackdrop');
  const appEl = document.querySelector('#app');

  const toggleSidebar = () => {
    if (!appEl) return;
    if (window.innerWidth <= 880) {
      const isOpen = appEl.classList.toggle('sidebar-open');
      if (sidebarBackdrop) {
        if (isOpen) sidebarBackdrop.classList.remove('hidden');
        else sidebarBackdrop.classList.add('hidden');
      }
    } else {
      appEl.classList.toggle('sidebar-collapsed');
    }
  };

  const closeSidebar = () => {
    if (appEl) appEl.classList.remove('sidebar-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('hidden');
  };

  window.addEventListener('resize', () => {
    if (window.innerWidth > 880) {
      if (sidebarBackdrop) sidebarBackdrop.classList.add('hidden');
      if (appEl) appEl.classList.remove('sidebar-open');
    }
  });

  if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  // اعمال DNS
  if (btnApply) {
    btnApply.addEventListener('click', async () => {
      const dns = getSelectedDns();
      const adapters = getSelectedAdapterNames();

      if (!dns) {
        showToast(t('needDns'));
        return;
      }
      if (!adapters.length) {
        showToast(t('needAdapter'));
        return;
      }

      setStatus(t('applying'), true);
      showToast(t('uacHint'));

      const servers = [dns.primary];
      if (dns.secondary) servers.push(dns.secondary);
      if (dns.primaryIpv6) servers.push(dns.primaryIpv6);
      if (dns.secondaryIpv6) servers.push(dns.secondaryIpv6);

      try {
        const res = await window.api.applyDns({
          servers,
          adapters,
          flush: true,
        });

        if (res && res.ok) {
          activeDnsEntry = dns;
          updateActiveBadge();
          startActiveTimer();
          setStatus(t('ready'), false);
          showToast(t('applied') + ' ✅');

          // تنظیم DoH در ویندوز ۱۱ در صورت وجود تمپلیت
          if (dns.dohTemplate && window.api.setDoh) {
            window.api.setDoh(dns.primary, dns.dohTemplate).catch(() => {});
          }

          loadAdapters();
        } else if (res && res.canceled) {
          setStatus(t('ready'), false);
          showToast(t('uacCanceled'));
        } else {
          setStatus(t('ready'), false);
          showToast(t('applyErr') + `: ${res ? res.error : ''}`);
        }
      } catch (err) {
        setStatus(t('ready'), false);
        showToast(`خطا: ${err.message || err}`);
      }
    });
  }

  // پاکسازی DNS (DHCP)
  if (btnClear) {
    btnClear.addEventListener('click', async () => {
      const adapters = getSelectedAdapterNames();
      if (!adapters.length) {
        showToast(t('needAdapter'));
        return;
      }

      setStatus(t('clearing'), true);
      showToast(t('uacHint'));

      try {
        const res = await window.api.clearDns({
          adapters,
          flush: true,
        });

        if (res && res.ok) {
          activeDnsEntry = null;
          updateActiveBadge();
          setStatus(t('ready'), false);
          showToast(t('cleared') + ' ✅');
          loadAdapters();
        } else if (res && res.canceled) {
          setStatus(t('ready'), false);
          showToast(t('uacCanceled'));
        } else {
          setStatus(t('ready'), false);
          showToast(t('clearErr') + `: ${res ? res.error : ''}`);
        }
      } catch (err) {
        setStatus(t('ready'), false);
        showToast(`خطا: ${err.message || err}`);
      }
    });
  }

  // Flush DNS
  if (btnFlush) {
    btnFlush.addEventListener('click', async () => {
      setStatus(t('flushing'), true);
      try {
        const res = await window.api.flushDns();
        setStatus(t('ready'), false);
        if (res && res.ok) {
          showToast(t('flushed'));
        } else {
          showToast(`خطا در پاک‌سازی کش: ${res ? res.error : ''}`);
        }
      } catch (err) {
        setStatus(t('ready'), false);
        showToast(`خطا: ${err}`);
      }
    });
  }

  // سریع‌ترین DNS
  if (btnFastest) {
    btnFastest.addEventListener('click', async () => {
      const { getDnsList } = await import('./modules/dnsList.js');
      const list = getDnsList();
      if (!list || !list.length) {
        showToast(t('noDnsToPing'));
        return;
      }

      btnFastest.disabled = true;
      setStatus(t('testingPing'), true);
      showToast(t('testingPing'));

      try {
        const best = await findFastestDns(list);
        if (best) {
          setSelectedDnsId(best.entry.id);
          renderDnsList();
          showToast(t('fastestApplied', { name: best.entry.name, ms: best.latency }));
        } else {
          showToast('هیچ سروری به پینگ پاسخ نداد ❌');
        }
      } catch (err) {
        showToast(`خطا در تست: ${err.message || err}`);
      } finally {
        btnFastest.disabled = false;
        setStatus(t('ready'), false);
      }
    });
  }

  // تست پینگ همه سرورها
  if (btnPingAll) {
    btnPingAll.addEventListener('click', async () => {
      const { getDnsList } = await import('./modules/dnsList.js');
      const list = getDnsList();
      if (!list || !list.length) return;

      const ips = list.map((d) => d.primary).filter(Boolean);
      btnPingAll.disabled = true;
      setStatus(t('testingPing'), true);

      try {
        await pingMultipleIps(ips);
        renderDnsList();
        showToast('پینگ تمام سرورها به‌روزرسانی شد ✅');
      } catch (err) {
        showToast(`خطا در پینگ: ${err}`);
      } finally {
        btnPingAll.disabled = false;
        setStatus(t('ready'), false);
      }
    });
  }

  // افزودن DNS
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      openAddEditModal(null);
    });
  }

  // وارد کردن فایل‌های .bat
  if (btnImport) {
    btnImport.addEventListener('click', async () => {
      try {
        const res = await window.api.importBatFiles();
        if (res && res.added > 0) {
          showToast(`تعداد ${res.added} کیت جدید افزوده شد ✅`);
          loadDnsList();
        } else if (res && !res.canceled) {
          showToast('کیت جدیدی یافت نشد.');
        }
      } catch (err) {
        showToast(`خطا در Import: ${err.message || err}`);
      }
    });
  }

  // پاکسازی لیست
  if (btnClearList) {
    btnClearList.addEventListener('click', async () => {
      if (confirm(t('confirmClearList'))) {
        await window.api.clearDnsList();
        loadDnsList();
        showToast(t('listCleared'));
      }
    });
  }

  // جستجو
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      setSearchQuery(e.target.value);
    });
  }

  // تغییر تم
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = getSettings();
      const nextTheme = current.theme === 'light' ? 'dark' : 'light';
      current.theme = nextTheme;
      applyAppearance(current);
      window.api.saveSettings({ theme: nextTheme });
    });
  }

  // تغییر زبان
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const next = getLang() === 'fa' ? 'en' : 'fa';
      setLang(next);
      window.api.saveSettings({ lang: next });
    });
  }
};

const setupAboutLine = async () => {
  const line = document.querySelector('#aboutLine');
  if (!line || !window.api.getAppInfo) return;

  try {
    const info = await window.api.getAppInfo();
    line.innerHTML = `<span>DNS Switcher v${info.version}</span> · <a href="#" id="linkMahdi">mahdi-hp.ir</a>`;
    const link = document.querySelector('#linkMahdi');
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.api.openExternal('https://mahdi-hp.ir');
      });
    }
  } catch (err) {
    line.textContent = 'DNS Switcher · mahdi-hp.ir';
  }
};

// شروع اولیه برنامه
const initApp = async () => {
  await loadSettings();
  setupSettingsModal(showToast);
  setupModalEvents(showToast);
  setupReachabilityModal();
  setupActions();
  setupAboutLine();

  setOnProfileFilterChange((profileId) => {
    setFilterProfileId(profileId);
  });

  setOnProfilesUpdated(() => {
    renderDropdown();
    renderDnsList();
  });

  setOnSettingsChanged(() => {
    loadDnsList();
    loadProfiles();
  });

  await loadProfiles();
  await loadDnsList();
  await loadAdapters();

  setStatus(t('ready'), false);
};

// اجرای کد پس از لود صفحه
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
