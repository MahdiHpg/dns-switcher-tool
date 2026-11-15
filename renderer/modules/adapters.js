'use strict';

/**
 * مدیریت رابط‌های شبکه (کارت‌های شبکه) و انتخاب آن‌ها
 */

let adapters = [];
const selected = new Set();
let onSelectionChangeCallback = null;

export const setOnAdapterChange = (cb) => {
  onSelectionChangeCallback = cb;
};

export const getSelectedAdapterNames = () => {
  return Array.from(selected);
};

export const loadAdapters = async () => {
  const container = document.querySelector('#adapterList');
  if (!container) return;

  try {
    const res = await window.api.getAdapters();
    if (!res || !res.ok) {
      container.innerHTML = `<div class="error-box">خطا در دریافت کارت‌های شبکه</div>`;
      return;
    }

    adapters = res.adapters || [];
    renderAdapters(container);
  } catch (err) {
    container.innerHTML = `<div class="error-box">خطا در ارتباط با سیستم: ${err.message || err}</div>`;
  }
};

const renderAdapters = (container) => {
  container.innerHTML = '';

  if (!adapters.length) {
    container.innerHTML = `<div class="empty">کارت شبکه‌ای یافت نشد.</div>`;
    return;
  }

  // انتخاب پیش‌فرض: کارت‌های فعال متصل
  if (selected.size === 0) {
    for (const ad of adapters) {
      if (ad.connected) {
        selected.add(ad.name);
      }
    }
  }

  for (const ad of adapters) {
    const isChecked = selected.has(ad.name);

    const item = document.createElement('label');
    item.className = `adapter-item ${isChecked ? 'selected' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'adapter-checkbox-native';
    checkbox.checked = isChecked;

    const checkVisual = document.createElement('span');
    checkVisual.className = 'adapter-check';
    checkVisual.innerHTML = '✓';

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selected.add(ad.name);
        item.classList.add('selected');
      } else {
        selected.delete(ad.name);
        item.classList.remove('selected');
      }
      if (onSelectionChangeCallback) onSelectionChangeCallback(getSelectedAdapterNames());
    });

    const info = document.createElement('div');
    info.className = 'adapter-info';

    const topRow = document.createElement('div');
    topRow.className = 'adapter-top';

    const statusDot = document.createElement('span');
    statusDot.className = `adapter-dot ${ad.connected ? 'up' : ''}`;
    statusDot.title = ad.connected ? 'متصل' : 'قطع';

    const name = document.createElement('span');
    name.className = 'adapter-name';
    name.textContent = ad.name;
    name.title = ad.name;

    topRow.appendChild(statusDot);
    topRow.appendChild(name);
    info.appendChild(topRow);

    if (ad.description) {
      const desc = document.createElement('div');
      desc.className = 'adapter-desc';
      desc.textContent = ad.description;
      desc.title = ad.description;
      info.appendChild(desc);
    }

    if (ad.dns && ad.dns.length) {
      const dnsBadge = document.createElement('div');
      dnsBadge.className = 'adapter-current';
      dnsBadge.title = `DNS فعلی: ${ad.dns.join(', ')}`;
      dnsBadge.textContent = ad.dns.join(', ');
      info.appendChild(dnsBadge);
    }

    item.appendChild(checkbox);
    item.appendChild(checkVisual);
    item.appendChild(info);
    container.appendChild(item);
  }
};
