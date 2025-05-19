// src/Export2Excel.ts
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';

interface ColumnDefinition {
  header: string;
  key: string;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
  format?: string;
  children?: ColumnDefinition[];
}

interface DataObject {
  [key: string]: string | number | boolean | null | undefined;
}

type ExportFormat = 'xlsx' | 'csv';

const flattenColumns = (columns: ColumnDefinition[]): ColumnDefinition[] => {
  let flat: ColumnDefinition[] = [];
  columns.forEach(col => {
    if (col.children && col.children.length > 0) {
      flat = flat.concat(flattenColumns(col.children));
    } else {
      flat.push(col);
    }
  });
  return flat;
};

// Renamed to avoid conflict if this file is part of a larger module
// and to make its purpose clearer within this function's scope.
let currentMaxHeaderDepth = 0;

function calculateExcelMaxHeaderDepth(cols: ColumnDefinition[], currentDepth: number) {
  currentMaxHeaderDepth = Math.max(currentMaxHeaderDepth, currentDepth);
  cols.forEach(col => {
    if (col.children && col.children.length > 0) {
      calculateExcelMaxHeaderDepth(col.children, currentDepth + 1);
    }
  });
}

function buildAndMergeHeadersXLSX(
  worksheet: ExcelJS.Worksheet,
  columns: ColumnDefinition[],
  currentRecursiveDepth: number, // Current depth in the recursion
  baseHeaderRowIndex: number,    // The 1-based row index where headers start
  startDataColumnIndex: number,  // The 1-based column index in the Excel sheet
  totalActualHeaderRows: number  // Total number of rows headers will occupy
): number { // Returns the next available data column index
  let currentExcelColIdx = startDataColumnIndex;

  columns.forEach(colDef => {
    const headerActualRow = baseHeaderRowIndex + currentRecursiveDepth;
    const cell = worksheet.getCell(headerActualRow, currentExcelColIdx);
    cell.value = colDef.header;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.font = { bold: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };

    if (colDef.children && colDef.children.length > 0) {
      const numberOfLeafChildren = flattenColumns(colDef.children).length;
      if (numberOfLeafChildren > 1) {
        worksheet.mergeCells(
          headerActualRow,
          currentExcelColIdx,
          headerActualRow,
          currentExcelColIdx + numberOfLeafChildren - 1
        );
      }
      // Recursively build children headers on the next row
      buildAndMergeHeadersXLSX(
        worksheet,
        colDef.children,
        currentRecursiveDepth + 1,
        baseHeaderRowIndex,
        currentExcelColIdx, // Children start at the same column index as the parent
        totalActualHeaderRows
      );
      currentExcelColIdx += numberOfLeafChildren;
    } else {
      // This is a leaf node or a header without children.
      // It should span downwards if it's not at the deepest header level.
      if (currentRecursiveDepth < totalActualHeaderRows - 1) {
        worksheet.mergeCells(
          headerActualRow,
          currentExcelColIdx,
          baseHeaderRowIndex + totalActualHeaderRows - 1, // Merge down to the last header row
          currentExcelColIdx
        );
      }
      currentExcelColIdx++;
    }
  });
  return currentExcelColIdx; // Return the next column index to start from for the next header at this level
}


export const exportToExcel = async (
  data: DataObject[],
  columns: ColumnDefinition[],
  fileName: string = 'exported_data'
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  const isGrouped = columns.some(col => col.children && col.children.length > 0);
  const finalFlatColumns = flattenColumns(columns);
  let headerRowCount = 1;

  // Set up the basic column structure for data mapping
  // The `header` property here is not used for display if grouped,
  // but `key` is crucial for `worksheet.addRow(rowData)`.
  worksheet.columns = finalFlatColumns.map(col => ({
    key: col.key,
    width: col.width || 20, // Default width, will be overridden by auto-fit later
    // For non-grouped, this header will be used by the first row.
    // For grouped, headers are written manually by buildAndMergeHeadersXLSX.
  }));

  if (isGrouped) {
    currentMaxHeaderDepth = 0; // Reset global for this export
    calculateExcelMaxHeaderDepth(columns, 0);
    headerRowCount = currentMaxHeaderDepth + 1;
    // buildAndMergeHeadersXLSX will write to rows 1 through headerRowCount
    buildAndMergeHeadersXLSX(worksheet, columns, 0, 1, 1, headerRowCount);
  } else {
    // Single header row for non-grouped columns
    const headerRow = worksheet.getRow(1); // Get the first row
    columns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = col.header;
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    // Ensure the row is committed if only styling was applied to an existing header from worksheet.columns
     if (headerRow.values.length === 0 && columns.length > 0) { // if row was conceptually empty
        headerRow.values = columns.map(c => c.header); // then set its values
        headerRow.commit();
     }
  }

  // Add data rows starting AFTER the header rows
  // worksheet.addRows(data) will append after the last existing row.
  // If headers correctly occupy 'headerRowCount' rows, data starts on headerRowCount + 1.
  data.forEach((rowData, rowIndex) => {
    // It's safer to get the specific row number for data if addRows is problematic
    // However, if worksheet.columns is set up with keys, addRow(object) should work as expected.
    // Let's ensure worksheet.columns has been set up correctly before this point.
    // The `worksheet.columns` assignment above should handle keys correctly.
    const row = worksheet.addRow(rowData); //This should append correctly if headers are done.

    // Apply cell-level styling to data rows
    finalFlatColumns.forEach((col, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      
      cell.alignment = {
        vertical: 'middle',
        horizontal: col.alignment || 'left',
      };

      if (col.format) {
        cell.numFmt = col.format;
      }
      // Optionally add default borders to data cells if desired
      // cell.border = { ... };
    });
  });
  
  // Auto-fit column width
  worksheet.columns.forEach((excelColumn, index) => {
    if (!excelColumn || typeof excelColumn.eachCell !== 'function' ) return;
    
    let maxColumnLength = 0;
    const currentFlatColumnDef = finalFlatColumns[index]; // The actual leaf column definition

    // 1. Consider header text for width calculation
    // Iterate through all potential header cells for this physical column
    for (let i = 1; i <= headerRowCount; i++) {
      const headerCell = worksheet.getCell(i, index + 1); // (row, col) are 1-based
      const headerText = headerCell.text || (headerCell.value ? headerCell.value.toString() : '');
      const headerTextLength = headerText.length;
      if (headerTextLength > maxColumnLength) {
        maxColumnLength = headerTextLength;
      }
    }
    
    // 2. Consider data cell content for width calculation
    // Iterate over data rows (rows after headerRowCount)
    for (let i = 0; i < data.length; i++) {
        const dataRowIndexOnSheet = headerRowCount + 1 + i;
        const cell = worksheet.getCell(dataRowIndexOnSheet, index + 1);
        const cellValue = cell.value;
        const columnLength = cellValue ? cellValue.toString().length : 0;
        if (columnLength > maxColumnLength) {
            maxColumnLength = columnLength;
        }
    }
    
    excelColumn.width = maxColumnLength < 10 ? 10 : maxColumnLength + 4; // Adjusted padding
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    }), 
    `${fileName}.xlsx`
  );
};

