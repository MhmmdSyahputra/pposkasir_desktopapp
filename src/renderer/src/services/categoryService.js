const ch = window.api.category

export const categoryService = {
  getAll: (params) => ch.getAll(params),
  getById: (id) => ch.getById(id),
  create: (payload) => ch.create(payload),
  update: (id, data) => ch.update({ id, data }),
  delete: (id) => ch.delete(id)
}
