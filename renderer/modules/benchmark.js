'use strict';

/**
 * سیستم تست پینگ، اندازه‌گیری تأخیر و انتخاب سریع‌ترین DNS
 */

const pingCache = new Map(); // ip -> latency_ms | null

export const getCachedPing = (ip) => {
  return pingCache.get(ip);
};

export const pingSingleIp = async (ip) => {
  if (!ip || !window.api || !window.api.pingDns) return null;
  try {
    const res = await window.api.pingDns([ip]);
    const latency = res && res[ip] !== undefined ? res[ip] : null;
    pingCache.set(ip, latency);
    return latency;
  } catch (err) {
    return null;
  }
};

export const pingMultipleIps = async (ips) => {
  if (!ips || !ips.length || !window.api || !window.api.pingDns) return {};
  try {
    const res = await window.api.pingDns(ips);
    if (res) {
      for (const [ip, latency] of Object.entries(res)) {
        pingCache.set(ip, latency);
      }
    }
    return res || {};
  } catch (err) {
    return {};
  }
};

export const createPingBadge = (primaryIp) => {
  const badge = document.createElement('span');
  badge.className = 'dns-ping';
  badge.title = 'کلیک برای تست پینگ این سرور';

  const latency = pingCache.get(primaryIp);
  if (latency === undefined) {
    badge.textContent = 'تست';
    badge.classList.add('ping-loading');
  } else if (latency === null) {
    badge.textContent = '✕ قطع';
    badge.classList.add('ping-bad');
  } else if (latency < 60) {
    badge.textContent = `${latency}ms`;
    badge.classList.add('ping-good');
  } else if (latency < 120) {
    badge.textContent = `${latency}ms`;
    badge.classList.add('ping-med');
  } else {
    badge.textContent = `${latency}ms`;
    badge.classList.add('ping-bad');
  }

  badge.addEventListener('click', async (e) => {
    e.stopPropagation();
    badge.textContent = '…';
    badge.className = 'dns-ping ping-loading';
    const newLatency = await pingSingleIp(primaryIp);
    badge.className = 'dns-ping';
    if (newLatency === null) {
      badge.textContent = '✕ قطع';
      badge.classList.add('ping-bad');
    } else if (newLatency < 60) {
      badge.textContent = `${newLatency}ms`;
      badge.classList.add('ping-good');
    } else if (newLatency < 120) {
      badge.textContent = `${newLatency}ms`;
      badge.classList.add('ping-med');
    } else {
      badge.textContent = `${newLatency}ms`;
      badge.classList.add('ping-bad');
    }
  });

  return badge;
};

export const findFastestDns = async (dnsList) => {
  if (!dnsList || !dnsList.length) return null;

  const validEntries = dnsList.filter((d) => d.primary && d.primary.trim());
  const ips = validEntries.map((d) => d.primary.trim());

  const results = await pingMultipleIps(ips);

  let bestEntry = null;
  let lowestLatency = Infinity;

  for (const entry of validEntries) {
    const ip = entry.primary.trim();
    const lat = results[ip];
    if (typeof lat === 'number' && lat > 0 && lat < lowestLatency) {
      lowestLatency = lat;
      bestEntry = entry;
    }
  }

  return bestEntry ? { entry: bestEntry, latency: lowestLatency } : null;
};
