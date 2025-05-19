// src/Export2Excel.ts
import ExcelJS, { Workbook, Worksheet, Cell, Style, Alignment, Font, Fill, Border, Borders } from 'exceljs';
import saveAs from 'file-saver';

// --- INTERFACES ---
/**
 * Defines the style for a cell (header or data).
 */
export interface CellStyle { // Exporting for use in App.jsx
  font?: Partial<Font>;
  fill?: Fill;
  border?: Partial<Borders>;
  alignment?: Partial<Alignment>;
  numFmt?: string;
}

/**
 * Defines the configuration for a single column.
 */
export interface ColumnDefinition {
  header: string; // Text for the header
  key: string;    // Key in the data object

  width?: number; // Explicit column width in Excel's character units
  format?: string; // Shortcut for dataStyle.numFmt (e.g., 'yyyy-mm-dd', '$#,##0.00')
  alignment?: 'left' | 'center' | 'right'; // Shortcut for dataStyle.alignment.horizontal

  headerStyle?: CellStyle; // Custom style for the header cell of this column
  // Style for data cells. Can be an object or a function for dynamic styling.
  dataStyle?: CellStyle | ((value: any, rowData: DataObject, cell: Cell) => CellStyle);

  // If true, cell value is treated as a hyperlink.
  // Value can be a URL string (text and link are the same)
  // or an object: { text: string; hyperlink: string; tooltip?: string }
  isHyperlink?: boolean;

  hidden?: boolean; // If true, the column will be hidden

  children?: ColumnDefinition[]; // For grouped headers
}

/**
 * Represents a single row of data.
 */
interface DataObject {
  [key: string]: any; // Values can be of any type, will be converted for Excel
}

/**
 * Configuration for a single worksheet.
 */
export interface SheetConfig {
  sheetName: string;
  data: DataObject[];
  columns: ColumnDefinition[];
  freezePanes?: { row: number; col: number }; // Optional: To freeze rows/columns
  showGridLines?: boolean; // Optional: default is true
  // Add other sheet-specific options here if needed
}

type ExportFormat = 'xlsx' | 'csv';


// --- HELPER FUNCTIONS ---

/**
 * Flattens nested column definitions into a single-level array.
 * This is used for data mapping and determining the actual columns in the sheet.
 */
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

let currentMaxHeaderDepth = 0; // Module-level variable, reset for each sheet processing in XLSX

/**
 * Calculates the maximum depth of grouped headers for a given set of columns.
 */
function calculateSheetMaxHeaderDepth(cols: ColumnDefinition[], currentDepth: number) {
  currentMaxHeaderDepth = Math.max(currentMaxHeaderDepth, currentDepth);
  cols.forEach(col => {
    if (col.children && col.children.length > 0) {
      calculateSheetMaxHeaderDepth(col.children, currentDepth + 1);
    }
  });
}

/**
 * Applies a CellStyle object to an ExcelJS cell.
 */
function applyCellStyle(cell: Cell, style?: CellStyle) {
  if (!style) return;
  if (style.font) cell.font = { ...cell.font, ...style.font };
  if (style.fill) cell.fill = style.fill; // Fill is an object, not partial
  if (style.border) cell.border = { ...cell.border, ...style.border };
  if (style.alignment) cell.alignment = { ...cell.alignment, ...style.alignment };
  if (style.numFmt) cell.numFmt = style.numFmt;
}

/**
 * Recursively builds header rows and merges cells for grouped headers on a worksheet.
 */
