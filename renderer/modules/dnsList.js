'use strict';

/**
 * مدیریت لیست سرورهای DNS، دراپ‌داون انتخاب، مودال افزودن/ویرایش و Drag & Drop
 */

import { t } from './i18n.js';
import { getProfiles } from './profiles.js';
import { createPingBadge } from './benchmark.js';

let dnsList = [];
let selectedDnsId = null;
let searchQuery = '';
let activeFilterProfileId = null;
let onSelectionChangeCallback = null;

export const setOnDnsSelectionChange = (cb) => {
  onSelectionChangeCallback = cb;
};

export const getDnsList = () => dnsList;

export const getSelectedDns = () => {
  return dnsList.find((d) => d.id === selectedDnsId) || null;
};

export const setSelectedDnsId = (id) => {
  selectedDnsId = id;
  renderDropdown();
  updateRowSelectedState();
  if (onSelectionChangeCallback) onSelectionChangeCallback(getSelectedDns());
};

export const setFilterProfileId = (profileId) => {
  activeFilterProfileId = profileId;
  renderDnsList();
};

export const setSearchQuery = (q) => {
  searchQuery = (q || '').trim().toLowerCase();
  renderDnsList();
};

export const loadDnsList = async () => {
  try {
    dnsList = (await window.api.getDnsList()) || [];
    if (!selectedDnsId && dnsList.length) {
      selectedDnsId = dnsList[0].id;
    }
    renderDropdown();
    renderDnsList();
  } catch (err) {
    console.error('Failed to load DNS list:', err);
  }
};

export const renderDropdown = () => {
  const root = document.querySelector('#ddRoot');
  if (!root) return;

  root.innerHTML = '';

  const selected = getSelectedDns();
  const profiles = getProfiles();

  const wrap = document.createElement('div');
  wrap.className = 'dd-wrap';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dd-btn';

  if (selected) {
    const prof = profiles.find((p) => p.id === selected.profileId);
    btn.innerHTML = `
      <div class="dd-btn-left">
        <span class="dd-icon">${prof && prof.icon ? prof.icon : '🌐'}</span>
        <div class="dd-text">
          <span class="dd-title">${selected.name}</span>
          <span class="dd-sub">${selected.primary}${selected.secondary ? ' · ' + selected.secondary : ''}</span>
        </div>
      </div>
      <span class="dd-arrow">▾</span>
    `;
  } else {
    btn.innerHTML = `
      <div class="dd-btn-left">
        <span class="dd-icon">🌐</span>
        <span class="dd-title">${t('chooseFirst')}</span>
      </div>
      <span class="dd-arrow">▾</span>
    `;
  }

  const menu = document.createElement('div');
  menu.className = 'dd-menu hidden';

  for (const entry of dnsList) {
    const prof = profiles.find((p) => p.id === entry.profileId);
    const item = document.createElement('div');
    item.className = `dd-item ${entry.id === selectedDnsId ? 'selected' : ''}`;
    item.innerHTML = `
      <span class="dd-item-icon">${prof && prof.icon ? prof.icon : '🌐'}</span>
      <div class="dd-item-info">
        <span class="dd-item-name">${entry.name}</span>
        <span class="dd-item-ip">${entry.primary}${entry.secondary ? ' · ' + entry.secondary : ''}</span>
      </div>
    `;
    item.addEventListener('click', () => {
      setSelectedDnsId(entry.id);
      menu.classList.add('hidden');
    });
    menu.appendChild(item);
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    menu.classList.add('hidden');
  });

  wrap.appendChild(btn);
  wrap.appendChild(menu);
  root.appendChild(wrap);
};

const updateRowSelectedState = () => {
  document.querySelectorAll('.dns-row').forEach((row) => {
    if (row.dataset.id === selectedDnsId) {
      row.classList.add('active');
    } else {
      row.classList.remove('active');
    }
  });
};

