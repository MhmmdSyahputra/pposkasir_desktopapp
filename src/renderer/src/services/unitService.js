/**
 * Renderer-side service for units (satuan).
 * All calls go through the preload bridge → IPC → main process → SQLite.
 *
 * Every method returns: { ok: boolean, data?, error? }
 */

const ch = window.api.unit

export const unitService = {
  /** @param {{ search?: string }} [params] */
  getAll: (params) => ch.getAll(params),

  /** @param {number} id */
  getById: (id) => ch.getById(id),

  /**
   * @param {{ nama: string, singkatan: string, deskripsi?: string, aktif?: boolean }} payload
   */
  create: (payload) => ch.create(payload),

  /**
   * @param {number} id
   * @param {{ nama?: string, singkatan?: string, deskripsi?: string, aktif?: boolean }} data
   */
  update: (id, data) => ch.update({ id, data }),

  /** @param {number} id */
  delete: (id) => ch.delete(id)
}