function buildAndMergeHeadersForSheet(
  worksheet: Worksheet,
  columns: ColumnDefinition[],
  currentRecursiveDepth: number,
  baseHeaderRowIndex: number, // 1-based
  startDataColumnIndex: number, // 1-based
  totalActualHeaderRows: number
): number {
  let currentExcelColIdx = startDataColumnIndex;
  columns.forEach(colDef => {
    const headerActualRow = baseHeaderRowIndex + currentRecursiveDepth;
    const cell = worksheet.getCell(headerActualRow, currentExcelColIdx);
    cell.value = colDef.header;

    // Default header style
    const defaultHeaderStyle: CellStyle = {
      font: { bold: true, name: 'Calibri', size: 11 },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }, // Light grey
      border: {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      }
    };
    applyCellStyle(cell, defaultHeaderStyle);
    // Apply column-specific header style
    if (colDef.headerStyle) {
      applyCellStyle(cell, colDef.headerStyle);
    }

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

// --- EXPORT FUNCTIONS ---

/**
 * Exports data to an Excel (.xlsx) file, supporting multiple sheets and advanced styling.
 */
export const exportToExcel = async (
  sheetConfigs: SheetConfig[],
  fileName: string = 'exported_data'
): Promise<void> => {
  if (!sheetConfigs || sheetConfigs.length === 0) {
    console.error("No sheet configurations provided for Excel export.");
    return;
  }

  const workbook: Workbook = new ExcelJS.Workbook();
  workbook.creator = 'YourApplication'; // Optional: Set application name
  workbook.created = new Date();
  workbook.modified = new Date();

  for (const config of sheetConfigs) {
    const { sheetName, data, columns, freezePanes, showGridLines = true } = config;
    const worksheet: Worksheet = workbook.addWorksheet(sheetName);

    if (freezePanes) {
      worksheet.views = [
        { state: 'frozen', xSplit: freezePanes.col, ySplit: freezePanes.row, topLeftCell: `R${freezePanes.row + 1}C${freezePanes.col + 1}` }
      ];
    }
    if (showGridLines === false) {
      worksheet.properties.showGridLines = false;
    }


    const isGrouped = columns.some(col => col.children && col.children.length > 0);
    const finalFlatColumns = flattenColumns(columns);
    let headerRowCount = 1;

    // Define worksheet columns based on flattened structure for data mapping and initial width
    worksheet.columns = finalFlatColumns.map(col => ({
      key: col.key,
      width: col.width, // Explicit width if provided, otherwise auto-calculated later
      hidden: col.hidden === true, // Apply hidden status
    }));

    // Build headers
    if (isGrouped) {
      currentMaxHeaderDepth = 0; // Reset for current sheet
      calculateSheetMaxHeaderDepth(columns, 0);
      headerRowCount = currentMaxHeaderDepth + 1;
      buildAndMergeHeadersForSheet(worksheet, columns, 0, 1, 1, headerRowCount);
    } else { // Single header row
      const headerRow = worksheet.getRow(1);
      columns.forEach((col, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = col.header;
        const defaultHeaderStyle: CellStyle = {
          font: { bold: true, name: 'Calibri', size: 11 },
          alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
          border: {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          }
        };
        applyCellStyle(cell, defaultHeaderStyle);
        if (col.headerStyle) {
          applyCellStyle(cell, col.headerStyle);
        }
      });
      if (headerRow.values.length === 0 && columns.length > 0) {
        headerRow.values = columns.map(c => c.header);
      }
      headerRow.commit();
    }

    // Add data rows and apply styles
    data.forEach((rowData) => {
      const row = worksheet.addRow(rowData); // Uses keys from worksheet.columns
      finalFlatColumns.forEach((colDef, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        let cellValue = rowData[colDef.key];

        // Default data cell style
        const defaultDataStyle: CellStyle = {
          alignment: { horizontal: colDef.alignment || 'left', vertical: 'top', wrapText: true },
          font: { name: 'Calibri', size: 10 },
          // No default fill or border for data cells, can be added if needed
        };
        applyCellStyle(cell, defaultDataStyle);

        // Apply numFmt from simple 'format' or from dataStyle
        if (colDef.format && (!colDef.dataStyle || (typeof colDef.dataStyle === 'object' && !colDef.dataStyle.numFmt))) {
          cell.numFmt = colDef.format;
        }


        // Apply column-specific data style (object or function)
        if (colDef.dataStyle) {
          const styleToApply = typeof colDef.dataStyle === 'function'
            ? colDef.dataStyle(cellValue, rowData, cell)
            : colDef.dataStyle;
          applyCellStyle(cell, styleToApply);
        }

        // Handle Hyperlinks
        if (colDef.isHyperlink && cellValue != null) {
          if (typeof cellValue === 'string') {
            cell.value = { text: cellValue, hyperlink: cellValue };
            // Apply default hyperlink font style if not overridden
            if (!cell.font || (!cell.font.color && !cell.font.underline)) {
              cell.font = { ...cell.font, color: { argb: 'FF0000FF' }, underline: true };
            }
          } else if (typeof cellValue === 'object' && cellValue.text && cellValue.hyperlink) {
            cell.value = { text: cellValue.text, hyperlink: cellValue.hyperlink, tooltip: cellValue.tooltip };
            if (!cell.font || (!cell.font.color && !cell.font.underline)) {
              cell.font = { ...cell.font, color: { argb: 'FF0000FF' }, underline: true };
            }
          }
        } else {
          cell.value = cellValue; // Ensure value is set if not hyperlink
        }
      });
    });

    // Auto-fit column widths (if not explicitly set and not hidden)
    worksheet.columns.forEach((excelColumn, index) => {
      const colDef = finalFlatColumns[index];
      if (excelColumn.hidden || (colDef && typeof colDef.width === 'number')) {
        // If hidden or width is explicitly set, use that width (already set during worksheet.columns definition)
        // or if hidden, ExcelJS handles it.
        return;
      }

      let maxColumnLength = 0;
      // Header text length
      for (let i = 1; i <= headerRowCount; i++) {
        const headerCell = worksheet.getCell(i, index + 1);
        const headerText = headerCell.text || (headerCell.value ? String(headerCell.value) : '');
        maxColumnLength = Math.max(maxColumnLength, headerText.length);
      }
      // Data cell content length
      for (let i = 0; i < data.length; i++) {
        const dataRowIndexOnSheet = headerRowCount + 1 + i;
        const cell = worksheet.getCell(dataRowIndexOnSheet, index + 1);
        // For hyperlinks, measure text part
        const valueToMeasure = (colDef.isHyperlink && cell.value && typeof cell.value === 'object' && (cell.value as any).text)
          ? (cell.value as any).text
          : (cell.value ? String(cell.value) : '');
        maxColumnLength = Math.max(maxColumnLength, valueToMeasure.length);
      }
      excelColumn.width = maxColumnLength < 10 ? 10 : maxColumnLength + 5; // Padding
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


// --- CSV Export (largely unchanged, operates on first sheet) ---
const formatValue = (value: any, format?: string): string => {
  if (value == null || value === '') return '';
  if (format) {
    if (format.includes('#,##0')) { // Basic number/currency
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
    } else if (format.toLowerCase() === 'yyyy-mm-dd' || format.toLowerCase() === 'yyyy/mm/dd') { // Date
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return format.toLowerCase() === 'yyyy/mm/dd' ? `${year}/${month}/${day}` : `${year}-${month}-${day}`;
      }
    } else if (format.endsWith('%')) { // Percentage
      const num = Number(value);
      if (!isNaN(num)) {
        const precision = (format.match(/\.(\d+)%$/) || [])[1]?.length || 0;
        return (num * 100).toFixed(precision) + '%';
      }
    }
  }
  // General CSV value escaping
  let stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    stringValue = `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

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

export const exportToCSV = (
  sheetConfig: SheetConfig,
  fileName: string
): void => {
  const { data, columns } = sheetConfig;
  const flatDataColumns = flattenColumns(columns.filter(c => !c.hidden)); // Filter hidden columns for CSV
  const visibleColumns = columns.filter(c => !c.hidden); // Use only visible columns for header generation

  const isGrouped = visibleColumns.some(col => col.children && col.children.length > 0);
  let csvHeaderString: string;

  if (isGrouped) {
    const csvHeaderRowsArray = getCsvHeaderRows(visibleColumns);
    csvHeaderString = csvHeaderRowsArray.map(row => row.join(',')).join('\n');
  } else {
    csvHeaderString = visibleColumns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');
  }

  const dataRows = data.map(item =>
    flatDataColumns.map((col) => { // flatDataColumns already filtered hidden ones
      const rawValue = item[col.key];
      // For CSV, hyperlinks are just text. If it's an object, take the text part or hyperlink.
      let valueToFormat = rawValue;
      if (col.isHyperlink && typeof rawValue === 'object' && rawValue !== null) {
        valueToFormat = rawValue.text || rawValue.hyperlink || '';
      }
      return formatValue(valueToFormat, col.format || (col.dataStyle && typeof col.dataStyle !== 'function' ? col.dataStyle.numFmt : undefined));
    }).join(',')
  );

  const csv = [csvHeaderString, ...dataRows].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
};

/**
 * Main export function. Handles multiple sheets for XLSX and the first sheet for CSV.
 */
export const exportData = async (
  sheetConfigs: SheetConfig[],
  fileName: string = 'exported_data',
  format: ExportFormat = 'xlsx'
): Promise<void> => {
  if (!sheetConfigs || sheetConfigs.length === 0) {
    console.error("No sheet data provided for export.");
    return;
  }

  if (format === 'csv') {
    if (sheetConfigs.length > 1) {
      console.warn("CSV export does not support multiple sheets. Exporting the first sheet only: " + sheetConfigs[0].sheetName);
    }
    exportToCSV(sheetConfigs[0], fileName);
    return Promise.resolve();
  }
  return exportToExcel(sheetConfigs, fileName);
};
