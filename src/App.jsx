// src/App.jsx
import React, { useState, useEffect } from 'react';
// import * as XLSX from 'xlsx';
// import ExcelJS from 'exceljs/dist/es5/exceljs.browser.min.js';
import ExcelJS from 'exceljs';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
// 确保从正确路径导入，并且 Export2Excel.ts 导出了这些类型
import { exportData, } from './Export2Excel';
import { exportExcel } from './Append2Excel';
import templateBase64 from './excelTemplateBase64';
import ExcelExportButton from './components/ExcelExportButton';

function App() {
  const [count, setCount] = useState(0);
  const [templateBuffer, setTemplateBuffer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [thirdSheetData] = useState({
    sheetName: 'Table2',
    data: [
      { 姓名: '张三', 年龄: 28, 入职日期: new Date('2023-01-15') },
      { 姓名: '李四', 年龄: 32, 入职日期: new Date('2022-05-20') },
      // 更多数据...
    ]
  });

  const [fourthSheetData] = useState({
    sheetName: 'Table1',
    data: [
      { 产品: '电脑', 数量: 100, 单价: 5000, 总价: '=C2*D2' },
      { 产品: '手机', 数量: 200, 单价: 3000, 总价: '=C3*D3' },
      // 更多数据...
    ]
  });


  // 从服务器获取Excel模板
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch('/Book1.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        setTemplateBuffer(arrayBuffer);
        setLoading(false);
      } catch (error) {
        console.error('获取模板失败:', error);
        setLoading(false);
      }
    };

    fetchTemplate();
  }, []);

  // 导出Excel文件
  const exportExcel = async () => {
    if (!templateBuffer) return;

    try {
      // 创建工作簿并加载模板
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);

      // 准备第三和第四个sheet的数据
      const sheet3Data = [
        { colA: 'Value1', colB: '=VLOOKUP(A2,Sheet1!$A$1:$B$100,2,FALSE)', colC: 'Data1', colD: 'Info1' },
        { colA: 'Value2', colB: '=VLOOKUP(A3,Sheet1!$A$1:$B$100,2,FALSE)', colC: 'Data2', colD: 'Info2' },
      ];

      const sheet4Data = [
        { colA: 'Item1', colB: 'Detail1', colC: 'Category1' },
        { colA: 'Item2', colB: 'Detail2', colC: 'Category2' },
      ];

      // 获取第三个sheet并追加数据
      const sheet3 = workbook.getWorksheet(3);
      if (sheet3) {
        // 获取最后一行的行号
        const lastRowNum = sheet3.lastRow?.number || 0;

        // 遍历数据，逐行追加
        sheet3Data.forEach((rowData, index) => {
          const targetRowNum = lastRowNum + index + 1;

          // 遍历对象的每个属性，写入对应列
          Object.keys(rowData).forEach((key, colIndex) => {
            // 将列索引转换为Excel列字母 (A, B, C, ...)
            const columnLetter = String.fromCharCode(65 + colIndex);
            const cellAddress = `${columnLetter}${targetRowNum}`;

            // 设置单元格值
            sheet3.getCell(cellAddress).value = rowData[key];

            // 复制上一行对应列的格式（保留原有格式）
            if (lastRowNum > 0) {
              const sourceCell = sheet3.getCell(`${columnLetter}${lastRowNum}`);
              const targetCell = sheet3.getCell(cellAddress);

              // 复制所有格式属性
              targetCell.font = { ...sourceCell.font };
              targetCell.alignment = { ...sourceCell.alignment };
              targetCell.border = { ...sourceCell.border };
              targetCell.fill = { ...sourceCell.fill };
              targetCell.numFmt = sourceCell.numFmt;
            }
          });
        });
      }

      // 获取第四个sheet并追加数据
      const sheet4 = workbook.getWorksheet(4);
      if (sheet4) {
        const lastRowNum = sheet4.lastRow?.number || 0;

        sheet4Data.forEach((rowData, index) => {
          const targetRowNum = lastRowNum + index + 1;

          Object.keys(rowData).forEach((key, colIndex) => {
            const columnLetter = String.fromCharCode(65 + colIndex);
            const cellAddress = `${columnLetter}${targetRowNum}`;

            sheet4.getCell(cellAddress).value = rowData[key];

            // 复制格式
            if (lastRowNum > 0) {
              const sourceCell = sheet4.getCell(`${columnLetter}${lastRowNum}`);
              const targetCell = sheet4.getCell(cellAddress);

              targetCell.font = { ...sourceCell.font };
              targetCell.alignment = { ...sourceCell.alignment };
              targetCell.border = { ...sourceCell.border };
              targetCell.fill = { ...sourceCell.fill };
              targetCell.numFmt = sourceCell.numFmt;
            }
          });
        });
      }

      // 设置必要的元数据
      workbook.creator = 'ExcelJS';
      workbook.lastModifiedBy = 'User';
      workbook.created = new Date();
      workbook.modified = new Date();

      // 保存工作簿为新的Excel文件
      const uint8Array = new Uint8Array(await workbook.xlsx.writeBuffer());
      const blob = new Blob([uint8Array], { type: 'application/octet-stream' });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_data.xlsx';
      document.body.appendChild(a);
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出Excel失败:', error);
      alert('导出Excel失败，请重试');
    }
  };

  // --- Demo Data and Column Definitions ---

  // Sheet 1: "Product Details" - with grouped headers and advanced styles
  const productsData = [
    {
      id: 'P001',
      name: 'Smartwatch V3 Pro',
      category: 'Wearables',
      launchDate: '2024-01-15',
      unitsSold: 1850,
      revenue: 277315.00,
      satisfaction: 0.93, // 93%
      status: 'Bestseller',
      storeLink: { text: 'Visit Official Site', hyperlink: 'https://example.com/store/P001', tooltip: 'Go to P001 official page' },
      features: 'GPS, Heart Rate, NFC Payment\nWater Resistance: 5ATM',
      internalNotes: 'Pay attention to next-gen chip supply'
    },
    {
      id: 'P002',
      name: 'AirSound Max Noise Cancelling Headphones',
      category: 'Audio',
      launchDate: '2023-08-20',
      unitsSold: 4200,
      revenue: 628000.00,
      satisfaction: 0.90,
      status: 'Hot',
      storeLink: 'https://example.com/store/P002',
      features: 'Active Noise Cancellation, Bluetooth 5.2, 20hr battery',
      internalNotes: 'Marketing campaign very effective'
    },
    {
      id: 'P003',
      name: 'Ultrawide Curved Monitor X34',
      category: 'PC Accessories',
      launchDate: '2024-02-10',
      unitsSold: 680,
      revenue: 305320.00,
      satisfaction: 0.96,
      status: 'New Recommendation',
      storeLink: { text: 'Product Specs', hyperlink: 'https://example.com/specs/P003' },
      features: '34-inch, 144Hz Refresh Rate, HDR400',
      internalNotes: 'Initial stock is tight'
    }
  ];

  // Updated productColumns with comments
  const productColumns = [
    {
      header: 'Product ID', key: 'id', width: 15,
      headerStyle: {
        font: { name: 'Arial Black', color: { argb: 'FF003366' }, size: 12 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDAEEF3' } }
      },
      dataStyle: {
        font: { italic: true, color: { argb: 'FF444444' } },
        alignment: { horizontal: 'center' }
      },
      // Example of a static string comment
      comment: 'Unique identifier for each product.'
    },
    {
      header: 'Core Product Info',
      children: [
        {
          header: 'Product Name', key: 'name', width: 30, alignment: 'left',
          headerStyle: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } } },
          dataStyle: { font: { bold: true, color: { argb: 'FF2E8B57' } } },
          // Example of a function-based comment
          comment: (value) => `Product name: ${value}`
        },
        {
          header: 'Category', key: 'category', width: 18, alignment: 'left',
          headerStyle: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } } }
        },
      ],
    },
    {
      header: 'Launch Date', key: 'launchDate', width: 18, format: 'yyyy"-"mm"-"dd', alignment: 'center',
      headerStyle: { font: { size: 10 } },
      dataStyle: { numFmt: 'yyyy-mm-dd;@', alignment: { horizontal: 'right' } }
    },
    {
      header: 'Sales & Feedback',
      headerStyle: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0E1' } } },
      children: [
        {
          header: 'Units Sold', key: 'unitsSold', width: 12, format: '#,##0', alignment: 'right',
          dataStyle: { font: { color: { argb: 'FF0070C0' } } },
          // Example of a function-based comment with author
          comment: (value, rowData) => ({ text: `Total units sold: ${value}`, author: 'Sales Team' })
        },
        {
          header: 'Revenue (CNY)', key: 'revenue', width: 18, format: '¥#,##0.00', alignment: 'right',
          dataStyle: { font: { color: { argb: 'FF0070C0' }, bold: true } }
        },
        {
          header: 'Customer Satisfaction', key: 'satisfaction', width: 15, format: '0.00%', alignment: 'center',
          dataStyle: (value) => {
            if (value == null) return { font: { color: { argb: 'FF808080' } } };
            const numericValue = Number(value);
            if (numericValue >= 0.95) return { font: { color: { argb: 'FF008000' }, bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } } };
            if (numericValue >= 0.90) return { font: { color: { argb: 'FF228B22' } } };
            return { font: { color: { argb: 'FFFF4500' } } };
          },
          // Example of a simple string comment
          comment: 'Customer satisfaction score (0-1).'
        }
      ]
    },
    {
      header: 'Current Status', key: 'status', width: 15, alignment: 'center',
      dataStyle: (value) => {
        let style = {};
        if (value === 'Bestseller') style = { font: { color: { argb: 'FFFF8C00' }, bold: true } };
        else if (value === 'Hot') style = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } } };
        else if (value === 'New Recommendation') style = { font: { color: { argb: 'FF4682B4' } } };
        return style;
      }
    },
    {
      header: 'Official Link', key: 'storeLink', width: 25, isHyperlink: true,
      dataStyle: { alignment: { horizontal: 'left' } }
    },
    {
      header: 'Features', key: 'features', width: 35, alignment: 'left',
      dataStyle: { alignment: { wrapText: true, vertical: 'top' } }
    },
    { header: 'Internal Notes (Hidden)', key: 'internalNotes', hidden: true }
  ];

  // Sheet 2: "Employee Directory" - simple header, different styles
  const employeesData = [
    { empId: 'E001', name: 'Zhang Wei', department: 'R&D', email: 'zhang.wei@example.com', extension: 'x1001', status: 'Active' },
    { empId: 'E002', name: 'Li Na', department: 'Marketing', email: 'li.na@example.com', extension: 'x2002', status: 'Active' },
    { empId: 'E003', name: 'Wang Fang', department: 'HR', email: 'wang.fang@example.com', extension: 'x3003', status: 'On Leave' },
    { empId: 'E004', name: 'Liu Qiangdong', department: 'Management', email: 'liu.qiangdong@example.com', extension: 'x0001', status: 'Active' },
  ];
  const employeeColumns = [
    {
      header: 'Employee ID', key: 'empId', width: 10,
      headerStyle: {
        font: { color: { argb: 'FFFFFFFF' }, bold: true, name: 'Segoe UI Semibold' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } }
      },
      dataStyle: { alignment: { horizontal: 'center' } }
    },
    {
      header: 'Name', key: 'name', width: 15,
      dataStyle: { font: { name: 'Microsoft YaHei', size: 11 } }
    },
    { header: 'Department', key: 'department', width: 20 },
    {
      header: 'Email', key: 'email', width: 30, isHyperlink: true,
      dataStyle: (value) => ({
        text: String(value),
        hyperlink: `mailto:${value}`
      })
    },
    { header: 'Extension', key: 'extension', width: 12, alignment: 'center' },
    {
      header: 'Status', key: 'status', width: 10, alignment: 'center',
      dataStyle: (value) => {
        if (value === 'On Leave') return { font: { color: { argb: 'FFB8860B' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFACD' } } };
        return {};
      },
      // Example of a function-based comment for specific status
      comment: (value) => value === 'On Leave' ? 'Employee is currently on leave.' : undefined
    }
  ];

  // Export handler: export multi-sheet Excel/CSV with advanced styles
  const handleExportMultiSheetWithStyles = () => {
    const sheet1Config = {
      sheetName: 'Product Details',
      data: productsData,
      columns: productColumns,
      freezePanes: { row: 2, col: 1 },
      showGridLines: true,
      // Add password protection to Sheet 1
      password: 'productpassword123'
    };
    const sheet2Config = {
      sheetName: 'Employee Directory',
      data: employeesData,
      columns: employeeColumns,
      freezePanes: { row: 1, col: 0 },
      showGridLines: false,
      // Add password protection to Sheet 2
      password: 'employeepassword456'
    };

    exportData([sheet1Config, sheet2Config], 'Enterprise_Data_Report_MultiSheet', 'xlsx')
      .then(() => console.log('XLSX multi-sheet with advanced styles, comments, and protection export complete'))
      .catch(err => console.error('XLSX multi-sheet with advanced styles, comments, and protection export error:', err));

    // CSV export will only export the first sheet ("Product Details") and does not support comments or protection
    // exportData([sheet1Config, sheet2Config], 'Enterprise_Data_Report_Products_CSV', 'csv');
  };

  const handleExport = async () => {
    // 示例数据
    const dataSheet3 = [
      ['Key1'],
      ['Key2'],
      ['Key3']
    ];

    const dataSheet4 = [
      ['Name1', 123, 'Info1'],
      ['Name2', 456, 'Info2']
    ];

    try {
      await exportExcel(templateBase64, dataSheet3, dataSheet4);
      console.log('Excel 导出成功');
    } catch (err) {
      console.error('导出失败', err);
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-2xl font-bold mb-6">Excel导出示例</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <ExcelExportButton
          thirdSheetData={thirdSheetData}
          fourthSheetData={fourthSheetData}
        />
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <p className="text-gray-700">说明：点击按钮将基于模板生成Excel文件，</p>
        <p className="text-gray-700">第三个和第四个工作表将包含动态添加的数据。</p>
      </div>
      <button
        disabled={loading}
        onClick={exportExcel}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? '加载模板中...' : 'Excel'}
      </button>
      <h1>Vite + React Advanced Excel Export</h1>
      <button onClick={handleExport} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Export 2 Append Excel
      </button>
      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>
          Counter is {count}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginTop: '20px' }}>
        <button
          onClick={handleExportMultiSheetWithStyles}
          style={{ padding: '12px 25px', fontSize: '16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Export Multi-Sheet Report (Advanced Styles, Comments, Protection)
        </button>
      </div>
    </>
  )
}

export default App;
