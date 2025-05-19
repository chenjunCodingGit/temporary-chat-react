// src/Export2Excel.ts
import ExcelJS, { Workbook, Worksheet, Cell, Style, Alignment, Font, Fill, Border, ImagePosition } from 'exceljs';
import saveAs from 'file-saver';

// --- INTERFACES ---
export interface CellStyle {
  font?: Partial<Font>;
  fill?: Fill;
  border?: Partial<Border>;
  alignment?: Partial<Alignment>;
  numFmt?: string;
}

export interface ImageOptions {
  width: number; // Image width in pixels
  height: number; // Image height in pixels
  hyperlink?: string; // Optional hyperlink for the image
  altText?: string; // Optional alt text (Excel doesn't directly show this, but good for data)
}

export interface ColumnDefinition {
  header: string;
  key: string;
  width?: number;
  format?: string;
  alignment?: 'left' | 'center' | 'right';
  headerStyle?: CellStyle;
  dataStyle?: CellStyle | ((value: any, rowData: DataObject, cell: Cell) => CellStyle);
  isHyperlink?: boolean;
  isImage?: boolean; // True if this column contains image URLs
  imageOptions?: ImageOptions; // Options for displaying images
  hidden?: boolean;
  children?: ColumnDefinition[];
}

interface DataObject {
  [key: string]: any;
}

export interface SheetConfig {
  sheetName: string;
  data: DataObject[];
  columns: ColumnDefinition[];
  freezePanes?: { row: number; col: number };
  showGridLines?: boolean;
}

type ExportFormat = 'xlsx' | 'csv';

// --- HELPER FUNCTIONS (flattenColumns, calculateSheetMaxHeaderDepth, applyCellStyle, buildAndMergeHeadersForSheet) ---
// These helpers remain largely the same as in the previous version with advanced styling.
// For brevity, they are not repeated here but are assumed to be present.

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

let currentMaxHeaderDepth = 0; 

function calculateSheetMaxHeaderDepth(cols: ColumnDefinition[], currentDepth: number) {
  currentMaxHeaderDepth = Math.max(currentMaxHeaderDepth, currentDepth);
  cols.forEach(col => {
    if (col.children && col.children.length > 0) {
      calculateSheetMaxHeaderDepth(col.children, currentDepth + 1);
    }
  });
}

function applyCellStyle(cell: Cell, style?: CellStyle) {
  if (!style) return;
  if (style.font) cell.font = { ...cell.font, ...style.font };
  if (style.fill) cell.fill = style.fill;
  if (style.border) cell.border = { ...cell.border, ...style.border };
  if (style.alignment) cell.alignment = { ...cell.alignment, ...style.alignment };
  if (style.numFmt) cell.numFmt = style.numFmt;
}

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
    const defaultHeaderStyle: CellStyle = {
      font: { bold: true, name: 'Calibri', size: 11 },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
      border: {
        style: 'thin'
      }
    };
    applyCellStyle(cell, defaultHeaderStyle);
    if (colDef.headerStyle) {
      applyCellStyle(cell, colDef.headerStyle);
    }

    if (colDef.children && colDef.children.length > 0) {
      const numberOfLeafChildren = flattenColumns(colDef.children).length;
      if (numberOfLeafChildren > 1) {
        worksheet.mergeCells(
          headerActualRow, currentExcelColIdx,
          headerActualRow, currentExcelColIdx + numberOfLeafChildren - 1
        );
      }
      buildAndMergeHeadersForSheet(
        worksheet, colDef.children, currentRecursiveDepth + 1,
        baseHeaderRowIndex, currentExcelColIdx, totalActualHeaderRows
      );
      currentExcelColIdx += numberOfLeafChildren;
    } else {
      if (currentRecursiveDepth < totalActualHeaderRows - 1) {
        worksheet.mergeCells(
          headerActualRow, currentExcelColIdx,
          baseHeaderRowIndex + totalActualHeaderRows - 1, currentExcelColIdx
        );
      }
      currentExcelColIdx++;
    }
  });
  return currentExcelColIdx;
}


