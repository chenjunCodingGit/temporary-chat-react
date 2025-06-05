import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// 模拟要追加的新数据
// Simulate new data to append
const newDataForSheet2 = [
  // 注意：这里的日期对象会被库转换为Excel日期数字或ISO字符串，取决于库的处理方式
  // Note: Date objects here will be converted to Excel date numbers or ISO strings by the library
  { date: new Date(), item: '新商品X', quantity: 5, unitPrice: 12.50, totalPriceFormula: null }, // totalPriceFormula is null because we are adding raw data, not extending formulas manually here
  { date: '2024-06-05', item: '新商品Y', quantity: 3, unitPrice: 7.80, totalPriceFormula: null },
  // 如果模板中第二张表的列顺序是 日期, 商品, 数量, 单价, 总价
  // If the column order in the template's second sheet is Date, Item, Quantity, Unit Price, Total Price
  // SheetJS 的 sheet_add_json 会根据对象的key匹配表头（如果表头存在且未跳过）
  // ExcelJS 的 addRows 如果传递对象数组，它也可能尝试匹配表头，但传递数组的数组更直接
  // For simplicity and control, we will transform this to array of arrays before appending
];

// 将对象数组转换为二维数组以匹配追加数据的格式
// Convert array of objects to array of arrays to match the format for appending data
const mapDataToAoA = (data: typeof newDataForSheet2) => {
  return data.map(row => [
    row.date instanceof Date ? row.date : new Date(row.date), // Ensure date is a Date object for consistent handling by libraries
    row.item,
    row.quantity,
    row.unitPrice,
    // 我们不在这里计算或插入公式字符串到新行，只是追加原始数据。
    // 如果模板的E列（总价）有类似C*D的公式，并且该列被配置为自动扩展（例如，作为Excel表的一部分），则Excel可能会自动填充。
    // 否则，新行将只有前四列的数据，E列为空或0。
    // We are not calculating or inserting formula strings into new rows here, just appending raw data.
    // If column E (Total Price) in the template has a formula like C*D AND the sheet/table is set to auto-expand formulas, Excel might fill it.
    // Otherwise, new rows will only have data for the first four columns, and column E will be blank or 0 for the new rows.
    // The prompt says "不改变原有excel中的format和公式", which means existing formulas should remain.
    // It doesn't explicitly ask to *add* or *copy* formulas to new rows. So, we'll leave the 'Total Price' for new rows blank.
    // If a value is needed (e.g. calculated), it should be pre-calculated: row.quantity * row.unitPrice
    row.quantity * row.unitPrice // Example of pre-calculated value. Or null if it should be blank.
  ]);
};


const aoaData = mapDataToAoA(newDataForSheet2);

interface ExcelHandlerProps {
  dataToAppend: any[][]; // 数据应为二维数组
}

