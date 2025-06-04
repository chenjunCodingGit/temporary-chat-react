// 假设你已经有一个 base64 编码的 Excel 模板 `templateBase64`
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function exportExcel(templateBase64, dataSheet3, dataSheet4) {
    // 解码 base64 并加载为 workbook
    const workbook = new ExcelJS.Workbook();
    const buffer = Uint8Array.from(atob(templateBase64), c => c.charCodeAt(0));
    await workbook.xlsx.load(buffer);

    // 获取工作表
    const sheet3 = workbook.getWorksheet(3); // 第三个 sheet（从 1 开始）
    const sheet4 = workbook.getWorksheet(4);

    if (!sheet3 || !sheet4) {
        throw new Error('Required worksheets not found');
    }

    // 追加数据到第三个 sheet
    dataSheet3.forEach((rowData, index) => {
        const rowNumber = sheet3.actualRowCount + 1;
        const row = sheet3.getRow(rowNumber);

        // 设置 A 列（原始值）
        row.getCell('A').value = rowData[0];

        // 设置 B 列（带公式，保持模板中的公式结构）
        const templateFormula = sheet3.getCell('B2').formula; // 假设公式样例在B2
        if (templateFormula) {
            //   row.getCell('B').value = { formula: templateFormula.replace(/A\d+/, `A${rowNumber}`) };
            row.getCell('B').value = '测试值';
            // row.getCell('B').value = {
            //     formula: `VLOOKUP(A${rowNumber}, Sheet1!A:B, 2, FALSE)`,
            //     // result: null // 可设置初始显示结果，也可以为 null
            // };

        }

        row.commit();
    });

    // 追加数据到第四个 sheet
    dataSheet4.forEach((rowData) => {
        const rowNumber = sheet4.actualRowCount + 1;
        const row = sheet4.getRow(rowNumber);
        rowData.forEach((val, colIdx) => {
            row.getCell(colIdx + 1).value = val;
        });
        row.commit();
    });

    // 导出文件
    const outputBuffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([outputBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'exported.xlsx');
}
