// src/App.jsx
import React, { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
// 确保从正确路径导入，并且 Export2Excel.ts 导出了这些类型
// 请根据您的项目结构调整路径
import { exportData, } from './Export2Excel'; 

function App() {
  const [count, setCount] = useState(0);

  // 点击处理函数：导出包含图片的多 Sheet Excel 报表
  const handleExportWithImagesClick = async () => {
    // --- 工作表1: 产品目录 (包含图片和各种样式) ---
    const catalogData = [
      {
        sku: 'BK-001',
        itemName: '《ExcelJS 高级指南》', // "ExcelJS Advanced Guide"
        // 使用 placehold.co 生成可访问的图片 URL
        // 您可以替换为实际的图片 URL
        // 确保这些 URL 是公开可访问的，或者您的应用有权限获取它们
        coverImage: 'https://placehold.co/120x150/AEC6CF/000080?text=Book+Cover+1&font=lora',
        author: '张三丰', // Zhang Sanfeng
        price: 35.50,
        rating: 4.7,
        description: '深入探讨 ExcelJS 的高级特性和应用场景。\n包含多个实用案例。', // In-depth discussion of advanced features and use cases of ExcelJS. Includes multiple practical examples.
        productPage: {text: '查看图书详情', hyperlink: 'https://example.com/books/bk001', tooltip: '跳转到图书P001的详细信息页面'} // View book details
      },
      {
        sku: 'SW-002',
        itemName: '企业级报表套件 Pro', // "Enterprise Reporting Suite Pro"
        coverImage: 'https://placehold.co/100x100/DDA0DD/FFFFFF?text=Software+Pro&font=montserrat',
        author: '报表解决方案公司', // Reporting Solutions Inc.
        price: 299.00,
        rating: 4.9,
        description: '专为大型企业设计，提供全面的数据分析与可视化报表功能。', // Designed for large enterprises, providing comprehensive data analysis and visual reporting capabilities.
        productPage: {text: '软件官网', hyperlink: 'https://example.com/software/sw002'} // Software official website
      },
      {
        sku: 'GD-003',
        itemName: '创意图标合集 2024', // "Creative Icon Collection 2024"
        // 无效的图片URL，用于测试错误处理和 altText 显示
        coverImage: 'https://this-is-an-invalid-image-url-to-test-error.com/image.jpg', 
        author: '创意设计团队', // Creative Design Team
        price: 59.00,
        rating: 4.3,
        description: '超过2000个现代矢量图标，适用于各类设计项目。', // Over 2000 modern vector icons for various design projects.
        productPage: {text: '预览图标集', hyperlink: 'https://example.com/icons/gd003'} // Preview icon set
      },
      {
        sku: 'HW-004',
        itemName: '智能家居中枢', // "Smart Home Hub"
        coverImage: 'https://placehold.co/150x100/FFDAB9/333333?text=Smart+Hub&font=playfair+display',
        author: '未来科技公司', // FutureTech Corp.
        price: 129.99,
        rating: 4.6,
        description: '连接和管理您所有的智能家居设备。\n支持语音控制。', // Connect and manage all your smart home devices. Supports voice control.
        productPage: {text: '了解更多', hyperlink: 'https://example.com/hardware/hw004'} // Learn more
      },
    ];

    const catalogColumns = [
      { 
        header: 'SKU', key: 'sku', width: 18, 
        headerStyle: { font: { bold: true, color: { argb: 'FF6A0DAD' }, name: 'Verdana' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } } }, // Purple header, Lavender fill
        dataStyle: { font: { name: 'Courier New', size: 10 }, alignment: { horizontal: 'center' } }
      },
      { 
        header: '产品封面', key: 'coverImage', width: 25, // 列的宽度，图片本身有自己的尺寸 (Product Cover)
        isImage: true, 
        imageOptions: { 
          width: 100, // 图片在Excel中的宽度 (像素)
          height: 120, // 图片在Excel中的高度 (像素)
          altText: '产品封面图', // Image alt text - (Product Cover Image)
          // 可以为图片本身添加超链接
          hyperlink: (rowData) => typeof rowData.productPage === 'object' ? rowData.productPage.hyperlink : String(rowData.productPage)
        },
        headerStyle: { alignment: { horizontal: 'center', vertical: 'middle' } },
        dataStyle: { alignment: { vertical: 'middle', horizontal: 'center' } } // 替代文本的对齐
      },
      { 
        header: '商品名称', key: 'itemName', width: 35, // Item Name
        headerStyle: { font: { size: 12 } },
        dataStyle: { font: { bold: true, size: 11, color: { argb: 'FF000080' } } } // Navy
      },
      { header: '作者/出品方', key: 'author', width: 28 }, // Author/Publisher
      { 
        header: '价格 (元)', key: 'price', width: 15, format: '¥#,##0.00', alignment: 'right', // Price (CNY)
        dataStyle: { font: { color: { argb: 'FF006400' } } } // DarkGreen
      },
      { 
        header: '用户评分', key: 'rating', width: 12, format: '0.0 "星"', alignment: 'center', // User Rating ("Stars")
        dataStyle: (value) => {
          if (value >= 4.8) return { font: { color: { argb: 'FFFFD700' }, bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0E6' } } }; // Gold font, LightOrange fill
          if (value >= 4.5) return { font: { color: { argb: 'FF32CD32' } } }; // LimeGreen
          return { font: { color: { argb: 'FF808080' } } }; // Grey
        }
      },
      { 
        header: '商品描述', key: 'description', width: 45, // Description
        dataStyle: { alignment: { wrapText: true, vertical: 'top' } }
      },
      {
        header: '产品页面', key: 'productPage', width: 22, isHyperlink: true // Product Page
      }
    ];

    // --- 工作表2: 简单图片列表 ---
    const simpleImageData = [
      { name: '标志 A', logoUrl: 'https://placehold.co/80x80/FF6347/FFFFFF?text=Logo+A&font=impact', type: '公司Logo' }, // Logo A, Company Logo
      { name: '图标 B', logoUrl: 'https://placehold.co/80x80/4682B4/FFFFFF?text=Icon+B&font=tahoma', type: '应用图标' }, // Icon B, App Icon
      { name: '错误图片', logoUrl: 'https://this-is-another-invalid-url.xyz/logo.svg', type: '测试错误' }, // Error Image, Test Error
    ];

    const simpleImageColumns = [
      { header: '名称', key: 'name', width: 20 }, // Name
      { 
        header: 'Logo/图标', key: 'logoUrl', width: 15, // Logo/Icon
        isImage: true,
        imageOptions: { width: 70, height: 70, altText: '标识图片' }, // Logo Image
        dataStyle: { alignment: { vertical: 'middle', horizontal: 'center' } }
      },
      { header: '类型', key: 'type', width: 15 } // Type
    ];
    
    const sheet1Config = {
      sheetName: '产品目录 (含图片)', // Product Catalog (with Images)
      data: catalogData,
      columns: catalogColumns,
      freezePanes: { row: 1, col: 2 }, // 冻结表头行和前两列 (SKU, 产品封面)
      showGridLines: true,
    };

    const sheet2Config = {
      sheetName: '简单图片列表', // Simple Image List
      data: simpleImageData,
      columns: simpleImageColumns,
      showGridLines: true,
    };

    try {
      // 发起导出请求
      await exportData([sheet1Config, sheet2Config], 'Excel报表_含图片', 'xlsx'); // Excel_Report_With_Images
      console.log('Excel with images export process initiated.');
      // 可以在这里添加一些用户反馈，例如一个短暂的通知
      // alert("Excel 文件已开始下载！");
    } catch (error) {
      console.error("导出包含图片的 Excel 时出错:", error);
      alert("导出 Excel 时发生错误，详细信息请查看控制台。");
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
      <h1>Vite + React Excel 图片导出演示</h1> {/* Vite + React Excel Image Export Demo */}
      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>
          计数器 is {count}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginTop: '20px' }}>
        <button 
          onClick={handleExportWithImagesClick} 
          style={{ padding: '12px 25px', fontSize: '16px', background: '#5cb85c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          导出带图片的多Sheet Excel {/* Export Multi-Sheet Excel with Images */}
        </button>
      </div>
    </>
  )
}

export default App;
