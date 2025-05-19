// src/App.jsx
import React, { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
// 从 Export2Excel.ts 导入 exportData 和 SheetConfig 类型
// Make sure the path to Export2Excel.ts is correct.
// For example, if Export2Excel.ts is in the same directory (src):
import { exportData } from './Export2Excel'; 

function App() {
  const [count, setCount] = useState(0);

  // 点击处理函数：导出包含分组表头的单 Sheet Excel/CSV
  const handleExportGroupedClick = () => {
    const backendDataGrouped = [
      {
        id: 1,
        productName: '笔记本电脑 笔记本电脑 笔记本电脑 Pro X', // Laptop Pro X
        category: '电子产品', // Electronics
        stockMain: 10,
        stockWarehouse: 5,
        priceRetail: 1200.50,
        priceWholesale: 1000.00,
        orderDate: '2023-10-26',
        status: '有货', // In Stock
        notes: '最新型号，高性能。', // Latest model, high performance.
      },
      {
        id: 2,
        productName: '键盘 K200', // Keyboard K200
        category: '配件', // Accessories
        stockMain: 50,
        stockWarehouse: 120,
        priceRetail: 75.00,
        priceWholesale: 50.00,
        orderDate: '2023-10-27',
        status: '有货', // In Stock
        notes: '机械键盘，带背光。', // Mechanical keyboard, with backlight.
      },
    ];

    const groupedColumns = [
      { header: 'ID', key: 'id', width: 8, alignment: 'center' },
      {
        header: '产品信息', // Product Information
        // key: 'productInfo', // Group key is optional if not directly mapping data
        children: [
          { header: '名称', key: 'productName', width: 30, alignment: 'left' }, // Name
          { header: '类别', key: 'category', width: 20, alignment: 'left' },   // Category
        ],
      },
      {
        header: '库存详情', // Stock Details
        children: [
          { header: '主仓库', key: 'stockMain', width: 10, alignment: 'center', format: '#,##0' },      // Main
          { header: '分仓库', key: 'stockWarehouse', width: 15, alignment: 'center', format: '#,##0' }, // Warehouse
        ],
      },
      {
        header: '价格信息', // Pricing
        children: [
          { header: '零售价', key: 'priceRetail', width: 15, alignment: 'right', format: '$#,##0.00' },    // Retail Price
          { header: '批发价', key: 'priceWholesale', width: 18, alignment: 'right', format: '¥#,##0.00' }, // Wholesale Price (using Yen as an example)
        ]
      },
      { header: '订单日期', key: 'orderDate', width: 15, format: 'yyyy-mm-dd', alignment: 'center' }, // Order Date
      { header: '状态', key: 'status', width: 12, alignment: 'center'}, // Status
      { header: '备注', key: 'notes', width: 35, alignment: 'left'}, // Notes
    ];

    // 为单 sheet 导出准备 SheetConfig 对象
    const sheetConfigForGrouped = {
      sheetName: '分组表头产品', // Sheet name for grouped data - Grouped Header Products
      data: backendDataGrouped,
      columns: groupedColumns,
    };

    // 导出 XLSX (单个 sheet)
    exportData([sheetConfigForGrouped], '单Sheet_分组表头_excel', 'xlsx') // SingleSheet_GroupedHeader_excel
      .then(() => console.log('XLSX grouped export complete'))
      .catch(err => console.error('XLSX grouped export error:', err));

    // 导出 CSV (单个 sheet)
    exportData([sheetConfigForGrouped], '单Sheet_分组表头_csv', 'csv'); // SingleSheet_GroupedHeader_csv
    console.log('CSV grouped export initiated');
  };

  // 点击处理函数：导出包含简单表头的单 Sheet Excel/CSV
  const handleExportSimpleClick = () => {
    const backendDataSimple = [
      { 
        employeeId: 'E1001', 
        fullName: '张三', // Zhang San
        department: '技术部', // Technology Department
        position: '软件工程师', // Software Engineer
        salary: 15000, 
        hireDate: '2020-05-10' 
      },
      { 
        employeeId: 'E1002', 
        fullName: '李四', // Li Si
        department: '市场部', // Marketing Department
        position: '市场专员', // Marketing Specialist
        salary: 12000, 
        hireDate: '2021-08-15' 
      },
      { 
        employeeId: 'E1003', 
        fullName: '王五', // Wang Wu
        department: '技术部', // Technology Department
        position: '前端开发工程师', // Frontend Developer
        salary: 14500, 
        hireDate: '2019-01-20' 
      },
      {
        employeeId: 'E1004',
        fullName: '赵六六', // Zhao Liu Liu (longer name)
        department: '人力资源与行政管理部', // Human Resources and Administration Department (longer dept name)
        position: '招聘经理', // Recruitment Manager
        salary: 16000.75,
        hireDate: '2018-03-01'
      }
    ];
    
    const simpleColumns = [
      { header: '员工ID', key: 'employeeId', width: 15, alignment: 'center' }, // Employee ID
      { header: '姓名', key: 'fullName', width: 20, alignment: 'left' },         // Full Name
      { header: '部门', key: 'department', width: 30, alignment: 'left' },       // Department
      { header: '职位', key: 'position', width: 25, alignment: 'left' },         // Position
      { header: '薪资', key: 'salary', width: 15, alignment: 'right', format: '¥#,##0.00' }, // Salary
      { header: '入职日期', key: 'hireDate', width: 18, format: 'yyyy/mm/dd', alignment: 'center' }, // Hire Date
    ];

    // 为单 sheet 导出准备 SheetConfig 对象
    const sheetConfigForSimple = {
      sheetName: '简单表头员工', // Sheet name for simple data - Simple Header Employees
      data: backendDataSimple,
      columns: simpleColumns,
    };

    // 导出 XLSX (单个 sheet)
    exportData([sheetConfigForSimple], '单Sheet_简单表头_excel', 'xlsx') // SingleSheet_SimpleHeader_excel
      .then(() => console.log('XLSX simple export complete'))
      .catch(err => console.error('XLSX simple export error:', err));

    // 导出 CSV (单个 sheet)
    exportData([sheetConfigForSimple], '单Sheet_简单表头_csv', 'csv'); // SingleSheet_SimpleHeader_csv
    console.log('CSV simple export initiated');
  };

  // 点击处理函数：导出包含多个 Sheet 的 Excel/CSV
  const handleExportMultiSheetClick = () => {
    // Sheet 1: 产品数据 (分组表头)
    const productsData = [
      { id: 1, productName: '多Sheet产品A 多Sheet产品A', category: '类别1', stockMain: 20, priceRetail: 150.00, orderDate: '2024-01-15' }, // MultiSheet Product A, Category 1
      { id: 2, productName: '多Sheet产品B', category: '类别2', stockMain: 5, priceRetail: 25.99, orderDate: '2024-01-20' }, // MultiSheet Product B, Category 2
    ];
    const productColumns = [
      { header: 'ID', key: 'id', width: 8 },
      { 
        header: '产品信息', // Product Information
        children: [
          { header: '名称', key: 'productName', width: 25 }, // Name
          { header: '类别', key: 'category', width: 15 },   // Category
        ]
      },
      { header: '库存', key: 'stockMain', width: 10, format: '#,##0' }, // Stock
      { header: '价格', key: 'priceRetail', width: 12, format: '$#,##0.00' }, // Price
      { header: '日期', key: 'orderDate', width: 15, format: 'yyyy-mm-dd' },  // Date
    ];

    // Sheet 2: 员工数据 (简单表头)
    const employeesData = [
      { empId: 'EMP001', name: '员工甲', department: '销售部', salary: 8000 }, // Employee Alpha, Sales Dept
      { empId: 'EMP002', name: '员工乙', department: '技术部', salary: 9500 }, // Employee Beta, Tech Dept
    ];
    const employeeColumns = [
      { header: '工号', key: 'empId', width: 10 },        // Employee No.
      { header: '姓名', key: 'name', width: 20 },          // Name
      { header: '部门', key: 'department', width: 20 },    // Department
      { header: '月薪', key: 'salary', width: 15, format: '¥#,##0' }, // Monthly Salary
    ];
    
    // Sheet 3: 销售数据 (简单表头)
    const salesData = [
      { saleId: 'S001', item: '商品X', quantity: 5, totalAmount: 500, saleDate: '2024-02-01' }, // Item X
      { saleId: 'S002', item: '商品Y', quantity: 2, totalAmount: 300, saleDate: '2024-02-03' }, // Item Y
    ];
    const salesColumns = [
        { header: '销售ID', key: 'saleId', width: 10},      // Sale ID
        { header: '商品', key: 'item', width: 20},          // Item
        { header: '数量', key: 'quantity', width: 10, format: '#,##0'}, // Quantity
        { header: '总金额', key: 'totalAmount', width: 15, format: '$#,##0.00'}, // Total Amount
        { header: '销售日期', key: 'saleDate', width: 15, format: 'yyyy-mm-dd'}, // Sale Date
    ];

    // 组合所有 sheet 的配置
    const allSheetConfigs = [
      { sheetName: '产品列表', data: productsData, columns: productColumns }, // Product List
      { sheetName: '员工名单', data: employeesData, columns: employeeColumns }, // Employee List
      { sheetName: '销售记录', data: salesData, columns: salesColumns },       // Sales Records
    ];

    // 导出 XLSX (多个 sheet)
    exportData(allSheetConfigs, '多Sheet综合数据_excel', 'xlsx') // MultiSheet_ComprehensiveData_excel
      .then(() => console.log('XLSX multi-sheet export complete'))
      .catch(err => console.error('XLSX multi-sheet export error:', err));

    // 导出 CSV (将只导出第一个 sheet: 产品列表)
    exportData(allSheetConfigs, '多Sheet综合数据_csv', 'csv'); // MultiSheet_ComprehensiveData_csv
    console.log('CSV multi-sheet export initiated (will export first sheet)');
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
      <h1>Vite + React Excel 导出</h1> {/* Vite + React Excel Export */}
      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>
          计数器 is {count} {/* count is {count} */}
        </button>
        <p>
          编辑 <code>src/App.jsx</code> 并保存以测试HMR {/* Edit src/App.jsx and save to test HMR */}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
        <button onClick={handleExportGroupedClick} style={{ padding: '10px 20px', fontSize: '16px' }}>
          导出单Sheet (分组表头) {/* Export Single Sheet (Grouped Header) */}
        </button>
        <button onClick={handleExportSimpleClick} style={{ padding: '10px 20px', fontSize: '16px' }}>
          导出单Sheet (简单表头) {/* Export Single Sheet (Simple Header) */}
        </button>
        <button onClick={handleExportMultiSheetClick} style={{ padding: '10px 20px', fontSize: '16px', background: '#4CAF50', color: 'white' }}>
          导出多Sheet数据 (XLSX & CSV) {/* Export Multi-Sheet Data (XLSX & CSV) */}
        </button>
      </div>
    </>
  )
}

export default App;
