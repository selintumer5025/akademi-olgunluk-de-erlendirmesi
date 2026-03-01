"use client";
import { Results } from "./scoring";

export async function downloadPDF(
  results: Results,
  radarChartRef: React.RefObject<HTMLElement>
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: html2canvas } = await import("html2canvas");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const date = new Date().toLocaleDateString("tr-TR");

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Kurumsal Akademi Olgunluk Testi", margin, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Rapor Tarihi: ${date}`, margin, 25);
  doc.text("Kolektif360", pageWidth - margin - 40, 25);

  y = 50;
  doc.setTextColor(15, 23, 42);

  // Total score
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Toplam Skor: ${results.totalScore} / 150`, margin, y);
  y += 8;
  doc.setFontSize(12);
  doc.text(
    `Olgunluk Seviyesi: Seviye ${results.level} – ${results.levelName}`,
    margin,
    y
  );
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const descLines = doc.splitTextToSize(results.levelDescription, contentWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 5 + 8;

  // Radar chart
  if (radarChartRef.current) {
    try {
      const canvas = await html2canvas(radarChartRef.current, {
        backgroundColor: "#ffffff",
        scale: 1.5,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 100;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(imgData, "PNG", imgX, y, imgWidth, imgHeight);
      y += imgHeight + 8;
    } catch {
      // skip chart if capture fails
    }
  }

  // Dimension scores table
  if (y > 220) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Boyut Skorları", margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  results.dimensionScores.forEach((ds) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y - 4, contentWidth, 8, "F");
    doc.setTextColor(15, 23, 42);
    doc.text(ds.name, margin + 2, y);
    doc.text(`${ds.average}/5`, margin + contentWidth * 0.55, y);
    doc.text(`${ds.percentage}%`, margin + contentWidth * 0.7, y);
    doc.text(ds.comment, margin + contentWidth * 0.8, y);
    y += 9;
  });

  y += 5;

  // Strong / Development areas
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Güçlü Alanlarınız", margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  results.strongAreas.forEach((a) => {
    doc.text(`• ${a.name} (${a.average}/5)`, margin + 3, y);
    y += 6;
  });

  y += 3;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Gelişim Alanlarınız", margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  results.developmentAreas.forEach((a) => {
    doc.text(`• ${a.name} (${a.average}/5)`, margin + 3, y);
    y += 6;
  });

  y += 3;
  // Action plan
  if (y > 220) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("90 Günlük Aksiyon Planı", margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  results.actionPlan.forEach((action, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const lines = doc.splitTextToSize(`${i + 1}. ${action}`, contentWidth - 5);
    doc.text(lines, margin + 3, y);
    y += lines.length * 5 + 3;
  });

  // Footer CTA
  y += 5;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Kolektif360 ile Sonraki Adımınızı Planlayın", margin + 5, y + 6);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("www.kolektif360.com/iletisim", margin + 5, y + 12);

  const fileName = `K360_Akademi_Olgunluk_Raporu_${date.replace(/\./g, "-")}.pdf`;
  doc.save(fileName);
}
