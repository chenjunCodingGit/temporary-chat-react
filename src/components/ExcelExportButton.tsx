// components/ExcelExportButton.tsx
import { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface DataRow {
  [key: string]: string | number | Date | undefined;
}

interface SheetData {
  sheetName: string;
  data: DataRow[];
}

const ExcelExportButton = ({ thirdSheetData, fourthSheetData }: { thirdSheetData: SheetData, fourthSheetData: SheetData }) => {
  const [templateWorkbook, setTemplateWorkbook] = useState<ExcelJS.Workbook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      try {
        // 假设模板文件位于public目录下
        const response = await fetch('/excel-template.xlsx');
        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        setTemplateWorkbook(workbook);
      } catch (err: any) {
        setError(err.message || 'Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, []);

  const handleExport = async () => {
    if (!templateWorkbook) {
      setError('Template not loaded yet');
      return;
    }

    try {
      // 复制工作簿以保留原始模板
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await templateWorkbook.xlsx.writeBuffer());

      // 获取第三个和第四个工作表
      const thirdSheet = workbook.getWorksheet(3);
      const fourthSheet = workbook.getWorksheet(4);

      if (!thirdSheet || !fourthSheet) {
        throw new Error('Third or fourth sheet not found in template');
      }

      // 处理第三个工作表中的表格（Table2）
      appendDataToTable(thirdSheet, thirdSheetData.data, 'Table2');
      
      // 处理第四个工作表中的表格（Table1）
      appendDataToTable(fourthSheet, fourthSheetData.data, 'Table1');

      // 写入并下载Excel文件
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // 添加时间戳避免缓存问题
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      saveAs(blob, `导出数据_${timestamp}.xlsx`);
    } catch (err: any) {
      console.error('导出Excel时出错:', err);
      setError(err.message || 'Export failed');
    }
  };

  // 将数据追加到工作表中的指定表格
  const appendDataToTable = (worksheet: ExcelJS.Worksheet, data: DataRow[], tableName: string) => {
    // 通过名称获取表格
    // @ts-ignore
    const table = worksheet.tables[tableName];
    // const table = worksheet.tables.find(t => t.name === tableName);
    
    if (!table) {
      console.warn(`表格 "${tableName}" 在工作表中未找到，直接添加数据`);
      data.forEach(row => worksheet.addRow(row));
      return;
    }
    
    // 获取表格的数据范围
    const tableRange = table.ref;
    const [startCell, endCell] = tableRange.split(':');
    // @ts-ignore
    const startRow = ExcelJS.Range.rowIndex(startCell);
    // @ts-ignore
    const startCol = ExcelJS.Range.columnIndex(startCell);
    
    // 获取表格的列映射（列标题到列索引）
    const columnMap: Record<string, number> = {};
    table.columns.forEach((column, index) => {
      columnMap[column.name] = startCol + index;
    });
    
    // 清空表格中的现有数据行（保留表头）
    // @ts-ignore
    const tableRowCount = ExcelJS.Range.rowIndex(endCell) - startRow;
    if (tableRowCount > 0) {
      worksheet.spliceRows(startRow + 1, tableRowCount);
    }
    
    // 向表格追加新数据
    data.forEach((rowData, rowIndex) => {
      const rowNum = startRow + 1 + rowIndex;
      const row = worksheet.getRow(rowNum);
      
      // 填充每一列的数据
      Object.entries(rowData).forEach(([columnName, value]) => {
        const colIndex = columnMap[columnName];
        if (colIndex) {
          const cell = row.getCell(colIndex);
          cell.value = value;
          
          // 保留原始格式
          if (rowIndex === 0) {
            // 从模板的第一行数据复制格式
            const templateRow = worksheet.getRow(startRow + 1);
            const templateCell = templateRow.getCell(colIndex);
            cell.style = { ...templateCell.style };
          }
          
          // 特殊处理日期格式
          if (value instanceof Date) {
            cell.numFmt = 'yyyy-mm-dd';
          }
        }
      });
      
      row.commit();
    });
    
    // 更新表格范围以包含新数据
    const newEndRow = startRow + data.length;
    // @ts-ignore
    const newEndCell = `${ExcelJS.Range.columnLetter(startCol + table.columns.length - 1)}${newEndRow}`;
    table.ref = `${startCell}:${newEndCell}`;
    
    // 确保表格扩展到包含所有数据行
    table.commit();
  };

  return (
    <button 
      disabled={loading || !templateWorkbook} 
      onClick={handleExport}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300"
    >
      {loading ? '加载模板中...' : '导出Excel'}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </button>
  );
};

export default ExcelExportButton;