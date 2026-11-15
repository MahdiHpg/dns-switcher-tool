'use strict';

/**
 * پل میان رابط کاربری و هسته‌ی Rust — جانشین `preload.js` نسخه‌ی Electron.
 *
 * این فایل پیش از اجرای جاوااسکریپت تزریق می‌شود و متدهای `window.api` را
 * با توابع ناهمگام متصل به دستورات Rust می‌سازد.
 */
(() => {
  const invoke = (command, args) => {
    const core = window.__TAURI__ && window.__TAURI__.core;
    if (!core) return Promise.reject(new Error('Tauri runtime unavailable'));
    return core.invoke(command, args);
  };

  window.api = {
    // ---------- dns ----------
    getAdapters: () => invoke('dns_get_adapters'),
    applyDns: (payload) => invoke('dns_apply', { payload }),
    clearDns: (payload) => invoke('dns_clear', { payload }),
    flushDns: () => invoke('dns_flush'),
    isAdmin: () => invoke('dns_is_admin'),
    pingDns: (ips) => invoke('dns_ping', { ips }),
    checkReachability: () => invoke('dns_check_reachability'),
    isAutostartEnabled: () => invoke('dns_is_autostart_enabled'),
    setAutostart: (enable) => invoke('dns_set_autostart', { enable }),
    setDoh: (ip, template) => invoke('dns_set_doh', { ip, template }),

    // ---------- dns list ----------
    getDnsList: () => invoke('store_get_dns_list'),
    addDns: (entry) => invoke('store_add_dns', { entry }),
    updateDns: (id, patch) => invoke('store_update_dns', { id, patch }),
    deleteDns: (id) => invoke('store_delete_dns', { id }),
    reorderDnsList: (orderedIds) => invoke('store_reorder_dns_list', { orderedIds }),
    clearDnsList: () => invoke('store_clear_dns_list'),
    importBatFiles: () => invoke('store_import_bat_files'),

    // ---------- profiles ----------
    getProfiles: () => invoke('store_get_profiles'),
    addProfile: (name, icon, color) => invoke('store_add_profile', { name, icon, color }),
    updateProfile: (id, patch) => invoke('store_update_profile', { id, patch }),
    deleteProfile: (id) => invoke('store_delete_profile', { id }),
    reorderProfiles: (orderedIds) => invoke('store_reorder_profiles', { orderedIds }),
    folderIcons: () => invoke('store_folder_icons'),
    iconSvgs: (values) => invoke('store_icon_svgs', { values }),

    // ---------- settings & backup ----------
    getSettings: () => invoke('store_get_settings'),
    saveSettings: (patch) => invoke('store_save_settings', { patch }),
    restoreSeed: () => invoke('store_restore_seed'),
    exportBackup: () => invoke('store_export_backup'),
    importBackup: (data) => invoke('store_import_backup', { data }),
    fetchRemoteDns: (url) => invoke('store_fetch_remote_dns', { url }),

    // ---------- app ----------
    getAppInfo: () => invoke('app_get_info'),
    openExternal: (url) => invoke('app_open_external', { url }),
    openAdaptersPage: () => invoke('app_open_adapters_page'),
    showError: (title, message) => invoke('app_show_error', { title, message }),
  };
})();
