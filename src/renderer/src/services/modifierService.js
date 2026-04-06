export const modifierService = {
  getAll: (params) => window.api.modifier.getAll(params),
  getById: (id) => window.api.modifier.getById(id),
  create: (payload) => window.api.modifier.create(payload),
  update: (id, data) => window.api.modifier.update(id, data),
  delete: (id) => window.api.modifier.delete(id),
  getProductGroups: (productId) => window.api.modifier.getProductGroups(productId),
  getAllProductGroups: () => window.api.modifier.getAllProductGroups(),
  setProductGroups: (productId, groupIds) =>
    window.api.modifier.setProductGroups(productId, groupIds)
}
