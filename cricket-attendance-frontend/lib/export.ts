import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = async (data: Record<string, string | number | boolean | null>[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(dataBlob, `${fileName}.xlsx`);
};

export const exportToPDF = (data: Record<string, string | number | boolean | null>[], title: string, fileName: string) => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);

    const tableColumn = Object.keys(data[0] || {});
    const tableRows = data.map(item => Object.values(item));

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
    });

    doc.save(`${fileName}.pdf`);
};