export const renderDnsList = () => {
  const container = document.querySelector('#dnsList');
  if (!container) return;

  container.innerHTML = '';

  const profiles = getProfiles();

  const filtered = dnsList.filter((entry) => {
    if (activeFilterProfileId && entry.profileId !== activeFilterProfileId) {
      return false;
    }
    if (searchQuery) {
      const matchName = entry.name.toLowerCase().includes(searchQuery);
      const matchPrimary = entry.primary.includes(searchQuery);
      const matchSecondary = entry.secondary && entry.secondary.includes(searchQuery);
      return matchName || matchPrimary || matchSecondary;
    }
    return true;
  });

  if (!filtered.length) {
    container.innerHTML = `<div class="empty">${dnsList.length ? t('noMatch') : t('emptyList')}</div>`;
    return;
  }

  for (const entry of filtered) {
    const prof = profiles.find((p) => p.id === entry.profileId);
    const row = document.createElement('div');
    row.className = `dns-row ${entry.id === selectedDnsId ? 'active' : ''}`;
    row.dataset.id = entry.id;
    row.draggable = !searchQuery;

    // Handle
    const handle = document.createElement('span');
    handle.className = 'row-handle';
    handle.textContent = '⠿';

    // Info
    const info = document.createElement('div');
    info.className = 'dns-row-info';

    const titleRow = document.createElement('div');
    titleRow.className = 'dns-row-title-row';

    const name = document.createElement('span');
    name.className = 'dns-row-name';
    name.textContent = entry.name;

    titleRow.appendChild(name);

    if (prof) {
      const profBadge = document.createElement('span');
      profBadge.className = 'badge-profile';
      profBadge.style.color = prof.color || 'inherit';
      profBadge.style.borderColor = prof.color || 'var(--border)';
      profBadge.textContent = `${prof.icon ? prof.icon + ' ' : ''}${prof.name}`;
      titleRow.appendChild(profBadge);
    }

    if (entry.primaryIpv6) {
      const v6Badge = document.createElement('span');
      v6Badge.className = 'badge badge-v6';
      v6Badge.textContent = 'IPv6';
      titleRow.appendChild(v6Badge);
    }

    // Ping badge
    const pingBadge = createPingBadge(entry.primary);
    titleRow.appendChild(pingBadge);

    const ips = document.createElement('span');
    ips.className = 'dns-row-ips';
    ips.textContent = `${entry.primary}${entry.secondary ? ' · ' + entry.secondary : ''}`;

    info.appendChild(titleRow);
    info.appendChild(ips);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'dns-row-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.textContent = '✏️';
    editBtn.title = t('edit');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddEditModal(entry);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn danger-text';
    delBtn.textContent = '🗑';
    delBtn.title = t('delete');
    delBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(t('confirmDelete'))) {
        await window.api.deleteDns(entry.id);
        dnsList = dnsList.filter((d) => d.id !== entry.id);
        if (selectedDnsId === entry.id) {
          selectedDnsId = dnsList[0] ? dnsList[0].id : null;
        }
        renderDropdown();
        renderDnsList();
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    row.appendChild(handle);
    row.appendChild(info);
    row.appendChild(actions);

    row.addEventListener('click', () => {
      setSelectedDnsId(entry.id);
    });

    // Drag and Drop
    setupRowDragAndDrop(row, entry.id);

    container.appendChild(row);
  }
};

let draggedRowId = null;

const setupRowDragAndDrop = (row, id) => {
  row.addEventListener('dragstart', (e) => {
    draggedRowId = id;
    row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  row.addEventListener('dragend', () => {
    draggedRowId = null;
    row.classList.remove('dragging');
  });

  row.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  row.addEventListener('drop', async (e) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === id) return;

    const fromIdx = dnsList.findIndex((d) => d.id === draggedRowId);
    const toIdx = dnsList.findIndex((d) => d.id === id);

    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = dnsList.splice(fromIdx, 1);
      dnsList.splice(toIdx, 0, moved);

      const orderedIds = dnsList.map((d) => d.id);
      await window.api.reorderDnsList(orderedIds);
      renderDnsList();
      renderDropdown();
    }
  });
};

