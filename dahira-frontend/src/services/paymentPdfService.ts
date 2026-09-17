import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PaymentSummary } from '../types/payment';
import {
  GREEN_DEEP,
  GOLD_SOFT,
  CREAM,
  INK,
  SUCCESS,
  WARNING,
  STONE,
  loadLogoAsBase64,
  drawMainHeader,
  drawContinuationHeader,
  drawSectionTitle,
  drawTotalsBox,
  drawFooters,
  getTotalsBoxHeight,
  ensureSpaceForBlock,
  formatAmountPdf,
} from './pdfBranding';

export const generatePaymentsPdf = async (
  payments: PaymentSummary[],
  contributionName?: string
) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('fr-FR');

  let logoBase64: string | null = null;
  try {
    logoBase64 = await loadLogoAsBase64();
  } catch (err) {
    console.error('Logo introuvable pour le PDF :', err);
  }

  drawMainHeader(doc, logoBase64, dateStr, 'ÉTAT DES COTISATIONS');

  /* ============================
     TITRE DE SECTION
     ============================ */

  drawSectionTitle(
    doc,
    contributionName ? contributionName : 'Toutes les cotisations',
    ` — ${payments.length} membre${payments.length > 1 ? 's' : ''}`,
    50
  );

  /* ============================
     TOTAUX
     ============================ */

  const totalExpected = payments.reduce(
    (sum, item) => sum + Number(item.expectedAmount),
    0
  );

  const totalPaid = payments.reduce(
    (sum, item) => sum + Number(item.totalPaid),
    0
  );

  const totalRemaining = payments.reduce(
    (sum, item) => sum + Number(item.remainingAmount),
    0
  );

  /* ============================
     TABLEAU
     ============================ */

  autoTable(doc, {
    startY: 56,

    head: [[
      'N°',
      'Membre',
      'Cotisation',
      'Attendu',
      'Payé',
      'Reste',
      'Statut',
    ]],

    body: payments.map((item, index) => [
      index + 1,
      `${item.firstName} ${item.lastName}`,
      item.contributionName,
      formatAmountPdf(item.expectedAmount),
      formatAmountPdf(item.totalPaid),
      formatAmountPdf(item.remainingAmount),
      item.status === 'PAYE'
        ? 'Payé'
        : item.status === 'PARTIEL'
          ? 'Partiel'
          : 'Non payé',
    ]),

    theme: 'striped',

    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      valign: 'middle',
      textColor: INK,
      lineColor: [230, 224, 204],
      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: GREEN_DEEP,
      textColor: CREAM,
      fontStyle: 'bold',
      halign: 'left',
    },

    alternateRowStyles: {
      fillColor: GOLD_SOFT,
    },

    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'center' },
    },

    // Colore le texte du statut selon sa valeur
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const value = String(data.cell.raw);

        if (value === 'Payé') {
          data.cell.styles.textColor = SUCCESS;
          data.cell.styles.fontStyle = 'bold';
        } else if (value === 'Partiel') {
          data.cell.styles.textColor = WARNING;
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = STONE;
        }
      }
    },

    didDrawPage: (data) => {
      // En-tête léger sur les pages suivantes (tableau qui continue)
      if (data.pageNumber > 1) {
        drawContinuationHeader(doc, 'ÉTAT DES COTISATIONS');
      }
    },

    margin: { top: 24 },
  });

  /* ============================
     ENCADRÉ TOTAUX
     ============================ */

  const finalY = (doc as any).lastAutoTable?.finalY || 70;

  const totalsY = ensureSpaceForBlock(
    doc,
    finalY + 8,
    getTotalsBoxHeight(3),
    'ÉTAT DES COTISATIONS'
  );

  drawTotalsBox(
    doc,
    [
      { label: 'Total attendu', value: formatAmountPdf(totalExpected) },
      { label: 'Total payé', value: formatAmountPdf(totalPaid), accent: SUCCESS },
      { label: 'Reste à collecter', value: formatAmountPdf(totalRemaining), accent: WARNING },
    ],
    totalsY
  );

  drawFooters(doc);

  const fileName = contributionName
    ? `cotisation-${contributionName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')}.pdf`
    : 'etat-des-cotisations.pdf';

  doc.save(fileName);
};