import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AnalysisResult } from "./resumeAnalyzer";

export function downloadReport(result: AnalysisResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129);
  doc.text("AI Resume Analyzer — ATS Report", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: "center" });

  // Scores
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Scores", 14, 42);

  autoTable(doc, {
    startY: 46,
    head: [["Metric", "Value"]],
    body: [
      ["ATS Score", `${result.score}/100`],
      ["Job Match Score", `${result.matchScore}%`],
      ["Strength", result.strength],
      ["Word Count", String(result.resumeWordCount)],
      ["Keyword Density", `${result.keywordDensity}%`],
    ],
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] },
  });

  // Matched Skills
  const y1 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text("Matched Skills", 14, y1);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(result.skills.length ? result.skills.join(", ") : "None", 14, y1 + 7, { maxWidth: pageWidth - 28 });

  // Missing Skills
  const y2 = y1 + 20;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Missing Skills", 14, y2);
  doc.setFontSize(10);
  doc.setTextColor(200, 50, 50);
  doc.text(result.missingSkills.length ? result.missingSkills.join(", ") : "None", 14, y2 + 7, { maxWidth: pageWidth - 28 });

  // Sections
  const y3 = y2 + 25;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Resume Sections", 14, y3);
  autoTable(doc, {
    startY: y3 + 4,
    head: [["Found", "Missing"]],
    body: [[result.sectionsFound.join(", ") || "None", result.sectionsMissing.join(", ") || "None"]],
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] },
  });

  // Suggestions
  const y4 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Suggestions", 14, y4);
  autoTable(doc, {
    startY: y4 + 4,
    head: [["#", "Suggestion"]],
    body: result.suggestions.map((s, i) => [String(i + 1), s]),
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] },
    columnStyles: { 0: { cellWidth: 10 } },
  });

  // Strong/Weak Areas
  const y5 = (doc as any).lastAutoTable.finalY + 10;
  if (y5 > 260) doc.addPage();
  const yy = y5 > 260 ? 20 : y5;

  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Analysis Summary", 14, yy);
  autoTable(doc, {
    startY: yy + 4,
    head: [["Strong Areas", "Weak Areas"]],
    body: [
      [
        result.strongAreas.join("\n") || "None identified",
        result.weakAreas.join("\n") || "None identified",
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] },
    styles: { cellWidth: "wrap" },
  });

  doc.save("ATS_Resume_Report.pdf");
}