// 基于 SheetJS (xlsx) 的组件
// Component based on SheetJS (xlsx)
const SheetJSHandler: React.FC<ExcelHandlerProps> = ({ dataToAppend }) => {
  const handleAppendData = async () => {
    try {
      // 1. 从 /public 目录加载模板文件
      // 1. Load the template file from the /public directory
      const response = await fetch('/excel-template.xlsx');
      if (!response.ok) {
        throw new Error(`无法加载模板文件: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // 2. 解析 Excel 文件
      // 2. Parse the Excel file
      // cellStyles: true 用于尝试保留样式 (实验性功能)
      // bookFormula: true 用于保留公式
      // sheets: 1 表示只解析第二个sheet的数据 (0-indexed, so 1 is the second sheet)
      // sheetStubs: true 确保即使没有立即解析所有单元格，工作表对象也存在
      // 建议解析整个工作簿以保留所有工作表
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array', 
        cellStyles: true,  // 尝试保留单元格样式
        // @ts-ignore
        bookFormula: true, // 保留公式
        cellFormula: true, // 保留单元格公式
        pivotTables: true, // 保留数据透视表
        dense: true, // 只解析第二个工作表的数据 (0-indexed, so 1 is the second sheet)
        sheetStubs: true, // 确保工作表对象存在，即使没有立即解析所有单元格
      });

      // 3. 获取第二个工作表 (索引为 1)
      // 3. Get the second worksheet (index 1)
      const secondSheetName = workbook.SheetNames[1];
      if (!secondSheetName) {
        throw new Error("模板中没有找到第二个工作表。");
      }
      const worksheet = workbook.Sheets[secondSheetName];
      if (!worksheet) {
        throw new Error(`工作表 "${secondSheetName}" 未定义。`);
      }
      
      // 4. 追加数据到第二个工作表
      // 4. Append data to the second worksheet
      // { skipHeader: true, origin: -1 } 表示跳过表头并在末尾追加
      // origin: -1 会在最后一个有内容的行之后追加
      // 如果表头在第一行，数据从第二行开始，这通常是正确的
      XLSX.utils.sheet_add_aoa(worksheet, dataToAppend, { origin: -1 });
      
      // (可选) 如果你知道第二张表有多少行标题，并且你想精确控制从哪一行开始追加
      // (Optional) If you know how many header rows are in the second sheet and want precise control
      // const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // const startingRow = jsonData.length; // jsonData.length 是当前数据行数（0索引）
      // XLSX.utils.sheet_add_aoa(worksheet, dataToAppend, { origin: startingRow });


      // 5. 生成新的 Excel 文件 (buffer)
      // 5. Generate the new Excel file (buffer)
      const outputArrayBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: true, // 尝试保留单元格样式
        // @ts-ignore
        bookFormula: true, // 保留公式
      });

      // 6. 下载新的 Excel 文件
      // 6. Download the new Excel file
      const blob = new Blob([outputArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'excel-template-sheetjs-updated.xlsx');
      alert('使用 SheetJS 处理完成！');

    } catch (error) {
      console.error('SheetJS 处理错误:', error);
      alert(`SheetJS 错误: ${(error as Error).message}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">SheetJS (xlsx)处理器</h2>
      <button 
        onClick={handleAppendData}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        使用 SheetJS 追加数据并下载
      </button>
      <p className="mt-2 text-sm text-gray-600">
        此方法将使用 SheetJS 库加载 <code>/public/excel-template.xlsx</code>，
        在第二个工作表的末尾追加新数据，并尝试保留原有格式和公式。
      </p>
    </div>
  );
};


// 基于 ExcelJS 的组件
// Component based on ExcelJS
const ExcelJSHandler: React.FC<ExcelHandlerProps> = ({ dataToAppend }) => {
  const handleAppendData = async () => {
    try {
      // 1. 从 /public 目录加载模板文件
      // 1. Load the template file from the /public directory
      const response = await fetch('/excel-template.xlsx');
      if (!response.ok) {
        throw new Error(`无法加载模板文件: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // 2. 解析 Excel 文件
      // 2. Parse the Excel file
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      // 3. 获取第二个工作表 (索引为 1)
      // 3. Get the second worksheet (index 1)
      // ExcelJS工作表索引从1开始，但API获取工作表通常通过名称或ID，或通过数组索引（0-indexed）
      if (workbook.worksheets.length < 2) {
         throw new Error("模板中没有找到第二个工作表。");
      }
      const worksheet = workbook.worksheets[1]; // 获取第二个工作表 (0-indexed)
      // 或者按名称： const worksheet = workbook.getWorksheet('AppendDataSheet'); // 替换为你的表名

      if (!worksheet) {
        throw new Error(`无法访问第二个工作表。`);
      }

      // 4. 追加数据到第二个工作表
      // 4. Append data to the second worksheet
      // addRows 会在现有数据之后追加新行
      worksheet.addRows(dataToAppend);
      
      // ExcelJS 在 addRows 时通常能较好地继承上一行的样式（如果新单元格没有显式样式）
      // 对于公式，如果模板中有公式且表格设计为自动扩展，ExcelJS 可能能处理。
      // 但如果只是简单追加，现有公式不会被破坏，新行也不会自动获得公式，除非特别处理。

      // 5. 生成新的 Excel 文件 (buffer)
      // 5. Generate the new Excel file (buffer)
      const outputBuffer = await workbook.xlsx.writeBuffer();

      // 6. 下载新的 Excel 文件
      // 6. Download the new Excel file
      const blob = new Blob([outputBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'excel-template-exceljs-updated.xlsx');
      alert('使用 ExcelJS 处理完成！');

    } catch (error) {
      console.error('ExcelJS 处理错误:', error);
      alert(`ExcelJS 错误: ${(error as Error).message}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-2">ExcelJS 处理器</h2>
      <button 
        onClick={handleAppendData}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        使用 ExcelJS 追加数据并下载
      </button>
      <p className="mt-2 text-sm text-gray-600">
        此方法将使用 ExcelJS 库加载 <code>/public/excel-template.xlsx</code>，
        在第二个工作表的末尾追加新数据。ExcelJS 通常在保留格式和复杂特性方面更强大。
      </p>
    </div>
  );
};


// 主应用组件，用于演示
// Main application component for demonstration
export const NewExport: React.FC = () => {
  const [data, setData] = useState<any[][]>(aoaData);
  const [newItemText, setNewItemText] = useState<string>('');

  const handleAddDataRowLocally = () => {
    if (!newItemText.trim()) {
      alert("请输入商品名称！");
      return;
    }
    const newRow = [
      new Date(), // 当前日期
      newItemText, // 商品名称来自输入框
      Math.floor(Math.random() * 10) + 1, // 随机数量 1-10
      parseFloat((Math.random() * 50 + 5).toFixed(2)), // 随机单价 5-55
      0 // 总价，暂时为0，因为我们不在这里动态添加公式
    ];
    // 更新本地的待追加数据列表
    const updatedData = [...data, newRow];
    setData(updatedData);
    setNewItemText(''); // 清空输入框
  };


  return (
    <div className="container mx-auto p-4 font-sans">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Excel 数据追加演示</h1>
        <p className="text-gray-600">
          请确保在 <code>/public</code> 目录下已有名为 <code>excel-template.xlsx</code> 的模板文件。
          模板文件的第一个工作表包含固定数据（建议设为Excel表格），第二个工作表用于追加新数据。
        </p>
         <div className="mt-2 p-3 bg-yellow-100 border border-yellow-300 rounded-md text-sm text-yellow-700">
          <strong>模板文件 (<code>public/excel-template.xlsx</code>) 示例结构:</strong>
          <ul className="list-disc list-inside ml-4">
            <li><strong>Sheet1 (例如 "FixedDataSheet"):</strong> 包含固定数据，如一个Excel表格。此表不会被修改。</li>
            <li>
              <strong>Sheet2 (例如 "AppendDataSheet"):</strong> 
              用于追加数据。可能包含表头，例如：
              <code>| 记录日期 | 商品 | 数量 | 单价 | 总价 |</code>. 
              新数据将追加到现有内容之后。如果 "总价" 列在模板中有公式 (如 <code>=C2*D2</code>)，
              这些现有公式不会被更改。新追加的行中的 "总价" 将是预计算的值或空值，除非Excel表格的自动扩展功能生效。
            </li>
          </ul>
        </div>
      </header>

      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">要追加到第二张表的数据:</h3>
        <div className="mb-3">
          <input 
            type="text" 
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="输入新商品名称"
            className="border p-2 rounded mr-2"
          />
          <button 
            onClick={handleAddDataRowLocally}
            className="bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-3 rounded"
          >
            添加一行演示数据
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto text-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">单价</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总价 (预计算)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2 whitespace-nowrap">{(row[0] instanceof Date) ? row[0].toLocaleDateString() : String(row[0])}</td>
                <td className="px-4 py-2 whitespace-nowrap">{String(row[1])}</td>
                <td className="px-4 py-2 whitespace-nowrap">{String(row[2])}</td>
                <td className="px-4 py-2 whitespace-nowrap">{String(row[3])}</td>
                <td className="px-4 py-2 whitespace-nowrap">{String(row[4])}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
         {data.length === 0 && <p className="text-gray-500 mt-2">暂无待追加数据。请使用上方按钮添加。</p>}
      </div>
      
      <main className="grid md:grid-cols-2 gap-6">
        <SheetJSHandler dataToAppend={data} />
        <ExcelJSHandler dataToAppend={data} />
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>
          确保已安装 <code>xlsx</code>, <code>exceljs</code>, 和 <code>file-saver</code>。
        </p>
        <p>
          生成的 Excel 文件会尝试保留模板中第一张表的原始内容和第二张表的现有格式与公式，同时追加新数据到第二张表。
        </p>
      </footer>
    </div>
  );
};

// 如果你想在项目中单独使用 App 组件，可以取消下面的注释
// export default App;
// 在你的 main.tsx 或 App.tsx (如果是 CRA) 中:
// import { App as ExcelAppenderApp } from './ExcelAppender';
// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <ExcelAppenderApp />
//   </React.StrictMode>,
// )
