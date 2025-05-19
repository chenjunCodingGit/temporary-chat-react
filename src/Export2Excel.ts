// src/Export2Excel.ts
import ExcelJS, { Workbook, Worksheet } from 'exceljs'; // Explicitly import Workbook and Worksheet
import saveAs from 'file-saver';

// Column definition remains the same
interface ColumnDefinition {
  header: string;
  key: string;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
  format?: string;
  children?: ColumnDefinition[]; // For grouped headers
}

// Data object definition remains the same
interface DataObject {
  [key: string]: string | number | boolean | null | undefined;
}

// New interface for individual sheet configuration
export interface SheetConfig { // Exporting this interface for use in App.jsx
  sheetName: string;
  data: DataObject[];
  columns: ColumnDefinition[];
}

type ExportFormat = 'xlsx' | 'csv';

// Helper function to flatten column definitions
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

// Helper to calculate max header depth for a given set of columns
let currentMaxHeaderDepth = 0; // This will be reset for each sheet
function calculateSheetMaxHeaderDepth(cols: ColumnDefinition[], currentDepth: number) {
  currentMaxHeaderDepth = Math.max(currentMaxHeaderDepth, currentDepth);
  cols.forEach(col => {
    if (col.children && col.children.length > 0) {
      calculateSheetMaxHeaderDepth(col.children, currentDepth + 1);
    }
  });
}

// Helper to build and merge headers for a single worksheet
function buildAndMergeHeadersForSheet(
  worksheet: Worksheet,
  columns: ColumnDefinition[],
  currentRecursiveDepth: number,
  baseHeaderRowIndex: number,
  startDataColumnIndex: number,
  totalActualHeaderRows: number
): number {
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
      buildAndMergeHeadersForSheet(
        worksheet,
        colDef.children,
        currentRecursiveDepth + 1,
        baseHeaderRowIndex,
        currentExcelColIdx,
        totalActualHeaderRows
      );
      currentExcelColIdx += numberOfLeafChildren;
    } else {
      if (currentRecursiveDepth < totalActualHeaderRows - 1) {
        worksheet.mergeCells(
          headerActualRow,
          currentExcelColIdx,
          baseHeaderRowIndex + totalActualHeaderRows - 1,
          currentExcelColIdx
        );
      }
      currentExcelColIdx++;
    }
  });
  return currentExcelColIdx;
}

// Modified to handle an array of SheetConfig for XLSX
export const exportToExcel = async (
  sheetConfigs: SheetConfig[], // Accepts an array of sheet configurations
  fileName: string = 'exported_data'
): Promise<void> => {
  if (!sheetConfigs || sheetConfigs.length === 0) {
    console.error("No sheet configurations provided for Excel export.");
    return;
  }

  const workbook: Workbook = new ExcelJS.Workbook();
  workbook.creator = 'YourAppName';
  workbook.created = new Date();
  workbook.modified = new Date();

  for (const config of sheetConfigs) {
    const { sheetName, data, columns } = config;
    const worksheet: Worksheet = workbook.addWorksheet(sheetName);

    const isGrouped = columns.some(col => col.children && col.children.length > 0);
    const finalFlatColumns = flattenColumns(columns);
    let headerRowCount = 1;

    worksheet.columns = finalFlatColumns.map(col => ({
      key: col.key,
      width: col.width || 20,
    }));

    if (isGrouped) {
      currentMaxHeaderDepth = 0; // Reset depth for current sheet
      calculateSheetMaxHeaderDepth(columns, 0);
      headerRowCount = currentMaxHeaderDepth + 1;
      buildAndMergeHeadersForSheet(worksheet, columns, 0, 1, 1, headerRowCount);
    } else {
      const headerRow = worksheet.getRow(1);
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
      if (headerRow.values.length === 0 && columns.length > 0) {
         headerRow.values = columns.map(c => c.header);
      }
      headerRow.commit();
    }

    data.forEach((rowData) => {
      const row = worksheet.addRow(rowData);
      finalFlatColumns.forEach((col, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.alignment = {
          vertical: 'middle',
          horizontal: col.alignment || 'left',
        };
        if (col.format) {
          cell.numFmt = col.format;
        }
      });
    });
    
    worksheet.columns.forEach((excelColumn, index) => {
        if (!excelColumn || typeof excelColumn.eachCell !== 'function' ) return;
        let maxColumnLength = 0;
        for (let i = 1; i <= headerRowCount; i++) {
            const headerCell = worksheet.getCell(i, index + 1);
            const headerText = headerCell.text || (headerCell.value ? headerCell.value.toString() : '');
            maxColumnLength = Math.max(maxColumnLength, headerText.length);
        }
        for (let i = 0; i < data.length; i++) {
            const dataRowIndexOnSheet = headerRowCount + 1 + i;
            const cell = worksheet.getCell(dataRowIndexOnSheet, index + 1);
            const cellValue = cell.value;
            const columnLength = cellValue ? cellValue.toString().length : 0;
            maxColumnLength = Math.max(maxColumnLength, columnLength);
        }
        excelColumn.width = maxColumnLength < 10 ? 10 : maxColumnLength + 4;
    });
  } // End of loop for sheetConfigs

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
    else if (format === 'yyyy-mm-dd' || format === 'yyyy/mm/dd') { // Added yyyy/mm/dd
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        if (format === 'yyyy/mm/dd') return `${year}/${month}/${day}`;
        return `${year}-${month}-${day}`;
      }
    }
  }
  return String(value).replace(/"/g, '""');
};

// getCsvHeaderRows remains the same, used by exportToCSV for a single sheet
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
    csvMaxHeaderDepth = 0; 
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
                if (childLeafCount > 0) {
                    headerRowsOutput[currentDepth][currentCsvColStartIdx + cumulativeLeafCount] = cellValue;
                }
                populateHeadersRecursive(colDef.children, currentDepth + 1, currentCsvColStartIdx + cumulativeLeafCount);
                cumulativeLeafCount += childLeafCount;
            } else {
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

// exportToCSV now takes a single SheetConfig
export const exportToCSV = (
  sheetConfig: SheetConfig, // Accepts a single sheet configuration
  fileName: string
): void => {
  const { data, columns } = sheetConfig;
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

// exportData now handles SheetConfig[] for XLSX and the first sheet for CSV
export const exportData = async (
  sheetConfigs: SheetConfig[], // Can be single or multiple sheet configs
  fileName: string = 'exported_data',
  format: ExportFormat = 'xlsx'
): Promise<void> => {
  if (!sheetConfigs || sheetConfigs.length === 0) {
    console.error("No sheet data provided for export.");
    return;
  }

  if (format === 'csv') {
    if (sheetConfigs.length > 1) {
      console.warn("CSV export does not support multiple sheets. Exporting the first sheet only.");
    }
    exportToCSV(sheetConfigs[0], fileName); // Export only the first sheet for CSV
    return Promise.resolve();
  }
  return exportToExcel(sheetConfigs, fileName); // Pass all sheet configs for XLSX
};
