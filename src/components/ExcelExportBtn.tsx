// src/components/ExcelExportButton.tsx
import  { useEffect, useState } from 'react';
import * as XLSX from 'xlsx'; // Using SheetJS (xlsx) library
import { saveAs } from 'file-saver';


interface DataRow {
  [key: string]: string | number | Date | undefined | null;
}

export interface SheetTableData {
  tableName: string;
  data: DataRow[];
}

interface ExcelExportButtonProps {
  sheet3Data: SheetTableData;
  sheet4Data: SheetTableData;
  templatePath?: string;
  outputFileName?: string;
}

const ExcelExportBtn: React.FC<ExcelExportButtonProps> = ({
  sheet3Data,
  sheet4Data,
  templatePath = '/excel-template.xlsx',
  outputFileName = 'exported_data'
}) => {
  const [templateWorkbook, setTemplateWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(templatePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch template '${templatePath}': ${response.statusText} (Status: ${response.status})`);
        }
        const arrayBuffer = await response.arrayBuffer();
        // Reading with cellStyles: true attempts to preserve styling.
        // bookVBA: true to preserve macros, if any.
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellStyles: true, bookVBA: true, bookFiles: true, sheets: [0,1,2,3]}); // sheets: 0 reads all sheets
        setTemplateWorkbook(workbook);
      } catch (err: any) {
        console.error('Error fetching template:', err);
        setError(err.message || 'Failed to load Excel template. Ensure it is in the public folder.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [templatePath]);

  const appendDataToTableInSheetXLSX = (
    workbook: XLSX.WorkBook,
    sheetIndex: number, // 0-indexed for sheet access
    tableDataConfig: SheetTableData
  ): boolean => {
    const sheetName = workbook.SheetNames[sheetIndex];
    if (!sheetName) {
      throw new Error(`Sheet at index ${sheetIndex} not found in the template.`);
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Worksheet "${sheetName}" could not be accessed.`);
    }

    // Find the table in the worksheet's !tables array
    const tableInfo = worksheet;
    // const tableInfo = (worksheet['!tables'] || []).find(t => t.name === tableDataConfig.tableName);

    if (!tableInfo) {
      throw new Error(`Table "${tableDataConfig.tableName}" not found in sheet "${sheetName}". Check table name and ensure it's a defined Excel Table.`);
    }

    // Decode the table reference (e.g., "A1:D10")
    // @ts-ignore
    const tableRange = XLSX.utils.decode_range(tableInfo['!ref']);
    const headerRowCount = tableInfo.headerRowCount || 1; // Default to 1 if not specified
    
    // Determine the first data row (0-indexed) within the worksheet's data structure
    const firstDataRowIndex = tableRange.s.r + headerRowCount;

    // Extract headers from the table to map data objects correctly
    const headers: string[] = [];
    if (tableInfo.columns && tableInfo.columns.length > 0) {
        headers.push(...tableInfo.columns.map(col => col.name));
    } else {
        // Fallback: try to read headers from the sheet if table.columns is not populated
        for (let C = tableRange.s.c; C <= tableRange.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: tableRange.s.r, c: C });
            const cell = worksheet[cellAddress];
            headers.push(cell ? String(cell.v) : `Column${C + 1}`);
        }
        if (headers.length === 0) {
            throw new Error(`Could not determine headers for table "${tableDataConfig.tableName}" in sheet "${sheetName}".`);
        }
        console.warn(`Table "${tableDataConfig.tableName}" did not have explicit column definitions in '!tables'. Headers were inferred from the first row of the table range.`);
    }


    // Convert array of objects to array of arrays (AoA) based on header order
    const aoaData: any[][] = tableDataConfig.data.map(dataObject =>
      headers.map(header => dataObject[header] === undefined ? null : dataObject[header])
    );

    // --- Clear existing data rows ---
    // This is done by overwriting the cells with empty values if needed,
    // or simply by preparing to write new data starting at firstDataRowIndex.
    // For simplicity and focusing on append/replace, we'll overwrite.
    // We need to clear from firstDataRowIndex down to tableRange.e.r
    for (let R = firstDataRowIndex; R <= tableRange.e.r; ++R) {
      for (let C = tableRange.s.c; C <= tableRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        delete worksheet[cellAddress]; // Remove old cell data and style
      }
    }
    // Update worksheet !ref if we effectively "shortened" it by deleting cells, though sheet_add_aoa will expand it.
    // This step might be complex if the table was not at the end of the sheet.
    // For now, we assume sheet_add_aoa will handle the new range.

    // Add new data using sheet_add_aoa
    // { origin: -1 } would append, but we want to place it specifically
    // and manage the table's own ref.
    if (aoaData.length > 0) {
      XLSX.utils.sheet_add_aoa(worksheet, aoaData, {
        origin: { r: firstDataRowIndex, c: tableRange.s.c },
        cellStyles: true // This is important for trying to carry over styles if possible
      });
    }

    // Update the table's reference to reflect the new data size
    const newTableEndRow = firstDataRowIndex + aoaData.length -1;
    tableInfo.ref = XLSX.utils.encode_range({
      s: tableRange.s,
      e: { r: newTableEndRow, c: tableRange.e.c }
    });

    // Update the worksheet's overall !ref if it has expanded
    const newWorksheetRange = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");
    if (newTableEndRow > newWorksheetRange.e.r) {
      newWorksheetRange.e.r = newTableEndRow;
    }
    if (tableRange.e.c > newWorksheetRange.e.c) {
      newWorksheetRange.e.c = tableRange.e.c;
    }
    worksheet['!ref'] = XLSX.utils.encode_range(newWorksheetRange);

    return true;
  };

  const handleExport = async () => {
    if (!templateWorkbook) {
      setError('Excel template is not loaded yet. Please wait or check the template path.');
      return;
    }
    if (isLoading) {
      setError('Still loading, please wait.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // XLSX.read creates a new workbook object, so we are working on a copy.
      // To be absolutely sure, especially if state was mutable:
      const newWorkbook = XLSX.read(XLSX.write(templateWorkbook, {type: 'array', bookType: 'xlsx'}), {type: 'array', cellStyles: true, bookVBA: true, bookFiles: true, sheets: [0,1,2,3]}); // Read all sheets


      // Sheet indices are 0-based for workbook.SheetNames array
      appendDataToTableInSheetXLSX(newWorkbook, 2, sheet3Data); // 3rd sheet is index 2
      appendDataToTableInSheetXLSX(newWorkbook, 3, sheet4Data); // 4th sheet is index 3

      // Write the modified workbook to a buffer
      // bookSST: true is for Shared String Table, often good for compatibility & size.
      const outputBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array', cellStyles: true, bookSST: true });
      const blob = new Blob([outputBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
      saveAs(blob, `${outputFileName}_${timestamp}.xlsx`);

    } catch (err: any) {
      console.error('Error during Excel export:', err);
      setError(err.message || 'An unexpected error occurred during export.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isLoading || !templateWorkbook}
        className={`px-4 py-2 font-semibold rounded-lg shadow-md text-white
                    ${(isLoading || !templateWorkbook)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'
                    } transition ease-in-out duration-150`}
      >
        {isLoading ? 'Processing...' : `Export ${outputFileName}.xlsx`}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
    </div>
  );
};

export default ExcelExportBtn;

