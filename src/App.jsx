// src/App.jsx
import React, { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { exportData } from './Export2Excel'; // Using the unified exportData function

function App() {
  const [count, setCount] = useState(0);

  // Handler for exporting data with GROUPED headers
  const handleExportGroupedClick = () => {
    const backendDataGrouped = [
      {
        id: 1,
        productName: '笔记本电脑 Pro X', // Laptop Pro X
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
      {
        id: 3,
        productName: '鼠标 M500', // Mouse M500
        category: '配件', // Accessories
        stockMain: 0, // Out of stock in main
        stockWarehouse: 30,
        priceRetail: 25.75,
        priceWholesale: 15.50,
        orderDate: '2023-10-27',
        status: '缺货', // Out of Stock
        notes: '无线，人体工程学设计。', // Wireless, ergonomic design.
      },
    ];

    const groupedColumns = [
      { header: 'ID', key: 'id', width: 8, alignment: 'center' },
      {
        header: '产品信息', // Product Information
        key: 'productInfo', // Optional group key, not directly used for data mapping
        children: [
          { header: '名称', key: 'productName', width: 30, alignment: 'left' }, // Name
          { header: '类别', key: 'category', width: 20, alignment: 'left' },   // Category
        ],
      },
      {
        header: '库存详情', // Stock Details
        key: 'stockInfo',
        children: [
          { header: '主仓库', key: 'stockMain', width: 10, alignment: 'center', format: '#,##0' },      // Main
          { header: '分仓库', key: 'stockWarehouse', width: 15, alignment: 'center', format: '#,##0' }, // Warehouse
        ],
      },
      {
        header: '价格信息', // Pricing
        key: 'pricingInfo',
        children: [
          { header: '零售价', key: 'priceRetail', width: 15, alignment: 'right', format: '$#,##0.00' },    // Retail Price
          { header: '批发价', key: 'priceWholesale', width: 18, alignment: 'right', format: '¥#,##0.00' }, // Wholesale Price (using Yen as an example)
        ]
      },
      { header: '订单日期', key: 'orderDate', width: 15, format: 'yyyy-mm-dd', alignment: 'center' }, // Order Date
      { header: '状态', key: 'status', width: 12, alignment: 'center'}, // Status
      { header: '备注', key: 'notes', width: 35, alignment: 'left'}, // Notes
    ];

    // Export to XLSX
    exportData(backendDataGrouped, groupedColumns, '分组表头数据_excel', 'xlsx') // Grouped Header Data_excel
      .then(() => console.log('XLSX grouped export complete'))
      .catch(err => console.error('XLSX grouped export error:', err));

    // Export to CSV
    exportData(backendDataGrouped, groupedColumns, '分组表头数据_csv', 'csv'); // Grouped Header Data_csv
    console.log('CSV grouped export initiated');
  };

  // Handler for exporting data with SIMPLE (non-grouped) headers
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

    // Define simple columns (single row header)
    const simpleColumns = [
      { header: '员工ID', key: 'employeeId', width: 15, alignment: 'center' }, // Employee ID
      { header: '姓名', key: 'fullName', width: 20, alignment: 'left' },         // Full Name
      { header: '部门', key: 'department', width: 30, alignment: 'left' },       // Department
      { header: '职位', key: 'position', width: 25, alignment: 'left' },         // Position
      { header: '薪资', key: 'salary', width: 15, alignment: 'right', format: '¥#,##0.00' }, // Salary
      { header: '入职日期', key: 'hireDate', width: 18, format: 'yyyy/mm/dd', alignment: 'center' }, // Hire Date
    ];

    // Export to XLSX
    exportData(backendDataSimple, simpleColumns, '简单表头数据_excel', 'xlsx') // Simple Header Data_excel
      .then(() => console.log('XLSX simple export complete'))
      .catch(err => console.error('XLSX simple export error:', err));

    // Export to CSV
    exportData(backendDataSimple, simpleColumns, '简单表头数据_csv', 'csv'); // Simple Header Data_csv
    console.log('CSV simple export initiated');
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <button onClick={handleExportGroupedClick} style={{ padding: '10px 20px', fontSize: '16px' }}>
          导出分组表头数据 (XLSX & CSV) {/* Export Grouped Header Data (XLSX & CSV) */}
        </button>
        <button onClick={handleExportSimpleClick} style={{ padding: '10px 20px', fontSize: '16px' }}>
          导出简单表头数据 (XLSX & CSV) {/* Export Simple Header Data (XLSX & CSV) */}
        </button>
      </div>
    </>
  )
}

export default App;
