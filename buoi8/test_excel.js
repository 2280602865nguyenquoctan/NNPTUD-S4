const ExcelJS = require('exceljs');
async function run() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('user.xlsx');
  const ws = workbook.getWorksheet(1);
  console.log("Row 1:", ws.getRow(1).values);
  console.log("Row 2:", ws.getRow(2).values);
}
run();
