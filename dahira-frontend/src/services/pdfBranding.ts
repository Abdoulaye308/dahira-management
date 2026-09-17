import type jsPDF from 'jspdf';
import logoUrl from '../assets/logo.png'; // ajuste ce chemin si besoin

/* ============================
   COULEURS DE LA CHARTE
   ============================ */

export const GREEN_DEEP: [number, number, number] = [11, 61, 46];
export const GOLD: [number, number, number] = [201, 162, 39];
export const GOLD_LIGHT: [number, number, number] = [232, 206, 132];
export const GOLD_SOFT: [number, number, number] = [245, 233, 199];
export const CREAM: [number, number, number] = [251, 248, 241];
export const INK: [number, number, number] = [28, 36, 32];
export const STONE: [number, number, number] = [112, 124, 116];
export const SUCCESS: [number, number, number] = [30, 106, 69];
export const WARNING: [number, number, number] = [163, 120, 46];

export const PAGE_WIDTH = 210;
const FOOTER_RESERVED_HEIGHT = 24; // espace réservé au pied de page

/* ============================
   FORMATAGE DE MONTANT
   ============================ */

// jsPDF (police Helvetica standard) ne sait pas afficher l'espace fine
// insécable utilisé par toLocaleString('fr-FR') comme séparateur de
// milliers — ça casse l'affichage ("2 /000" au lieu de "2 000").
// On formate donc nous-mêmes avec un point, en ASCII pur.
export const formatAmountPdf = (value: number, suffix = 'FCFA') => {
  const rounded = Math.round(Number(value) || 0);
  const withDots = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${withDots} ${suffix}`;
};

/* ============================
   PROTECTION CONTRE LE DÉBORDEMENT
   DE PAGE (footer/encadrés)
   ============================ */

export const getTotalsBoxHeight = (lineCount: number) =>
  lineCount * 7.5 + 8;

export const ensureSpaceForBlock = (
  doc: jsPDF,
  currentY: number,
  blockHeight: number,
  continuationLabel: string
): number => {
  const pageHeight = doc.internal.pageSize.height;

  if (currentY + blockHeight > pageHeight - FOOTER_RESERVED_HEIGHT) {
    doc.addPage();
    drawContinuationHeader(doc, continuationLabel);
    return 30;
  }

  return currentY;
};

/* ============================
   CHARGEMENT DU LOGO EN BASE64
   ============================ */

export const loadLogoAsBase64 = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Impossible de préparer le logo.'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = reject;
    img.src = logoUrl;
  });
};

/* ============================
   EN-TÊTE PRINCIPAL (page 1)
   ============================ */

export const drawMainHeader = (
  doc: jsPDF,
  logoBase64: string | null,
  dateStr: string,
  badgeLabel: string
) => {
  doc.setFillColor(...GREEN_DEEP);
  doc.rect(0, 0, PAGE_WIDTH, 38, 'F');

  if (logoBase64) {
    const r = 12;
    const cx = 14 + r;
    const cy = 7 + r;

    try {
      doc.saveGraphicsState();
      doc.circle(cx, cy, r);
      doc.clip();
      doc.discardPath();
      doc.addImage(logoBase64, 'PNG', 14, 7, r * 2, r * 2);
      doc.restoreGraphicsState();
    } catch {
      doc.addImage(logoBase64, 'PNG', 14, 7, r * 2, r * 2);
    }
  }

  doc.setTextColor(...CREAM);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('DAHIRA HISNOUL ABRAAR', 42, 17);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text('Touba Bayakh', 42, 24);

  const badgeWidth = Math.max(58, badgeLabel.length * 2.1 + 20);
  const badgeX = PAGE_WIDTH - 14 - badgeWidth;

  doc.setFillColor(...GOLD);
  doc.roundedRect(badgeX, 10, badgeWidth, 10, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...GREEN_DEEP);
  doc.text(badgeLabel, badgeX + badgeWidth / 2, 16.3, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...GOLD_LIGHT);
  doc.text(`Généré le ${dateStr}`, badgeX + badgeWidth, 27, {
    align: 'right',
  });
};

/* ============================
   EN-TÊTE DE CONTINUATION
   (pages suivantes)
   ============================ */

export const drawContinuationHeader = (doc: jsPDF, label: string) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...GREEN_DEEP);
  doc.text(`DAHIRA HISNOUL ABRAAR — ${label}`, 14, 14);

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(14, 18, PAGE_WIDTH - 14, 18);
};

/* ============================
   TITRE DE SECTION
   (barre dorée + texte)
   ============================ */

export const drawSectionTitle = (
  doc: jsPDF,
  title: string,
  subtitle: string,
  y: number
) => {
  doc.setFillColor(...GOLD);
  doc.rect(14, y - 4, 2.2, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text(title, 19, y);

  if (subtitle) {
    const titleWidth = doc.getTextWidth(title);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...STONE);
    doc.text(subtitle, 19 + titleWidth, y);
  }
};

/* ============================
   ENCADRÉ TOTAUX (bord doré)
   ============================ */

export const drawTotalsBox = (
  doc: jsPDF,
  lines: { label: string; value: string; accent?: [number, number, number] }[],
  startY: number
) => {
  const lineHeight = 7.5;
  const boxHeight = getTotalsBoxHeight(lines.length);

  doc.setDrawColor(...GOLD);
  doc.setFillColor(...GOLD_SOFT);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, startY, PAGE_WIDTH - 28, boxHeight, 2, 2, 'FD');

  lines.forEach((line, index) => {
    const y = startY + 8 + index * lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...(line.accent || GREEN_DEEP));
    doc.text(`${line.label} :`, 20, y);

    doc.setFont('helvetica', 'bold');
    doc.text(line.value, PAGE_WIDTH - 20, y, { align: 'right' });
  });

  return startY + boxHeight;
};

/* ============================
   PIED DE PAGE
   ============================ */

export const drawFooters = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    const pageHeight = doc.internal.pageSize.height;
    const lineY = pageHeight - 16;

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(14, lineY, PAGE_WIDTH - 14, lineY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...STONE);
    doc.text('Dahira Hisnoul Abraar — Touba Bayakh', 14, lineY + 6);

    doc.setTextColor(...INK);
    doc.text(`Page ${page} / ${pageCount}`, PAGE_WIDTH - 14, lineY + 6, {
      align: 'right',
    });
  }
};