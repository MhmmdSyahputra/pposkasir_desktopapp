import * as XLSX from 'xlsx'

const sanitizePart = (value) => String(value || '').replace(/[^a-zA-Z0-9_-]+/g, '_')

const makeStamp = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}${mm}${dd}_${hh}${mi}`
}

/**
 * Export tabular data to xlsx.
 * @param {object} payload
 * @param {string} payload.fileBaseName
 * @param {string} payload.sheetName
 * @param {Array<{header: string, key: string, map?: (row:any)=>any}>} payload.columns
 * @param {Array<any>} payload.rows
 */
export const exportRowsToExcel = ({ fileBaseName, sheetName = 'Sheet1', columns, rows }) => {
  const mappedRows = (rows || []).map((row) => {
    const out = {}
    for (const col of columns) {
      out[col.header] = col.map ? col.map(row) : row[col.key]
    }
    return out
  })

  const ws = XLSX.utils.json_to_sheet(mappedRows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  const safeBase = sanitizePart(fileBaseName || 'export')
  XLSX.writeFile(wb, `${safeBase}_${makeStamp()}.xlsx`)
}