// formatValue function remains the same
const formatValue = (value: any, format?: string): string => {
  if (value == null || value === '') return '';
  if (format) {
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
    else if (format === 'yyyy-mm-dd') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }
  return String(value).replace(/"/g, '""'); // Escape double quotes for CSV
};

// getCsvHeaderRows and exportToCSV remain largely the same,
// but ensure getCsvHeaderRows also uses calculateExcelMaxHeaderDepth correctly.
let csvMaxHeaderDepth = 0;
function calculateCsvMaxHeaderDepth(cols: ColumnDefinition[], currentDepth: number) {
  csvMaxHeaderDepth = Math.max(csvMaxHeaderDepth, currentDepth);
  cols.forEach(col => {
    if (col.children && col.children.length > 0) {
      calculateCsvMaxHeaderDepth(col.children, currentDepth + 1);
    }
  });
}


const getCsvHeaderRows = (columns: ColumnDefinition[]): string[][] => {
    const finalFlatCols = flattenColumns(columns);
    const numLeafColumns = finalFlatCols.length;

    csvMaxHeaderDepth = 0; // Reset for this CSV export
    calculateCsvMaxHeaderDepth(columns, 0);
    const totalHeaderLevels = csvMaxHeaderDepth + 1;

    const headerRowsOutput: string[][] = Array.from({ length: totalHeaderLevels }, () => 
        new Array(numLeafColumns).fill('')
    );

    function populateHeadersRecursive(
        colsToProcess: ColumnDefinition[], 
        currentDepth: number, 
        currentCsvColStartIdx: number
    ): number {
        let cumulativeLeafCount = 0;
        colsToProcess.forEach(colDef => {
            const cellValue = `"${colDef.header.replace(/"/g, '""')}"`;
            if (colDef.children && colDef.children.length > 0) {
                const childLeafCount = flattenColumns(colDef.children).length;
                // Place the group header and span it by filling the first cell of the span
                if (childLeafCount > 0) {
                    headerRowsOutput[currentDepth][currentCsvColStartIdx + cumulativeLeafCount] = cellValue;
                    // Optionally, fill subsequent cells in the span for better text editor view:
                    // for (let i = 1; i < childLeafCount; i++) {
                    //   headerRowsOutput[currentDepth][currentCsvColStartIdx + cumulativeLeafCount + i] = ' '; // or `""`
                    // }
                }
                populateHeadersRecursive(colDef.children, currentDepth + 1, currentCsvColStartIdx + cumulativeLeafCount);
                cumulativeLeafCount += childLeafCount;
            } else {
                // Leaf node, fill it down to the max depth
                for (let d = currentDepth; d < totalHeaderLevels; d++) {
                    headerRowsOutput[d][currentCsvColStartIdx + cumulativeLeafCount] = cellValue;
                }
                cumulativeLeafCount++;
            }
        });
        return cumulativeLeafCount;
    }

    populateHeadersRecursive(columns, 0, 0);
    return headerRowsOutput;
};


export const exportToCSV = (
  data: DataObject[],
  columns: ColumnDefinition[],
  fileName: string
): void => {
  const flatDataColumns = flattenColumns(columns);
  const isGrouped = columns.some(col => col.children && col.children.length > 0);
  let csvHeaderString: string;

  if (isGrouped) {
    const csvHeaderRowsArray = getCsvHeaderRows(columns);
    csvHeaderString = csvHeaderRowsArray.map(row => row.join(',')).join('\n');
  } else {
    csvHeaderString = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');
  }

  const dataRows = data.map(item =>
    flatDataColumns.map((col) => {
      const rawValue = item[col.key];
      let formattedValue = formatValue(rawValue, col.format);
      if (formattedValue.includes(',') || formattedValue.includes('"') || formattedValue.includes('\n')) {
        formattedValue = `"${formattedValue.replace(/"/g, '""')}"`;
      }
      return formattedValue;
    }).join(',')
  );

  const csv = [csvHeaderString, ...dataRows].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
};

export const exportData = async (
  data: DataObject[],
  columns: ColumnDefinition[],
  fileName: string = 'exported_data',
  format: ExportFormat = 'xlsx'
): Promise<void> => {
  if (format === 'csv') {
    exportToCSV(data, columns, fileName);
    return Promise.resolve();
  }
  return exportToExcel(data, columns, fileName);
};