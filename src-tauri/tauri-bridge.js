'use strict';

/**
 * پل میان رابط کاربری و هسته‌ی Rust — جانشین `preload.js` نسخه‌ی Electron.
 *
 * این فایل پیش از اجرای `app.js` تزریق می‌شود و دقیقاً همان متدهای قبلیِ
 * `window.api` را با همان نام و همان شکل بازگشتی می‌سازد، پس هیچ تغییری در
 * فایل‌های رابط کاربری لازم نیست.
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

    // ---------- settings ----------
    getSettings: () => invoke('store_get_settings'),
    saveSettings: (patch) => invoke('store_save_settings', { patch }),
    restoreSeed: () => invoke('store_restore_seed'),

    // ---------- app ----------
    getAppInfo: () => invoke('app_get_info'),
    openExternal: (url) => invoke('app_open_external', { url }),
    openAdaptersPage: () => invoke('app_open_adapters_page'),
    showError: (title, message) => invoke('app_show_error', { title, message }),
  };
})();
