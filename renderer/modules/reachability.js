'use strict';

/**
 * تست دسترسی مستقیم به سرویس‌های تحریم‌شده
 */

export const setupReachabilityModal = () => {
  const modal = document.querySelector('#reachabilityModal');
  const btnOpen = document.querySelector('#btnReachability');
  const btnClose = document.querySelector('#reachabilityClose');
  const btnDone = document.querySelector('#reachabilityDone');
  const btnRecheck = document.querySelector('#btnRecheckReachability');
  const grid = document.querySelector('#reachabilityGrid');

  if (!modal || !btnOpen) return;

  const runCheck = async () => {
    if (!grid) return;
    grid.innerHTML = '<div class="loading">در حال بررسی ارتباط با سرورها…</div>';

    try {
      const results = await window.api.checkReachability();
      grid.innerHTML = '';

      if (!results || !results.length) {
        grid.innerHTML = '<div class="empty">اطلاعاتی دریافت نشد.</div>';
        return;
      }

      for (const item of results) {
        const card = document.createElement('div');
        card.className = 'reach-card';

        const left = document.createElement('div');
        left.className = 'reach-card-left';

        const name = document.createElement('span');
        name.className = 'reach-name';
        name.textContent = item.name;

        const host = document.createElement('span');
        host.className = 'reach-host';
        host.textContent = item.host;

        left.appendChild(name);
        left.appendChild(host);

        const badge = document.createElement('span');
        badge.className = `reach-badge ${item.ok ? 'reach-ok' : 'reach-err'}`;
        if (item.ok) {
          badge.textContent = `✔ باز (${item.latencyMs || 0}ms)`;
        } else {
          badge.textContent = '✖ مسدود / تحریم';
        }

        card.appendChild(left);
        card.appendChild(badge);
        grid.appendChild(card);
      }
    } catch (err) {
      grid.innerHTML = `<div class="error">خطا در بررسی ارتباط: ${err.message || err}</div>`;
    }
  };

  const open = () => {
    modal.classList.remove('hidden');
    runCheck();
  };

  const close = () => {
    modal.classList.add('hidden');
  };

  btnOpen.addEventListener('click', open);
  if (btnClose) btnClose.addEventListener('click', close);
  if (btnDone) btnDone.addEventListener('click', close);
  if (btnRecheck) btnRecheck.addEventListener('click', runCheck);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
};