export const openAddEditModal = (entry = null) => {
  const modal = document.querySelector('#modal');
  const title = document.querySelector('#modalTitle');
  const fName = document.querySelector('#fName');
  const fPrimary = document.querySelector('#fPrimary');
  const fSecondary = document.querySelector('#fSecondary');
  const fProfile = document.querySelector('#fProfile');
  const fPrimaryIpv6 = document.querySelector('#fPrimaryIpv6');
  const fSecondaryIpv6 = document.querySelector('#fSecondaryIpv6');
  const fDoh = document.querySelector('#fDoh');
  const advDetails = document.querySelector('#advDnsDetails');

  if (!modal) return;

  const profiles = getProfiles();
  if (fProfile) {
    fProfile.innerHTML = '';
    for (const p of profiles) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.icon ? p.icon + ' ' : ''}${p.name}`;
      fProfile.appendChild(opt);
    }
  }

  if (entry) {
    title.textContent = t('editDnsTitle');
    fName.value = entry.name || '';
    fPrimary.value = entry.primary || '';
    fSecondary.value = entry.secondary || '';
    if (fProfile) fProfile.value = entry.profileId || 'general';
    if (fPrimaryIpv6) fPrimaryIpv6.value = entry.primaryIpv6 || '';
    if (fSecondaryIpv6) fSecondaryIpv6.value = entry.secondaryIpv6 || '';
    if (fDoh) fDoh.value = entry.dohTemplate || '';
    if (advDetails && (entry.primaryIpv6 || entry.dohTemplate)) {
      advDetails.open = true;
    }
    modal.dataset.editId = entry.id;
  } else {
    title.textContent = t('addDnsTitle');
    fName.value = '';
    fPrimary.value = '';
    fSecondary.value = '';
    if (fProfile) fProfile.value = 'general';
    if (fPrimaryIpv6) fPrimaryIpv6.value = '';
    if (fSecondaryIpv6) fSecondaryIpv6.value = '';
    if (fDoh) fDoh.value = '';
    if (advDetails) advDetails.open = false;
    delete modal.dataset.editId;
  }

  modal.classList.remove('hidden');
};

export const setupModalEvents = (showToast) => {
  const modal = document.querySelector('#modal');
  const btnClose = document.querySelector('#modalClose');
  const btnCancel = document.querySelector('#modalCancel');
  const btnSave = document.querySelector('#modalSave');

  const close = () => {
    if (modal) modal.classList.add('hidden');
  };

  if (btnClose) btnClose.addEventListener('click', close);
  if (btnCancel) btnCancel.addEventListener('click', close);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
  }

  if (btnSave) {
    btnSave.addEventListener('click', async () => {
      const fName = document.querySelector('#fName');
      const fPrimary = document.querySelector('#fPrimary');
      const fSecondary = document.querySelector('#fSecondary');
      const fProfile = document.querySelector('#fProfile');
      const fPrimaryIpv6 = document.querySelector('#fPrimaryIpv6');
      const fSecondaryIpv6 = document.querySelector('#fSecondaryIpv6');
      const fDoh = document.querySelector('#fDoh');

      const name = fName.value.trim();
      const primary = fPrimary.value.trim();
      const secondary = fSecondary.value.trim();
      const profileId = fProfile ? fProfile.value : 'general';
      const primaryIpv6 = fPrimaryIpv6 ? fPrimaryIpv6.value.trim() : '';
      const secondaryIpv6 = fSecondaryIpv6 ? fSecondaryIpv6.value.trim() : '';
      const dohTemplate = fDoh ? fDoh.value.trim() : '';

      if (!name) {
        showToast(t('nameRequired'));
        return;
      }
      if (!primary) {
        showToast(t('invalidIp'));
        return;
      }

      const payload = {
        name,
        primary,
        secondary,
        profileId,
        primaryIpv6: primaryIpv6 || null,
        secondaryIpv6: secondaryIpv6 || null,
        dohTemplate: dohTemplate || null,
      };

      try {
        const editId = modal.dataset.editId;
        if (editId) {
          const updated = await window.api.updateDns(editId, payload);
          const idx = dnsList.findIndex((d) => d.id === editId);
          if (idx !== -1) dnsList[idx] = updated;
          showToast(t('saved'));
        } else {
          const created = await window.api.addDns(payload);
          dnsList.push(created);
          setSelectedDnsId(created.id);
          showToast(t('saved'));
        }

        renderDropdown();
        renderDnsList();
        close();
      } catch (err) {
        showToast(`خطا در ذخیره: ${err.message || err}`);
      }
    });
  }
};
