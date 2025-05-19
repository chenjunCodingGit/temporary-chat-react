// src/App.jsx
import React, { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
// 确保从正确路径导入，并且 Export2Excel.ts 导出了这些类型
import { exportData,  } from './Export2Excel'; 

function App() {
  const [count, setCount] = useState(0);

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
      }
    },
    {
      header: 'Core Product Info',
      children: [
        { 
          header: 'Product Name', key: 'name', width: 30, alignment: 'left',
          headerStyle: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } } },
          dataStyle: { font: { bold: true, color: {argb: 'FF2E8B57'} } } 
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
      dataStyle: { numFmt: 'yyyy-mm-dd;@', alignment: { horizontal: 'right'} }
    },
    {
      header: 'Sales & Feedback',
      headerStyle: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0E1' } } },
      children: [
        { 
          header: 'Units Sold', key: 'unitsSold', width: 12, format: '#,##0', alignment: 'right',
          dataStyle: { font: { color: { argb: 'FF0070C0' } } } 
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
            if (numericValue >= 0.95) return { font: { color: { argb: 'FF008000' }, bold: true }, fill: {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFCCFFCC'}} };
            if (numericValue >= 0.90) return { font: { color: { argb: 'FF228B22' } } };
            return { font: { color: { argb: 'FFFF4500' } } };
          }
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
    { header: 'Internal Notes (Hidden)', key: 'internalNotes', hidden: true}
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
        font: { color: { argb: 'FFFFFFFF'}, bold: true, name: 'Segoe UI Semibold' }, 
        fill: {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF4F81BD'}}
      },
      dataStyle: { alignment: {horizontal: 'center'}}
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
        if (value === 'On Leave') return { font: { color: { argb: 'FFB8860B' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFFFFACD'} } };
        return {};
      }
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
    };
    const sheet2Config = {
      sheetName: 'Employee Directory',
      data: employeesData,
      columns: employeeColumns,
      freezePanes: { row: 1, col: 0 },
      showGridLines: false,
    };

    exportData([sheet1Config, sheet2Config], 'Enterprise_Data_Report_MultiSheet', 'xlsx')
      .then(() => console.log('XLSX multi-sheet with advanced styles export complete'))
      .catch(err => console.error('XLSX multi-sheet with advanced styles export error:', err));
    
    // CSV export will only export the first sheet ("Product Details")
    exportData([sheet1Config, sheet2Config], 'Enterprise_Data_Report_Products_CSV', 'csv');
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
      <h1>Vite + React Advanced Excel Export</h1>
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
          Export Multi-Sheet Report (Advanced Styles)
        </button>
      </div>
    </>
  )
}

export default App;
