import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Tabel } from "@/lib/tabel";

/** Tabel PDF A4 lanskap: judul, waktu cetak, dan nomor halaman. */
export function buatPdf({ judul, baris }: Tabel, pencetak: string): ArrayBuffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const kolom = baris.length > 0 ? Object.keys(baris[0]) : ["Data"];
  const waktu = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "long", timeStyle: "short" }).format(new Date());

  doc.setFontSize(14);
  doc.text(judul, 40, 36);
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text(`Dicetak ${waktu} WIB oleh ${pencetak}`, 40, 50);

  autoTable(doc, {
    startY: 60,
    head: [["No", ...kolom]],
    body: baris.length > 0
      ? baris.map((r, i) => [String(i + 1), ...kolom.map((k) => (r[k] == null || r[k] === "" ? "-" : String(r[k])))])
      : [["", "Belum ada data."]],
    styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [91, 91, 214], textColor: 255 },
    alternateRowStyles: { fillColor: [244, 243, 251] },
    margin: { left: 40, right: 40, bottom: 36 },
    didDrawPage: () => {
      const { width, height } = doc.internal.pageSize;
      doc.setFontSize(8);
      doc.setTextColor(110);
      doc.text(`Halaman ${doc.getNumberOfPages()}`, width - 40, height - 16, { align: "right" });
    },
  });
  return doc.output("arraybuffer");
}
