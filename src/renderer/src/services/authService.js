const ch = window.api.auth

export const authService = {
  loginSuper: (payload) => ch.loginSuper(payload),
  loginCashier: (payload) => ch.loginCashier(payload),
  cashierCreate: (payload) => ch.cashierCreate(payload),
  cashierGetAll: () => ch.cashierGetAll(),
  getActiveCashierSession: (payload) => ch.getActiveCashierSession(payload),
  openCashierSession: (payload) => ch.openCashierSession(payload),
  closeCashierSession: (payload) => ch.closeCashierSession(payload),
  getCashierSessionHistory: (payload) => ch.getCashierSessionHistory(payload)
}
