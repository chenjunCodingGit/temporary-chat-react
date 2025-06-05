// src/components/ExcelExportWithTables.tsx
import React, { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface DataRow {
    [key: string]: string | number | Date | boolean | undefined | null;
}

const ExcelExportWithTables: React.FC = () => {
    const [templateBuffer, setTemplateBuffer] = useState<ArrayBuffer | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 模拟要追加到Table3的数据
    // 假设Table3有列：'ID', '任务描述', '截止日期', '负责人', '状态'
    const dataForTable3: DataRow[] = [
        { 'Column1': 'T3_003', 'Column2': '完成Q3财务报告初稿', 'Column3': 'cc', 'Column4': '李明' },
        { 'Column1': 'T3_004', 'Column2': '市场调研新产品线', 'Column3': 'cc', 'Column4': '王芳' },
    ];

    // 模拟要追加到Table4的数据
    // 假设Table4有列：'产品编号', '产品名称', '数量', '单价', '是否促销'
    const dataForTable4: DataRow[] = [
        { 'Column1': 'P4_XYZ789', 'Column2': '智能音箱Pro', 'Column3': 150, 'Column4': 499 },
        { 'Column1': 'P4_ABC123', 'Column2': '无线充电板Max', 'Column3': 300, 'Column4': 129 },
    ];

    useEffect(() => {
        const fetchTemplate = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/excel-template.xlsx'); // 确保模板在 public 文件夹下
                if (!response.ok) {
                    throw new Error(`获取模板失败: ${response.status} ${response.statusText}`);
                }
                const buffer = await response.arrayBuffer();
                setTemplateBuffer(buffer);
            } catch (err: any) {
                console.error('加载Excel模板时出错:', err);
                setError(err.message || '无法加载模板文件。请确保 /public/excel-template.xlsx 文件存在。');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplate();
    }, []);

    const handleExport = async () => {
        if (!templateBuffer) {
            setError('模板尚未加载完毕。');
            return;
        }
        if (isLoading && !templateBuffer) { // Adjusted condition to allow export if buffer is ready even if initial loading state is true
            setError('模板仍在加载中，请稍候。');
            return;
        }
        setError(null);
        setIsLoading(true);

        try {
            const workbook = new ExcelJS.Workbook();
            // 注意：Vite中public目录资源需通过绝对路径访问
            const response = await fetch('/excel-template.xlsx');
            const arrayBuffer = await response.arrayBuffer();

            // 从ArrayBuffer加载工作簿
            await workbook.xlsx.load(arrayBuffer);
            // await workbook.xlsx.readFile('/excel-template.xlsx');

            // --- 处理第三个工作表和Table3 ---
            const sheet3 = workbook.worksheets[2]; // 第三个工作表 (0-indexed)
            if (!sheet3) {
                throw new Error('模板中未找到第三个工作表。');
            }
            const table3 = sheet3.getTable('Table3');
            // turn header row on
            // @ts-ignore
                table3.table.headerRow = true;

                // turn totals row off
                // table3.totalsRow = false;

                // commit the table changes into the sheet
                table3.commit();
            if (table3) {
                console.warn('在第三个工作表中未找到名为 "Table3" 的表格。数据将直接追加到工作表末尾，但这可能不会应用表格样式。');
                // Fallback: 如果找不到表格，直接追加行（格式可能不完全符合预期）
                dataForTable3.forEach(dataRow => {
                    // 当 table3 未定义时，我们不能使用 table3.columns。所以直接用 Object.values
                    const values = Object.values(dataRow);
                    sheet3.addRow(values);
                });
            } else {
                // 确认 table3 对象和其方法 (用于调试)
                
                // 使用 table.addRow() 逐行添加数据
                dataForTable3.forEach(dataRow => {
                    // 确保列名存在于 dataRow 中，如果不存在则提供 undefined 或 null
                    // @ts-ignore
                    const rowValuesArray = table3.table.columns.map(column => dataRow[column.name!] !== undefined ? dataRow[column.name!] : null);
                    try {
                        table3.addRow(rowValuesArray);
                    } catch (error) {
                        console.error('添加行时出错:', error);
                    }
                });
                table3.commit(); // 确保表格范围等已更新
            }

            // --- 处理第四个工作表和Table4 ---
            const sheet4 = workbook.worksheets[3]; // 第四个工作表
            if (!sheet4) {
                throw new Error('模板中未找到第四个工作表。');
            }
            const table4 = sheet4.getTable('Table4');
            if (table4) {
                console.warn('在第四个工作表中未找到名为 "Table4" 的表格。数据将直接追加到工作表末尾。');
                dataForTable4.forEach(dataRow => {
                    const values = Object.values(dataRow);
                    sheet4.addRow(values);
                });
            } else {
            // @ts-ignore
                table4.table.headerRow = true;

                // turn totals row off
                // table4.totalsRow = false;

                // commit the table changes into the sheet
                table4.commit();

                // 确认 table4 对象和其方法 (用于调试)
                console.log('Table4 found. Type of table4.addRow:', typeof table4.addRow, 'Type of table4.addRows:');

                // 使用 table.addRow() 逐行添加数据
                dataForTable4.forEach(dataRow => {
                    // @ts-ignore
                    const rowValuesArray = table4.table.columns.map(column => dataRow[column.name!] !== undefined ? dataRow[column.name!] : null);
                    table4.addRow(rowValuesArray);
                });
                table4.commit(); // 确保表格范围等已更新
            }

            // 设置工作簿元数据 (可选)
            workbook.creator = 'MyReactApp';
            workbook.lastModifiedBy = 'User';
            workbook.created = new Date();
            workbook.modified = new Date();

            // 写入Buffer并下载
            const outputBuffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([outputBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
            saveAs(blob, `Exported_Report_${timestamp}.xlsx`);

        } catch (err: any) {
            console.error('导出Excel时出错:', err);
            setError(`导出失败: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px' }}>Excel 导出功能 - 追加数据到表格</h2>
            <button
                onClick={handleExport}
                disabled={isLoading || !templateBuffer} // 保持禁用条件，如果模板未加载或正在加载
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    color: 'white',
                    backgroundColor: (isLoading || !templateBuffer) ? '#cccccc' : '#007bff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: (isLoading || !templateBuffer) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease',
                }}
            >
                {isLoading && !templateBuffer ? '模板加载中...' : (isLoading ? '处理中...' : '导出追加数据的Excel')}
            </button>
            {error && (
                <p style={{ color: 'red', marginTop: '15px' }}>错误: {error}</p>
            )}
            <div style={{ marginTop: '20px', textAlign: 'left', padding: '10px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <h4>说明:</h4>
                <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                    <li>此功能会加载位于 <code>/public/excel-template.xlsx</code> 的模板。</li>
                    <li>新的数据行将被追加到第三个工作表的 <code>Table3</code> 和第四个工作表的 <code>Table4</code>。</li>
                    <li>模板中原有的工作表（如前两个）及其格式将被保留。</li>
                    <li>新追加的行会自动应用表格样式。</li>
                </ul>
            </div>
        </div>
    );
};

export default ExcelExportWithTables;

// --- App.jsx or your router setup ---
// 你需要将这个 ExcelExportWithTables 组件集成到你的应用路由中。
// 例如，在 App.jsx 中:
// import ExcelExportWithTables from './components/ExcelExportWithTables';
//
// function App() {
//   return (
//     <div>
//       {/* 其他路由或组件 */}
//       <ExcelExportWithTables />
//     </div>
//   );
// }
// export default App;
