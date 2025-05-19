// src/App.jsx
import React, { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
// 确保从正确路径导入，并且 Export2Excel.ts 导出了这些类型
import { exportData,  } from './Export2Excel'; 

function App() {
  const [count, setCount] = useState(0);

  // --- 示例数据和列定义 ---

  // 工作表1: "产品详细信息" - 包含分组表头和各种高级样式
  const productsData = [
    { 
      id: 'P001', 
      name: '智能手表 V3 Pro', // Smartwatch V3 Pro
      category: '穿戴设备', // Wearables
      launchDate: '2024-01-15',
      unitsSold: 1850,
      revenue: 277315.00,
      satisfaction: 0.93, // 93%
      status: '畅销', // Bestseller
      storeLink: { text: '访问官网', hyperlink: 'https://example.com/store/P001', tooltip: '前往P001官方页面' }, // Visit official site
      features: 'GPS, 心率监测, NFC支付\n防水等级: 5ATM', // GPS, Heart Rate, NFC. Water Resistance: 5ATM
      internalNotes: '需要关注下一代芯片供应情况' // Internal note about next-gen chip supply
    },
    { 
      id: 'P002', 
      name: '降噪耳机 AirSound Max', // Noise Cancelling Headphones AirSound Max
      category: '音频设备', // Audio
      launchDate: '2023-08-20',
      unitsSold: 4200,
      revenue: 628000.00,
      satisfaction: 0.90,
      status: '热门', // Hot
      storeLink: 'https://example.com/store/P002', // Simple URL string
      features: '主动降噪, 蓝牙5.2, 20小时续航', // Active Noise Cancellation, Bluetooth 5.2, 20hr battery
      internalNotes: '营销活动效果显著' // Marketing campaign very effective
    },
    {
      id: 'P003',
      name: '超宽曲面屏 X34', // Ultrawide Curved Monitor X34
      category: '电脑配件', // PC Accessories
      launchDate: '2024-02-10',
      unitsSold: 680,
      revenue: 305320.00,
      satisfaction: 0.96,
      status: '新品推荐', // New Recommendation
      storeLink: { text: '产品规格', hyperlink: 'https://example.com/specs/P003' }, // Product Specs
      features: '34英寸, 144Hz刷新率, HDR400', // 34-inch, 144Hz Refresh Rate, HDR400
      internalNotes: '初期库存紧张' // Initial stock is tight
    }
  ];

  const productColumns = [
    { 
      header: '产品编码', key: 'id', width: 15, // Product Code
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
      header: '核心产品信息', // Core Product Information
      children: [
        { 
          header: '产品名称', key: 'name', width: 30, alignment: 'left', // Product Name
          headerStyle: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } } },
          dataStyle: { font: { bold: true, color: {argb: 'FF2E8B57'} } } // ForestGreen
        },
        { 
          header: '分类', key: 'category', width: 18, alignment: 'left', // Category
          headerStyle: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } } }
        },
      ],
    },
    { 
      header: '上市日期', key: 'launchDate', width: 18, format: 'yyyy"年"m"月"d"日"', alignment: 'center', // Launch Date (Year Month Day)
      headerStyle: { font: { size: 10 } },
      dataStyle: { numFmt: 'yyyy-mm-dd;@', alignment: { horizontal: 'right'} }
    },
    {
      header: '销售与反馈', // Sales & Feedback
      headerStyle: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0E1' } } }, // Light Orange
      children: [
        { 
          header: '销量 (件)', key: 'unitsSold', width: 12, format: '#,##0', alignment: 'right', // Units Sold (pcs)
          dataStyle: { font: { color: { argb: 'FF0070C0' } } } // Blue
        },
        { 
          header: '营收 (元)', key: 'revenue', width: 18, format: '¥#,##0.00', alignment: 'right', // Revenue (CNY)
          dataStyle: { font: { color: { argb: 'FF0070C0' }, bold: true } }
        },
        { 
          header: '客户满意度', key: 'satisfaction', width: 15, format: '0.00%', alignment: 'center', // Customer Satisfaction
          dataStyle: (value) => { // Dynamic styling based on satisfaction value
            if (value == null) return { font: { color: { argb: 'FF808080' } } }; // Grey for null
            const numericValue = Number(value);
            if (numericValue >= 0.95) return { font: { color: { argb: 'FF008000' }, bold: true }, fill: {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFCCFFCC'}} }; // Dark Green, bold, light green fill
            if (numericValue >= 0.90) return { font: { color: { argb: 'FF228B22' } } }; // Forest Green
            return { font: { color: { argb: 'FFFF4500' } } }; // OrangeRed for lower satisfaction
          }
        }
      ]
    },
    { 
      header: '当前状态', key: 'status', width: 15, alignment: 'center', // Current Status
      dataStyle: (value) => {
        let style = {};
        if (value === '畅销') style = { font: { color: { argb: 'FFFF8C00' }, bold: true } }; // DarkOrange
        else if (value === '热门') style = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } } }; // Light Yellow
        else if (value === '新品推荐') style = { font: { color: { argb: 'FF4682B4' } } }; // SteelBlue
        return style;
      }
    },
    { 
      header: '官方链接', key: 'storeLink', width: 25, isHyperlink: true, // Official Link
      dataStyle: { alignment: { horizontal: 'left' } }
    },
    { 
      header: '产品特性', key: 'features', width: 35, alignment: 'left', // Features
      dataStyle: { alignment: { wrapText: true, vertical: 'top' } } 
    },
    { header: '内部备注 (隐藏)', key: 'internalNotes', hidden: true} // Internal Notes (Hidden)
  ];

  // 工作表2: "员工通讯录" - 简单表头，不同样式
  const employeesData = [
    { empId: 'E001', name: '张伟', department: '研发部', email: 'zhang.wei@example.com', extension: 'x1001', status: '在职' }, // Zhang Wei, R&D, Active
    { empId: 'E002', name: '李娜', department: '市场部', email: 'li.na@example.com', extension: 'x2002', status: '在职' },   // Li Na, Marketing, Active
    { empId: 'E003', name: '王芳', department: '人力资源', email: 'wang.fang@example.com', extension: 'x3003', status: '休假' }, // Wang Fang, HR, On Leave
    { empId: 'E004', name: '刘强东', department: '管理层', email: 'liu.qiangdong@example.com', extension: 'x0001', status: '在职' }, // Liu Qiangdong, Management, Active
  ];
  const employeeColumns = [
    { 
      header: '工号', key: 'empId', width: 10, // Employee ID
      headerStyle: { 
        font: { color: { argb: 'FFFFFFFF'}, bold: true, name: 'Segoe UI Semibold' }, 
        fill: {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF4F81BD'}} // Blue fill
      },
      dataStyle: { alignment: {horizontal: 'center'}}
    },
    { 
      header: '姓名', key: 'name', width: 15, // Name
      dataStyle: { font: { name: '微软雅黑', size: 11 } } // Microsoft YaHei
    },
    { header: '部门', key: 'department', width: 20 }, // Department
    { 
      header: '邮箱', key: 'email', width: 30, isHyperlink: true, // Email
      dataStyle: (value) => ({ // Make email a mailto link
        text: String(value), // Ensure value is string for text part
        hyperlink: `mailto:${value}`
      })
    },
    { header: '分机号', key: 'extension', width: 12, alignment: 'center' }, // Extension
    { 
      header: '状态', key: 'status', width: 10, alignment: 'center', // Status
      dataStyle: (value) => {
        if (value === '休假') return { font: { color: { argb: 'FFB8860B' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFFFFACD'} } }; // DarkGoldenrod on LemonChiffon
        return {};
      }
    }
  ];

  // 点击处理函数：导出包含多个具有高级样式的Sheet的Excel/CSV
  const handleExportMultiSheetWithStyles = () => {
    const sheet1Config = {
      sheetName: '产品详细信息', // Product Details
      data: productsData,
      columns: productColumns,
      freezePanes: { row: 2, col: 1 }, // 冻结前2行和第1列 (Product ID)
      showGridLines: true,
    };
    const sheet2Config = {
      sheetName: '员工通讯录', // Employee Directory
      data: employeesData,
      columns: employeeColumns,
      freezePanes: { row: 1, col: 0 }, // 冻结表头行
      showGridLines: false, // 不显示网格线
    };

    exportData([sheet1Config, sheet2Config], '企业数据报表_多Sheet', 'xlsx') // Enterprise_Data_Report_MultiSheet
      .then(() => console.log('XLSX multi-sheet with advanced styles export complete'))
      .catch(err => console.error('XLSX multi-sheet with advanced styles export error:', err));
    
    // CSV导出将只导出第一个工作表 ("产品详细信息")
    exportData([sheet1Config, sheet2Config], '企业数据报表_产品CSV', 'csv'); // Enterprise_Data_Report_Products_CSV
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
      <h1>Vite + React Excel 高级导出</h1> {/* Vite + React Advanced Excel Export */}
      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>
          计数器 is {count}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginTop: '20px' }}>
        <button 
          onClick={handleExportMultiSheetWithStyles} 
          style={{ padding: '12px 25px', fontSize: '16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          导出多Sheet报表 (高级样式) {/* Export Multi-Sheet Report (Advanced Styles) */}
        </button>
      </div>
    </>
  )
}

export default App;
