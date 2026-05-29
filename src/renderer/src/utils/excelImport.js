import * as XLSX from 'xlsx'

/**
 * Read and parse an Excel file into an array of objects.
 * @param {File} file - The Excel file to read.
 * @returns {Promise<Array<any>>} - The parsed data.
 */
export const importExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
        resolve(json)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = (err) => reject(err)
    reader.readAsBinaryString(file)
  })
}
