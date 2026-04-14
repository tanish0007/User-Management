import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { User } from "@/types/user";

export type ExportFormat = "csv" | "excel" | "pdf";

/** Triggers a browser download for any Blob */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports users as a CSV file.
 * PapaParse converts the array of objects → CSV string automatically,
 * including the header row (username, email, age).
 */
export function exportToCSV(users: User[], filename = "users.csv") {
  const csv = Papa.unparse(users, { header: true });          // produces header + rows
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

/**
 * Exports users as an Excel (.xlsx) file.
 * xlsx.utils.json_to_sheet converts objects → worksheet,
 * then we pack it into a workbook and write as a binary blob.
 */
export function exportToExcel(users: User[], filename = "users.xlsx") {
  const worksheet = XLSX.utils.json_to_sheet(users);          // auto header from object keys
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  // writeXLSX returns a Uint8Array; wrap in Blob for download
  const xlsxBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([xlsxBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, filename);
}

/**
 * Exports users as a PDF file using jsPDF + jspdf-autotable.
 * autoTable handles column headers and row striping automatically.
 */
export function exportToPDF(users: User[], filename = "users.pdf") {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text("User Management — Export", 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23);

  // Table — autoTable reads the columns + body arrays
  autoTable(doc, {
    startY: 28,
    head: [["Username", "Email", "Age"]],
    body: users.map((u) => [u.username, u.email, u.age.toString()]),
    headStyles: { fillColor: [99, 102, 241] },   // indigo header
    alternateRowStyles: { fillColor: [245, 245, 255] },
    styles: { fontSize: 10 },
  });

  doc.save(filename);
}