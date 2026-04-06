import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  device: {
    deviceName: async () => await ipcRenderer.invoke('get-device-label'),
    deviceUuid: async () => await ipcRenderer.invoke('get-device-uuid'),
    deviceBrand: async () => await ipcRenderer.invoke('get-device-brand'),
    deviceInfo: async () => await ipcRenderer.invoke('get-device-info')
  },

  windowNotification: {
    show: async (payload) => ipcRenderer.invoke('window:show-notification', payload)
  },

  getMyConfig: async () => await ipcRenderer.invoke('get-my-config'),
  getImage: async () => await ipcRenderer.invoke('get-assets-path'),
  getNotificationSoundPath: async () => await ipcRenderer.invoke('get-notification-sound-path'),

  printOrderReceipt(data) {
    ipcRenderer.send('print-order-receipt', data)
  },

  checkForUpdates: () => ipcRenderer.send('check-for-updates'),

  onUpdateNotification: (callback) => {
    const handler = (_event, message, severity) => callback(message, severity)
    ipcRenderer.on('update:notification', handler)
    return () => ipcRenderer.removeListener('update:notification', handler)
  },

  onUpdateProgress: (callback) => {
    const handler = (_event, percent) => callback(percent)
    ipcRenderer.on('update:download-progress', handler)
    return () => ipcRenderer.removeListener('update:download-progress', handler)
  },

  checkNetworkStatus: async () => await ipcRenderer.invoke('check-network-status'),

  onNetworkStatusChanged: (callback) => {
    const handler = (_event, isOnline) => callback(isOnline)
    ipcRenderer.on('network-status-changed', handler)
    return () => ipcRenderer.removeListener('network-status-changed', handler)
  },

  printThermalLan: async (data) => await ipcRenderer.invoke('print-thermal-lan', data),

  testThermalPrinter: async ({ printerIp, printerPort = 9100 }) =>
    await ipcRenderer.invoke('test-thermal-printer', { printerIp, printerPort }),

  getAppVersion: async () => await ipcRenderer.invoke('get-app-version'),

  auth: {
    loginSuper: (payload) => ipcRenderer.invoke('auth:loginSuper', payload),
    loginCashier: (payload) => ipcRenderer.invoke('auth:loginCashier', payload),
    cashierCreate: (payload) => ipcRenderer.invoke('auth:cashierCreate', payload),
    cashierGetAll: () => ipcRenderer.invoke('auth:cashierGetAll'),
    getActiveCashierSession: (payload) =>
      ipcRenderer.invoke('auth:getActiveCashierSession', payload),
    openCashierSession: (payload) => ipcRenderer.invoke('auth:openCashierSession', payload),
    closeCashierSession: (payload) => ipcRenderer.invoke('auth:closeCashierSession', payload),
    getCashierSessionHistory: (payload) =>
      ipcRenderer.invoke('auth:getCashierSessionHistory', payload)
  },

  system: {
    resetAllData: (payload) => ipcRenderer.invoke('system:resetAllData', payload),
    seedDummyData: (payload) => ipcRenderer.invoke('system:seedDummyData', payload)
  },

  product: {
    getAll: (params) => ipcRenderer.invoke('product:getAll', params),
    getById: (id) => ipcRenderer.invoke('product:getById', id),
    getByKode: (kode) => ipcRenderer.invoke('product:getByKode', kode),
    create: (payload) => ipcRenderer.invoke('product:create', payload),
    update: (payload) => ipcRenderer.invoke('product:update', payload),
    delete: (id) => ipcRenderer.invoke('product:delete', id),
    adjustStok: (payload) => ipcRenderer.invoke('product:adjustStok', payload)
  },

  category: {
    getAll: (params) => ipcRenderer.invoke('category:getAll', params),
    getById: (id) => ipcRenderer.invoke('category:getById', id),
    create: (payload) => ipcRenderer.invoke('category:create', payload),
    update: (payload) => ipcRenderer.invoke('category:update', payload),
    delete: (id) => ipcRenderer.invoke('category:delete', id)
  },

  unit: {
    getAll: (params) => ipcRenderer.invoke('unit:getAll', params),
    getById: (id) => ipcRenderer.invoke('unit:getById', id),
    create: (payload) => ipcRenderer.invoke('unit:create', payload),
    update: (payload) => ipcRenderer.invoke('unit:update', payload),
    delete: (id) => ipcRenderer.invoke('unit:delete', id)
  },

  image: {
    save: (payload) => ipcRenderer.invoke('image:save', payload),
    delete: (relativePath) => ipcRenderer.invoke('image:delete', relativePath)
  },

  modifier: {
    getAll: (params) => ipcRenderer.invoke('modifier:getAll', params),
    getById: (id) => ipcRenderer.invoke('modifier:getById', id),
    create: (payload) => ipcRenderer.invoke('modifier:create', payload),
    update: (id, data) => ipcRenderer.invoke('modifier:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('modifier:delete', id),
    getProductGroups: (productId) => ipcRenderer.invoke('modifier:getProductGroups', productId),
    getAllProductGroups: () => ipcRenderer.invoke('modifier:getAllProductGroups'),
    setProductGroups: (productId, groupIds) =>
      ipcRenderer.invoke('modifier:setProductGroups', { productId, groupIds })
  },

  transaction: {
    create: (payload) => ipcRenderer.invoke('transaction:create', payload),
    getById: (id) => ipcRenderer.invoke('transaction:getById', id),
    getAll: (params) => ipcRenderer.invoke('transaction:getAll', params),
    getStats: (params) => ipcRenderer.invoke('transaction:getStats', params),
    getReport: (params) => ipcRenderer.invoke('transaction:getReport', params),
    void: (id) => ipcRenderer.invoke('transaction:void', id)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