// --- EXPORT FUNCTIONS ---
export const exportToExcel = async (
  sheetConfigs: SheetConfig[],
  fileName: string = 'exported_data'
): Promise<void> => {
  if (!sheetConfigs || sheetConfigs.length === 0) {
    console.error("No sheet configurations provided for Excel export.");
    return;
  }

  const workbook: Workbook = new ExcelJS.Workbook();
  workbook.creator = 'YourApplication';
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

    worksheet.columns = finalFlatColumns.map(col => ({
      key: col.key,
      width: col.width,
      hidden: col.hidden === true,
    }));

    if (isGrouped) {
      currentMaxHeaderDepth = 0;
      calculateSheetMaxHeaderDepth(columns, 0);
      headerRowCount = currentMaxHeaderDepth + 1;
      buildAndMergeHeadersForSheet(worksheet, columns, 0, 1, 1, headerRowCount);
    } else {
      const headerRow = worksheet.getRow(1);
      columns.forEach((col, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = col.header;
        const defaultHeaderStyle: CellStyle = {
          font: { bold: true, name: 'Calibri', size: 11 },
          alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
          border: { style: 'thin' }
        };
        applyCellStyle(cell, defaultHeaderStyle);
        if (col.headerStyle) applyCellStyle(cell, col.headerStyle);
      });
      if (headerRow.values.length === 0 && columns.length > 0) {
         headerRow.values = columns.map(c => c.header);
      }
      headerRow.commit();
    }

    // Add data rows and apply styles - including image handling
    for (let i = 0; i < data.length; i++) {
      const rowData = data[i];
      const row = worksheet.addRow(rowData); // Add data first

      for (let j = 0; j < finalFlatColumns.length; j++) {
        const colDef = finalFlatColumns[j];
        const cell = row.getCell(j + 1); // 1-based index
        let cellValue = rowData[colDef.key];

        // Apply default styles first
        const defaultDataStyle: CellStyle = {
          alignment: { horizontal: colDef.alignment || 'left', vertical: 'top', wrapText: true },
          font: { name: 'Calibri', size: 10 },
        };
        applyCellStyle(cell, defaultDataStyle);
         if (colDef.format && (!colDef.dataStyle || (typeof colDef.dataStyle !== 'function' && !colDef.dataStyle.numFmt))) {
            cell.numFmt = colDef.format;
        }
        if (colDef.dataStyle) {
          const styleToApply = typeof colDef.dataStyle === 'function'
            ? colDef.dataStyle(cellValue, rowData, cell)
            : colDef.dataStyle;
          applyCellStyle(cell, styleToApply);
        }

        if (colDef.isImage && cellValue && typeof cellValue === 'string' && colDef.imageOptions) {
          try {
            const response = await fetch(cellValue);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText} (URL: ${cellValue})`);
            const imageBuffer = await response.arrayBuffer();
            
            let extension = 'png'; // Default extension
            const urlParts = cellValue.split('.');
            const extFromUrl = urlParts[urlParts.length - 1].toLowerCase();
            if (['png', 'jpeg', 'jpg', 'gif'].includes(extFromUrl)) {
                extension = extFromUrl === 'jpg' ? 'jpeg' : extFromUrl;
            }

            const imageId = workbook.addImage({
              buffer: imageBuffer,
              extension: extension as 'png' | 'jpeg' | 'gif',
            });

            // Position and size the image
            const imgPos: ImagePosition = {
              tl: { col: j, row: row.number - 1 }, // 0-indexed col and row for image anchor
              ext: { 
                width: colDef.imageOptions.width, 
                height: colDef.imageOptions.height 
              }
            };
            if(colDef.imageOptions.hyperlink) {
                (imgPos as any).hyperlinks = { // ExcelJS type might not show this, but it works
                    hyperlink: colDef.imageOptions.hyperlink,
                    tooltip: colDef.imageOptions.altText || colDef.imageOptions.hyperlink
                }
            }
            worksheet.addImage(imageId, imgPos);
            
            cell.value = colDef.imageOptions.altText || null; // Set alt text or clear cell

            // Adjust row height to fit the image (approximate)
            const imageHeightInPoints = colDef.imageOptions.height * 0.75;
            if (!row.height || row.height < imageHeightInPoints) {
              row.height = imageHeightInPoints;
            }
          } catch (imgError) {
            console.error(`Error loading image ${cellValue}:`, imgError);
            cell.value = colDef.imageOptions?.altText || 'Error: Img Load';
            applyCellStyle(cell, {font: {color: {argb: 'FFFF0000'}}}); // Style error text
          }
        } else if (colDef.isHyperlink && cellValue != null) {
          if (typeof cellValue === 'string') {
            cell.value = { text: cellValue, hyperlink: cellValue };
          } else if (typeof cellValue === 'object' && cellValue.text && cellValue.hyperlink) {
            cell.value = { text: cellValue.text, hyperlink: cellValue.hyperlink, tooltip: cellValue.tooltip };
          }
          // Apply default hyperlink font style if not overridden by dataStyle
          if (!cell.font || (!cell.font.color && !cell.font.underline)) {
            cell.font = { ...cell.font, color: { argb: 'FF0000FF' }, underline: true };
          }
        } else {
          // For non-image, non-hyperlink cells, ensure the value is set if not already by addRow
           if(cell.value === undefined || cell.value === null ) cell.value = cellValue;
        }
      }
    }
    
    // Auto-fit column widths
    worksheet.columns.forEach((excelColumn, index) => {
      const colDef = finalFlatColumns[index];
      if (excelColumn.hidden || (colDef && typeof colDef.width === 'number')) {
        return;
      }
      let maxColumnLength = 0;
      for (let i = 1; i <= headerRowCount; i++) {
        const headerCell = worksheet.getCell(i, index + 1);
        const headerText = headerCell.text || (headerCell.value ? String(headerCell.value) : '');
        maxColumnLength = Math.max(maxColumnLength, headerText.length);
      }
      for (let i = 0; i < data.length; i++) {
        const dataRowIndexOnSheet = headerRowCount + 1 + i;
        const cell = worksheet.getCell(dataRowIndexOnSheet, index + 1);
        let valueToMeasure = cell.value ? String(cell.value) : '';
        if (colDef.isImage && colDef.imageOptions?.altText) {
            valueToMeasure = colDef.imageOptions.altText; // Use alt text for image column width
        } else if (colDef.isHyperlink && cell.value && typeof cell.value === 'object' && (cell.value as any).text) {
           valueToMeasure = (cell.value as any).text;
        }
        maxColumnLength = Math.max(maxColumnLength, valueToMeasure.length);
      }
      excelColumn.width = maxColumnLength < 10 ? 10 : maxColumnLength + 5;
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 
    `${fileName}.xlsx`
  );
};

// --- CSV Export (images will be represented by URL or alt text) ---
const formatValueForCSV = (value: any, colDef: ColumnDefinition): string => {
  let outputValue = '';
  if (value == null) {
    outputValue = '';
  } else if (colDef.isImage) {
    // For CSV, use alt text if available, otherwise the URL (original value)
    outputValue = colDef.imageOptions?.altText || (typeof value === 'string' ? value : '[Image]');
  } else if (colDef.isHyperlink) {
    if (typeof value === 'object' && value.text) {
      outputValue = value.text; // Use display text for hyperlinks in CSV
    } else {
      outputValue = String(value);
    }
  } else {
    // Use the existing formatValue logic for other types
    // but pass the specific format string from column definition
    return formatValue(value, colDef.format || (colDef.dataStyle && typeof colDef.dataStyle !== 'function' ? colDef.dataStyle.numFmt : undefined));
  }

  // General CSV value escaping
  if (outputValue.includes(',') || outputValue.includes('"') || outputValue.includes('\n')) {
    outputValue = `"${outputValue.replace(/"/g, '""')}"`;
  }
  return outputValue;
};

