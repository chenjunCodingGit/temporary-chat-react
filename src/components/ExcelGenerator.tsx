import { ReactNode, useState } from 'react';
import * as XLSX from 'exceljs';
import { saveAs } from 'file-saver';

interface TableData {
  headers: string[];
  rows: any[][];
}

interface ExcelGeneratorProps {
  defaultFileName?: string;
  defaultSheetName?: string;
  initialData?: TableData;
  children?: ReactNode;
}

export const ExcelGenerator = ({
  defaultFileName = 'exported-data',
  defaultSheetName = 'Table',
  initialData = { headers: [], rows: [] },
  children = <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    导出Excel
  </button>
}: ExcelGeneratorProps) => {
  const [tableData, setTableData] = useState<TableData>(initialData);

  const generateExcel = async () => {
    try {
    //
      const workbook = new XLSX.Workbook();
      const worksheet = workbook.addWorksheet(defaultSheetName);

      // 添加表头
      worksheet.addRow(tableData.headers);

      // 添加数据行
      tableData.rows.forEach(row => {
        worksheet.addRow(row);
      });

      // 创建表格
      const tableRange = `A1:${String.fromCharCode(64 + tableData.headers.length)}${tableData.rows.length + 1}`;
      const table = worksheet.addTable({
        name: 'DataTable',
        ref: 'A1',
        headerRow: true,
        totalsRow: false,
        style: {
          theme: 'TableStyleMedium9',
          showRowStripes: true,
        },
        columns: tableData.headers.map(header => ({ name: header })),
        rows: tableData.rows,
      });

      // 示例：操作表格行
      // 注意：ExcelJS表格行索引从0开始（表头为0）
      
      // 删除前两行数据（索引1和2，跳过表头）
      // @ts-ignore
      if (table.rows.length > 2) {
        table.removeRows(1, 2);
      }
      
      // 在索引5处插入新行
      // @ts-ignore
      if (table.rows.length >= 5) {
        table.addRow([new Date(), '插入行', '示例数据'], 5);
      }
      
      // 追加新行到表格底部
      table.addRow([new Date(), '追加行', '示例数据']);
      
      // 提交表格更改到工作表
      table.commit();

      // 自动调整列宽
      // @ts-ignore
      worksheet.columns.forEach(column => {
        // @ts-ignore
        column.width = column.values?.reduce((max, value) => {
          const length = value?.toString().length || 0;
          return length > max ? length : max;
        }, 10) || 10;
      });

      // 生成Excel文件并下载
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, `${defaultFileName}.xlsx`);
    } catch (error) {
      console.error('生成Excel失败:', error);
      alert('生成Excel文件时出错，请重试');
    }
  };

  const updateTableData = (newData: TableData) => {
    setTableData(newData);
  };

  return (
    <div className="flex flex-col gap-4">
      <button onClick={generateExcel} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105">
        {children}
      </button>
    </div>
  );
};    