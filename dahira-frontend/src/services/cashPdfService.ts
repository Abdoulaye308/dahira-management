import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CashTransaction } from '../types/cash';
import {
  GREEN_DEEP,
  GOLD_SOFT,
  CREAM,
  INK,
  SUCCESS,
  WARNING,
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

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR');

const getSourceLabel = (source: CashTransaction['source']) => {
  switch (source) {
    case 'PAYMENT':
      return 'Cotisation';
    case 'INCOME':
      return 'Revenu';
    case 'EXPENSE':
      return 'Dépense';
    default:
      return source;
  }
};

const getBadgeLabel = (type: 'ALL' | 'INCOME' | 'EXPENSE') => {
  switch (type) {
    case 'INCOME':
      return 'LISTE DES REVENUS';
    case 'EXPENSE':
      return 'LISTE DES DÉPENSES';
    default:
      return 'JOURNAL DE CAISSE';
  }
};

const getSectionTitle = (type: 'ALL' | 'INCOME' | 'EXPENSE') => {
  switch (type) {
    case 'INCOME':
      return 'Revenus';
    case 'EXPENSE':
      return 'Dépenses';
    default:
      return 'Toutes les opérations';
  }
};

export const generateCashPdf = async (
  transactions: CashTransaction[],
  type: 'ALL' | 'INCOME' | 'EXPENSE' = 'ALL'
) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('fr-FR');

  let filteredTransactions = transactions;

  if (type === 'INCOME') {
    filteredTransactions = transactions.filter(
      (transaction) => transaction.source === 'INCOME'
    );
  }

  if (type === 'EXPENSE') {
    filteredTransactions = transactions.filter(
      (transaction) => transaction.source === 'EXPENSE'
    );
  }

  let logoBase64: string | null = null;
  try {
    logoBase64 = await loadLogoAsBase64();
  } catch (err) {
    console.error('Logo introuvable pour le PDF :', err);
  }

  const badgeLabel = getBadgeLabel(type);

  drawMainHeader(doc, logoBase64, dateStr, badgeLabel);

  drawSectionTitle(
    doc,
    getSectionTitle(type),
    ` — ${filteredTransactions.length} opération${
      filteredTransactions.length > 1 ? 's' : ''
    }`,
    50
  );

  /* ============================
     CALCULS
     ============================ */

  const totalEntries = filteredTransactions
    .filter((transaction) => transaction.type === 'ENTREE')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const totalExpenses = filteredTransactions
    .filter((transaction) => transaction.type === 'SORTIE')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  /* ============================
     TABLEAU
     ============================ */

  autoTable(doc, {
    startY: 56,

    head: [['Date', 'Opération', 'Source', 'Type', 'Montant']],

    body: filteredTransactions.map((transaction) => [
      formatDate(transaction.date),
      transaction.title,
      getSourceLabel(transaction.source),
      transaction.type === 'ENTREE' ? 'Entrée' : 'Sortie',
      `${transaction.type === 'ENTREE' ? '+' : '-'} ${formatAmountPdf(
        transaction.amount
      )}`,
    ]),

    theme: 'striped',

    styles: {
      fontSize: 9,
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
      0: { cellWidth: 24 },
      1: { cellWidth: 58 },
      2: { cellWidth: 28 },
      3: { cellWidth: 22 },
      4: { halign: 'right' },
    },

    // Colore le montant selon le sens de l'opération
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const isEntry = String(data.cell.raw).startsWith('+');
        data.cell.styles.textColor = isEntry ? SUCCESS : WARNING;
        data.cell.styles.fontStyle = 'bold';
      }
    },

    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawContinuationHeader(doc, badgeLabel);
      }
    },

    margin: { top: 24 },
  });

  /* ============================
     ENCADRÉ TOTAUX
     ============================ */

  const finalY = (doc as any).lastAutoTable?.finalY || 70;

  const totalsLines: { label: string; value: string; accent?: [number, number, number] }[] = [];

  if (type !== 'EXPENSE') {
    totalsLines.push({
      label: 'Total des entrées',
      value: formatAmountPdf(totalEntries),
      accent: SUCCESS,
    });
  }

  if (type !== 'INCOME') {
    totalsLines.push({
      label: 'Total des dépenses',
      value: formatAmountPdf(totalExpenses),
      accent: WARNING,
    });
  }

  if (type === 'ALL') {
    totalsLines.push({
      label: 'Solde du journal',
      value: formatAmountPdf(totalEntries - totalExpenses),
    });
  }

  const totalsY = ensureSpaceForBlock(
    doc,
    finalY + 8,
    getTotalsBoxHeight(totalsLines.length),
    badgeLabel
  );

  drawTotalsBox(doc, totalsLines, totalsY);

  drawFooters(doc);

  /* ============================
     TÉLÉCHARGEMENT
     ============================ */

  const filename =
    type === 'INCOME'
      ? 'revenus-caisse.pdf'
      : type === 'EXPENSE'
        ? 'depenses-caisse.pdf'
        : 'journal-caisse.pdf';

  doc.save(filename);
};