// Original formatValue for non-CSV specific formatting (used by formatValueForCSV)
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
    } else if (format.toLowerCase() === 'yyyy-mm-dd' || format.toLowerCase() === 'yyyy/mm/dd' || format.includes('年') ) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        if (format.toLowerCase() === 'yyyy/mm/dd') return `${year}/${month}/${day}`;
        if (format.includes('年')) return `${year}年${month}月${day}日`; // Example for Chinese date format
        return `${year}-${month}-${day}`;
      }
    } else if (format.endsWith('%')) {
        const num = Number(value);
        if(!isNaN(num)){
            const precision = (format.match(/\.(\d+)%$/) || [])[1]?.length || 0;
            return (num * 100).toFixed(precision) + '%';
        }
    }
  }
  return String(value); // Return raw string if no specific format matches
};


// getCsvHeaderRows and calculateCsvMaxHeaderDepth remain the same
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
  const visibleColumns = columns.filter(c => !c.hidden);
  const flatDataColumns = flattenColumns(visibleColumns); 

  const isGrouped = visibleColumns.some(col => col.children && col.children.length > 0);
  let csvHeaderString: string;

  if (isGrouped) {
    const csvHeaderRowsArray = getCsvHeaderRows(visibleColumns);
    csvHeaderString = csvHeaderRowsArray.map(row => row.join(',')).join('\n');
  } else {
    csvHeaderString = visibleColumns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');
  }

  const dataRows = data.map(item =>
    flatDataColumns.map((colDef) => {
      const rawValue = item[colDef.key];
      return formatValueForCSV(rawValue, colDef); // Use the new CSV-specific formatter
    }).join(',')
  );

  const csv = [csvHeaderString, ...dataRows].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
};


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
