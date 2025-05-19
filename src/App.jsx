import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import * as XLSX from 'xlsx';
import { exportToExcel, exportData } from './Export2Excel';

export const exportToExcel2 = (data, fileName = 'exported_data') => {
  // 将数据转换为 worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // 获取所有单元格范围
  const range = XLSX.utils.decode_range(ws['!ref']);

  // 设置第 3 列（C列，索引为2）为货币格式（从第2行开始，跳过标题）
  for (let row = 1; row <= range.e.r; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 2 });
    if (ws[cellAddress]) {
      // 设置货币格式（示例：人民币，保留两位小数）
      ws[cellAddress].z = "¥#,##0.00";
    }
  }

  // 创建 workbook 并添加 worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // 导出 Excel 文件
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

function App() {
  const [count, setCount] = useState(0)

  React.useEffect(() => {
    const data = [
      { name: "John", age: 30, salary: 5000 },
      { name: "Jane", age: 25, salary: 6000 },
      { name: "Doe", age: 35, salary: 7000 }
    ];


    // 示例数据
    const sampleData = [
      { name: '张三', age: 30, salary: 5000 },
      { name: '李四', age: 25, salary: 6500.5 },
      { name: '王五', age: 35, salary: 8000 },
    ];

    // 导出数据到 Excel
    // exportToExcel(data, '员工数据');
  }, []);

  const handleExportClick = () => {
    // if (backendData.length === 0) {
    //   alert('No data to export.');
    //   return;
    // }

    const backendData = [
      { id: 1, productName: 'Laptop', quantity: 10, price: 1200.50, price4: 1200.50, orderDate: '2023-10-26' },
      { id: 2, productName: 'Keyboard', quantity: 50, price: 75.00, price4: 122222222222200.50, orderDate: '2023-10-27' },
      { id: 3, productName: 'Mouse', quantity: 100, price: 25.75, price4: 1200.50, orderDate: '2023-10-27' },
      { id: 4, productName: 'Monitor', quantity: 5, price: 3333333300.00, price4: 1200.50, orderDate: '2023-10-28' },
      { id: 5, productName: 'Webcam Webcam Webcam Webcam Webcam Webcam Webcam', quantity: 204, price: 55.99, price4: 1200.50, orderDate: '2023-10-28' },
    ]

    // Define your columns with customizations
    const columns = [
      { header: 'Product Name', key: 'productName', width: 30, alignment: 'left' },
      { header: 'Quantity', key: 'quantity', width: 15, alignment: 'center', format: '#,##0' }, // Example number format
      { header: 'Price', key: 'price', width: 15, alignment: 'right', format: '$#,##0.00' }, // Example currency format
      { header: 'Price2', key: 'price4', width: 15, alignment: 'center', format: '¥#,##0.00' }, // Example currency format
      { header: 'Order Date', key: 'orderDate', width: 20, format: 'yyyy-mm-dd' }, // Example date format
      // Add more column definitions as needed
    ];

    // exportToExcel(backendData, columns, 'product_data');
    exportData(backendData, columns, 'product_data_2', 'csv');
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <button onClick={handleExportClick}>
        Export to Excel
      </button>

    </>
  )
}

export default App
