// Utility functions for exporting data to CSV and JSON formats

export interface ExportData {
  [key: string]: any
}

// Convert array of objects to CSV format
export const exportToCsv = (data: ExportData[]): string => {
  if (!data || data.length === 0) {
    return 'No data available'
  }

  // Get headers from the first object
  const headers = Object.keys(data[0])
  
  // Create CSV header row
  const csvHeaders = headers.join(',')
  
  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    }).join(',')
  })

  // Combine headers and rows
  return [csvHeaders, ...csvRows].join('\n')
}

// Convert array of objects to formatted JSON
export const exportToJson = (data: ExportData[]): string => {
  const exportObject = {
    exportMetadata: {
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
      dataType: 'blockchain_voting_results',
      anonymized: true,
      note: 'This data has been anonymized to protect voter privacy. No individual votes can be traced back to specific voters.'
    },
    results: data
  }

  return JSON.stringify(exportObject, null, 2)
}

// Helper function to sanitize data for export (remove any potentially identifying information)
export const sanitizeForExport = (data: ExportData[]): ExportData[] => {
  return data.map(item => {
    const sanitized = { ...item }
    
    // Remove any fields that might contain identifying information
    delete sanitized.voter
    delete sanitized.voterAddress
    delete sanitized.userId
    delete sanitized.userEmail
    delete sanitized.userName
    delete sanitized.blockchainAddress
    
    return sanitized
  })
}

// Generate filename with timestamp
export const generateExportFilename = (prefix: string, format: 'csv' | 'json'): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${prefix}-${timestamp}.${format}`
}

// Validate export format
export const isValidExportFormat = (format: string): format is 'csv' | 'json' => {
  return format === 'csv' || format === 'json'
}