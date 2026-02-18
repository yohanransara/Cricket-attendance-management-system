import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = async (
  data: Record<string, string | number | boolean | null>[],
  fileName: string
) => {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance");

  // Create columns dynamically from object keys
  const columns = Object.keys(data[0]).map((key) => ({
    header: key,
    key: key,
    width: 20,
  }));

  worksheet.columns = columns;

  // Add rows
  data.forEach((item) => {
    worksheet.addRow(item);
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(blob, `${fileName}.xlsx`);
};

export const exportToPDF = (
  data: Record<string, string | number | boolean | null>[],
  title: string,
  fileName: string
) => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();
  doc.text(title, 14, 15);

  const tableColumn = Object.keys(data[0]);
  const tableRows = data.map((item) => Object.values(item));

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  doc.save(`${fileName}.pdf`);
};
