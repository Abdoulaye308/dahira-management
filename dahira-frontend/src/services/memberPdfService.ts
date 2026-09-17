import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Member } from '../types/member';
import {
  GREEN_DEEP,
  GOLD_SOFT,
  CREAM,
  INK,
  loadLogoAsBase64,
  drawMainHeader,
  drawContinuationHeader,
  drawSectionTitle,
  drawTotalsBox,
  drawFooters,
  getTotalsBoxHeight,
  ensureSpaceForBlock,
} from './pdfBranding';

export const generateMembersPdf = async (
  members: Member[],
  categoryName?: string
) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('fr-FR');

  let logoBase64: string | null = null;
  try {
    logoBase64 = await loadLogoAsBase64();
  } catch (err) {
    console.error('Logo introuvable pour le PDF :', err);
  }

  drawMainHeader(doc, logoBase64, dateStr, 'LISTE DES MEMBRES');

  const drawTable = (data: Member[], startY: number) => {
    autoTable(doc, {
      startY,

      head: [['N°', 'Prénom', 'Nom', 'Téléphone', 'Catégorie']],

      body: data.map((member, index) => [
        index + 1,
        member.firstName,
        member.lastName,
        member.phone,
        member.category.name,
      ]),

      theme: 'striped',

      styles: {
        fontSize: 9,
        cellPadding: 4,
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
        3: { halign: 'center' },
      },
    });
  };

  /* ============================
     CAS : UNE SEULE CATÉGORIE
     ============================ */

  if (categoryName) {
    const categoryMembers = members.filter(
      (member) => member.category.name === categoryName
    );

    drawSectionTitle(
      doc,
      categoryName,
      ` — ${categoryMembers.length} membre${categoryMembers.length > 1 ? 's' : ''}`,
      50
    );

    drawTable(categoryMembers, 56);
  }

  /* ============================
     CAS : TOUTES LES CATÉGORIES
     ============================ */

  else {
    const categories = Array.from(
      new Map(
        members.map((member) => [member.category.id, member.category.name])
      ).entries()
    );

    categories.forEach(([categoryId, catName], categoryIndex) => {
      const categoryMembers = members.filter(
        (member) => member.category.id === categoryId
      );

      if (categoryIndex > 0) {
        doc.addPage();
        drawContinuationHeader(doc, 'LISTE DES MEMBRES');
      }

      const startY = categoryIndex === 0 ? 50 : 30;

      drawSectionTitle(
        doc,
        catName,
        ` — ${categoryMembers.length} membre${categoryMembers.length > 1 ? 's' : ''}`,
        startY
      );

      drawTable(categoryMembers, startY + 6);
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 60;

    const totalsY = ensureSpaceForBlock(
      doc,
      finalY + 8,
      getTotalsBoxHeight(1),
      'LISTE DES MEMBRES'
    );

    drawTotalsBox(
      doc,
      [
        {
          label: 'Total général',
          value: `${members.length} membre${members.length > 1 ? 's' : ''}`,
        },
      ],
      totalsY
    );
  }

  drawFooters(doc);

  const fileName = categoryName
    ? `membres-${categoryName.toLowerCase().replace(/\s+/g, '-')}.pdf`
    : 'liste-des-membres.pdf';

  doc.save(fileName);
};