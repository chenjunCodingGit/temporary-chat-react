// excelExportUtil.js
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';

// 定义接口
interface ColumnDefinition {
  header: string;
  key: string;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
  format?: string;
}

interface DataObject {
  [key: string]: string | number | boolean | null | undefined;
}

type ExportFormat = 'xlsx' | 'csv';

/**
 * Exports data to an Excel file with custom styling.
 */
export const exportToExcel = async (
  data: DataObject[],
  columns: ColumnDefinition[],
  fileName: string = 'exported_data'
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Define columns and their properties
  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 20, // Default width
  }));

  // Add data rows
  data.forEach(rowData => {
    const row = worksheet.addRow(rowData);

    // Apply cell-level styling based on column definitions
    columns.forEach((col, index) => {
      const cell = row.getCell(index + 1);

      // Apply alignment
      if (col.alignment) {
        cell.alignment = {
          vertical: 'middle',
          horizontal: col.alignment,
        };
      } else {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
        };
      }

      // Apply number format
      if (col.format) {
        cell.numFmt = col.format;
      }
    });
  });

  // Auto-fit column width
  worksheet.columns.forEach(column => {
    if (!column || typeof column.eachCell !== 'function') return;
    let maxColumnLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxColumnLength) {
        maxColumnLength = columnLength;
      }
    });
    column.width = maxColumnLength < 10 ? 10 : maxColumnLength + 6;
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Save the file
  saveAs(
    new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    }), 
    `${fileName}.xlsx`
  );
};

// Add these utility functions at the top of the file
const formatValue = (value: any, format?: string): string => {
  if (value == null || value === '') return '';

  // Handle different format patterns
  if (format) {
    // Handle numbers with currency
    if (format.includes('#,##0')) {
      const num = Number(value);
      if (!isNaN(num)) {
        const hasDecimals = format.includes('.00');
        const currencySymbol = format.match(/[$¥€]/)?.[0] || '';
        
        const formatted = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: hasDecimals ? 2 : 0,
          maximumFractionDigits: hasDecimals ? 2 : 0,
          useGrouping: true
        }).format(num);
        
        return `${currencySymbol}${formatted}`;
      }
    }
    // Handle dates
    else if (format === 'yyyy-mm-dd') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }
  
  return String(value);
};

// Replace the existing exportToCSV function with this enhanced version
const exportToCSV = (
  data: DataObject[],
  columns: ColumnDefinition[],
  fileName: string
): void => {
  // Calculate max width for each column based on content
  const columnWidths = columns.map(col => {
    let maxWidth = col.header.length;
    
    data.forEach(row => {
      const formattedValue = formatValue(row[col.key], col.format);
      maxWidth = Math.max(maxWidth, formattedValue.length);
    });
    
    return maxWidth;
  });

  // Create header row with proper alignment
  const header = columns.map((col, index) => {
    let value = col.header;
    const width = columnWidths[index];
    const padding = ' '.repeat(width - value.length);
    
    switch (col.alignment) {
      case 'right':
        value = padding + value;
        break;
      case 'center':
        const leftPad = ' '.repeat(Math.floor(padding.length / 2));
        const rightPad = ' '.repeat(Math.ceil(padding.length / 2));
        value = leftPad + value + rightPad;
        break;
      default: // 'left'
        value = value + padding;
    }
    
    return value;
  }).join(',');

  // Create data rows with formatting and alignment
  const rows = data.map(item =>
    columns.map((col, index) => {
      const rawValue = item[col.key];
      const formattedValue = formatValue(rawValue, col.format);
      const width = columnWidths[index];
      const padding = ' '.repeat(width - formattedValue.length);
      
      let value = formattedValue;
      
      // Apply alignment
      switch (col.alignment) {
        case 'right':
          value = padding + value;
          break;
        case 'center':
          const leftPad = ' '.repeat(Math.floor(padding.length / 2));
          const rightPad = ' '.repeat(Math.ceil(padding.length / 2));
          value = leftPad + value + rightPad;
          break;
        default: // 'left'
          value = value + padding;
      }
      
      // Escape values containing commas or quotes
      if (value.includes(',') || value.includes('"')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    }).join(',')
  );

  // Combine header and rows
  const csv = [header, ...rows].join('\n');
  
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
};

/**
 * Enhanced export function that supports multiple formats
 */
export const exportData = async (
  data: DataObject[],
  columns: ColumnDefinition[],
  fileName: string = 'exported_data',
  format: ExportFormat = 'xlsx'
): Promise<void> => {
  if (format === 'csv') {
    return exportToCSV(data, columns, fileName);
  }
  return exportToExcel(data, columns, fileName);
};
