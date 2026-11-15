'use strict';

/**
 * مدیریت پروفایل‌ها و پوشه‌ها، آیکون‌ها و رنگ‌های اختصاصی
 */

import { t } from './i18n.js';

let profiles = [];
let activeProfileId = null; // null یعنی همه
let onProfileFilterChangeCallback = null;
let onProfilesUpdatedCallback = null;

export const setOnProfileFilterChange = (cb) => {
  onProfileFilterChangeCallback = cb;
};

export const setOnProfilesUpdated = (cb) => {
  onProfilesUpdatedCallback = cb;
};

export const getProfiles = () => profiles;

export const getActiveProfileId = () => activeProfileId;

export const loadProfiles = async () => {
  try {
    profiles = (await window.api.getProfiles()) || [];
    renderProfileChips();
  } catch (err) {
    console.error('Failed to load profiles:', err);
  }
};

export const renderProfileChips = () => {
  const container = document.querySelector('#profileChips');
  if (!container) return;

  container.innerHTML = '';

  // دکمه "همه"
  const allChip = document.createElement('button');
  allChip.className = `chip ${activeProfileId === null ? 'active' : ''}`;
  allChip.textContent = t('all');
  allChip.addEventListener('click', () => {
    activeProfileId = null;
    renderProfileChips();
    if (onProfileFilterChangeCallback) onProfileFilterChangeCallback(null);
  });
  container.appendChild(allChip);

  for (const prof of profiles) {
    const chip = document.createElement('button');
    chip.className = `chip folder-chip ${activeProfileId === prof.id ? 'active' : ''}`;
    chip.dataset.id = prof.id;

    if (prof.color) {
      chip.style.setProperty('--chip-color', prof.color);
      chip.style.borderColor = prof.color;
    }

    const dot = document.createElement('span');
    dot.className = 'chip-dot';
    if (prof.color) dot.style.background = prof.color;

    const label = document.createElement('span');
    label.className = 'chip-label';
    label.textContent = `${prof.icon ? prof.icon + ' ' : ''}${prof.name}`;

    chip.appendChild(dot);
    chip.appendChild(label);

    chip.addEventListener('click', () => {
      activeProfileId = prof.id;
      renderProfileChips();
      if (onProfileFilterChangeCallback) onProfileFilterChangeCallback(prof.id);
    });

    container.appendChild(chip);
  }
};

export const setupProfilesModal = (showToast) => {
  const modal = document.querySelector('#profilesModal');
  const btnOpen = document.querySelector('#btnProfiles');
  const btnClose = document.querySelector('#profilesClose');
  const btnDone = document.querySelector('#profilesDone');
  const listEl = document.querySelector('#profilesList');

  const npName = document.querySelector('#npName');
  const npColor = document.querySelector('#npColor');
  const npIcon = document.querySelector('#npIcon');
  const npAdd = document.querySelector('#npAdd');

  const renderModalList = () => {
    if (!listEl) return;
    listEl.innerHTML = '';

    for (const prof of profiles) {
      const row = document.createElement('div');
      row.className = 'profile-row';
      row.dataset.id = prof.id;

      const handle = document.createElement('span');
      handle.className = 'row-handle';
      handle.textContent = '⠿';

      const iconSpan = document.createElement('span');
      iconSpan.className = 'profile-row-icon';
      iconSpan.textContent = prof.icon || '📁';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'profile-row-name';
      nameInput.value = prof.name;
      nameInput.addEventListener('change', async () => {
        const val = nameInput.value.trim();
        if (val) {
          await window.api.updateProfile(prof.id, { name: val });
          prof.name = val;
          renderProfileChips();
        }
      });

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.className = 'profile-row-color';
      colorInput.value = prof.color || '#6366f1';
      colorInput.addEventListener('change', async () => {
        await window.api.updateProfile(prof.id, { color: colorInput.value });
        prof.color = colorInput.value;
        renderProfileChips();
      });

      row.appendChild(handle);
      row.appendChild(iconSpan);
      row.appendChild(nameInput);
      row.appendChild(colorInput);

      if (prof.id !== 'general') {
        const delBtn = document.createElement('button');
        delBtn.className = 'icon-btn danger-text';
        delBtn.textContent = '🗑';
        delBtn.title = t('delete');
        delBtn.addEventListener('click', async () => {
          if (confirm(t('confirmDeleteProfile'))) {
            await window.api.deleteProfile(prof.id);
            profiles = profiles.filter((p) => p.id !== prof.id);
            if (activeProfileId === prof.id) activeProfileId = null;
            renderModalList();
            renderProfileChips();
            if (onProfilesUpdatedCallback) onProfilesUpdatedCallback();
          }
        });
        row.appendChild(delBtn);
      }

      listEl.appendChild(row);
    }
  };

  const open = () => {
    modal.classList.remove('hidden');
    renderModalList();
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

  if (npAdd && npName && npColor) {
    npAdd.addEventListener('click', async () => {
      const name = npName.value.trim();
      if (!name) return;
      const icon = npIcon ? npIcon.textContent.trim() : '📁';
      const color = npColor.value;

      try {
        const created = await window.api.addProfile(name, icon, color);
        profiles.push(created);
        npName.value = '';
        renderModalList();
        renderProfileChips();
        showToast(t('saved'));
        if (onProfilesUpdatedCallback) onProfilesUpdatedCallback();
      } catch (err) {
        showToast(`خطا: ${err}`);
      }
    });
  }
};
