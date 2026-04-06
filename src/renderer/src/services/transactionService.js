export const transactionService = {
  create: (payload) => window.api.transaction.create(payload),
  getById: (id) => window.api.transaction.getById(id),
  getAll: (params) => window.api.transaction.getAll(params),
  getStats: (params) => window.api.transaction.getStats(params),
  getReport: (params) => window.api.transaction.getReport(params),
  void: (id) => window.api.transaction.void(id)
}
