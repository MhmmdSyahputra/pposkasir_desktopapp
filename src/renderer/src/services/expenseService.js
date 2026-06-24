const ch = window.api.expense

export const expenseService = {
  create: (payload) => ch.create(payload),
  getAll: (params) => ch.getAll(params),
  getReport: (params) => ch.getReport(params),
  delete: (id) => ch.delete(id),
  categoryCreate: (payload) => ch.categoryCreate(payload),
  categoryGetAll: () => ch.categoryGetAll(),
  categoryDelete: (id) => ch.categoryDelete(id)
}
