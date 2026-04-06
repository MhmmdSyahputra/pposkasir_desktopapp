/**
 * Renderer-side service for local product image management.
 *
 * Strategy:
 *   – Images are stored in {userData}/product-images/{productId}_{uuid}.{ext}
 *   – Served to the renderer via the custom `ppos://` protocol
 *   – DB stores a JSON array of relative paths in `products.images`
 */

const PPOS_BASE = 'ppos://localhost/'

export const imageService = {
  /**
   * Upload a File to the main process and persist it on disk.
   * @param {File} file
   * @param {number} productId
   * @returns {Promise<{ ok: boolean, data?: string, error?: string }>}
   *   `data` is the relative path, e.g. "product-images/42_uuid.jpg"
   */
  save: async (file, productId) => {
    const buffer = await file.arrayBuffer()
    const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
    return window.api.image.save({ buffer, ext, productId })
  },

  /** Delete a single image file by its relative path. */
  delete: (relativePath) => window.api.image.delete(relativePath),

  /**
   * Convert a relative path (stored in DB) to a URL usable as <img src>.
   * e.g. "product-images/42_uuid.jpg" → "ppos://localhost/product-images/42_uuid.jpg"
   */
  toUrl: (relativePath) => `${PPOS_BASE}${relativePath}`,

  /**
   * Parse the raw images JSON string from the DB into a display-ready array.
   * Each item: { id, url, relativePath, name }
   */
  parseImages: (imagesJson) => {
    try {
      const paths = JSON.parse(imagesJson || '[]')
      return paths.map((p) => ({
        id: p,
        url: `${PPOS_BASE}${p}`,
        relativePath: p,
        name: p.split('/').pop()
      }))
    } catch {
      return []
    }
  }
}
