const ch = window.api.customer

export const customerService = {
  create: (payload) => ch.create(payload),
  getAll: () => ch.getAll(),
  update: (payload) => ch.update(payload),
  delete: (id) => ch.delete(id),
  debtPaymentCreate: (payload) => ch.debtPaymentCreate(payload),
  debtPaymentGetHistory: (customerId) => ch.debtPaymentGetHistory(customerId)
}
