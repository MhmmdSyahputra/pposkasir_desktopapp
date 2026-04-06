const ch = window.api.product

export const productService = {
  getAll: (params) => ch.getAll(params),
  getById: (id) => ch.getById(id),
  getByKode: (kode) => ch.getByKode(kode),
  create: (payload) => ch.create(payload),
  update: (id, data) => ch.update({ id, data }),
  delete: (id) => ch.delete(id),
  adjustStok: (id, delta) => ch.adjustStok({ id, delta })
}
