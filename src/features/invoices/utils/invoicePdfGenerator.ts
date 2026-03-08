import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice } from '../types';
import type { Company } from '../../../types';
import { formatDate, formatCurrency } from '../../../utils/helpers';

// Extend jsPDF to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

// Flexible Party type for PDF generation
export interface PdfPartyData {
  name?: string;
  address?: string;
  country?: string;
  email?: string;
  contactEmail?: string;
  phone?: string;
  contactPhone?: string;
  contactPerson?: string;
  logoUrl?: string | null;
}

// Invoice PDF Data structure
export interface InvoicePdfData {
  invoice: Invoice;
  company?: Company;
  party?: PdfPartyData;
}

// Professional PDF Configuration
const PDF_CONFIG = {
  pageWidth: 210,
  pageHeight: 297,
  margin: {
    top: 15,
    bottom: 15,
    left: 15,
    right: 15,
  },
  colors: {
    primary: [41, 128, 185] as [number, number, number],      // Professional Blue
    primaryDark: [30, 100, 150] as [number, number, number],  // Darker Blue
    accent: [26, 188, 156] as [number, number, number],       // Teal accent
    dark: [44, 62, 80] as [number, number, number],           // Dark gray-blue
    text: [52, 73, 94] as [number, number, number],           // Body text
    muted: [127, 140, 141] as [number, number, number],       // Muted text
    light: [236, 240, 241] as [number, number, number],       // Light background
    white: [255, 255, 255] as [number, number, number],
    border: [189, 195, 199] as [number, number, number],
    success: [39, 174, 96] as [number, number, number],
    warning: [243, 156, 18] as [number, number, number],
    danger: [231, 76, 60] as [number, number, number],
  },
  fonts: {
    titleSize: 28,
    headingSize: 16,
    subheadingSize: 12,
    normalSize: 10,
    smallSize: 9,
    tinySize: 8,
  },
};

// Format amount for PDF
const formatPdfAmount = (amount: number | null | undefined, currency: string): string => {
  const safeAmount = amount == null || isNaN(amount) ? 0 : amount;
  return `${currency} ${formatCurrency(safeAmount, currency, false)}`;
};

// Get status styling
const getStatusStyle = (status: string): { color: [number, number, number]; label: string } => {
  switch (status) {
    case 'ISSUED':
      return { color: PDF_CONFIG.colors.primary, label: 'ISSUED' };
    case 'SETTLED':
      return { color: PDF_CONFIG.colors.success, label: 'PAID' };
    case 'PARTIALLY_PAID':
      return { color: PDF_CONFIG.colors.warning, label: 'PARTIAL' };
    case 'CANCELLED':
      return { color: PDF_CONFIG.colors.danger, label: 'VOID' };
    default:
      return { color: PDF_CONFIG.colors.muted, label: 'DRAFT' };
  }
};

// Draw the professional header with logo space
const drawProfessionalHeader = (
  doc: jsPDFWithAutoTable,
  data: InvoicePdfData,
  yPosition: number
): number => {
  const { invoice, company } = data;
  const { margin, colors, fonts, pageWidth } = PDF_CONFIG;

  // Top accent bar
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 8, 'F');

  yPosition = 20;

  // ===== LEFT SIDE: Company Info =====
  const leftColX = margin.left;
  const logoSize = 25;

  // Company Logo Placeholder with initials
  doc.setFillColor(...colors.primary);
  doc.setDrawColor(...colors.primary);
  doc.roundedRect(leftColX, yPosition, logoSize, logoSize, 3, 3, 'FD');
  
  // Get company initials (first letter of each word, max 2)
  const companyName = company?.name || 'Company';
  const initials = companyName
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
  
  doc.setFontSize(14);
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.text(initials, leftColX + logoSize / 2, yPosition + logoSize / 2 + 4, { align: 'center' });

  // Company name next to logo
  const companyInfoX = leftColX + logoSize + 8;
  doc.setFontSize(fonts.headingSize);
  doc.setTextColor(...colors.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(company?.name || 'Company Name', companyInfoX, yPosition + 6);

  // Company address
  doc.setFontSize(fonts.smallSize);
  doc.setTextColor(...colors.muted);
  doc.setFont('helvetica', 'normal');
  
  let companyY = yPosition + 12;
  if (company?.address) {
    const addressLines = doc.splitTextToSize(company.address, 70);
    doc.text(addressLines, companyInfoX, companyY);
    companyY += addressLines.length * 4;
  }

  // Tax identifiers
  const taxInfo: string[] = [];
  if (company?.gstNumber) taxInfo.push(`GST: ${company.gstNumber}`);
  if (company?.iecNumber) taxInfo.push(`IEC: ${company.iecNumber}`);
  if (company?.taxId) taxInfo.push(`PAN: ${company.taxId}`);
  
  if (taxInfo.length > 0) {
    doc.setFontSize(fonts.tinySize);
    doc.text(taxInfo.join('  •  '), companyInfoX, companyY);
  }

  // ===== RIGHT SIDE: Invoice Title & Number =====
  const rightColX = pageWidth - margin.right;
  
  // INVOICE title
  doc.setFontSize(fonts.titleSize);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', rightColX, yPosition + 8, { align: 'right' });

  // Invoice number
  doc.setFontSize(fonts.subheadingSize);
  doc.setTextColor(...colors.dark);
  doc.setFont('helvetica', 'normal');
  doc.text(`# ${invoice.invoiceNumber}`, rightColX, yPosition + 16, { align: 'right' });

  // Invoice type badge
  const invoiceType = invoice.invoiceType === 'EXPORT' ? 'EXPORT' : 'IMPORT';
  const typeWidth = 25;
  doc.setFillColor(...(invoice.invoiceType === 'EXPORT' ? colors.accent : colors.primary));
  doc.roundedRect(rightColX - typeWidth, yPosition + 20, typeWidth, 7, 1.5, 1.5, 'F');
  
  doc.setFontSize(fonts.tinySize);
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceType, rightColX - typeWidth / 2, yPosition + 25, { align: 'center' });

  yPosition += logoSize + 15;

  // Divider line
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.line(margin.left, yPosition, pageWidth - margin.right, yPosition);

  return yPosition + 8;
};

// Draw invoice meta information (dates, status, reference)
const drawInvoiceMeta = (
  doc: jsPDFWithAutoTable,
  data: InvoicePdfData,
  yPosition: number
): number => {
  const { invoice } = data;
  const { margin, colors, fonts, pageWidth } = PDF_CONFIG;
  const contentWidth = pageWidth - margin.left - margin.right;

  // Create a subtle background for meta section
  doc.setFillColor(...colors.light);
  doc.roundedRect(margin.left, yPosition, contentWidth, 22, 2, 2, 'F');

  yPosition += 6;

  // Four columns: Issue Date | Due Date | Status | Reference
  const colWidth = contentWidth / 4;
  const cols = [
    { label: 'Issue Date', value: formatDate(invoice.invoiceDate), x: margin.left + 8 },
    { label: 'Due Date', value: formatDate(invoice.dueDate), x: margin.left + colWidth + 8 },
    { label: 'Status', value: '', x: margin.left + colWidth * 2 + 8, isStatus: true },
    { label: 'Trade Ref.', value: invoice.tradeNumber || '-', x: margin.left + colWidth * 3 + 8 },
  ];

  cols.forEach((col) => {
    // Label
    doc.setFontSize(fonts.tinySize);
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(col.label, col.x, yPosition);

    // Value
    if (col.isStatus) {
      const status = getStatusStyle(invoice.status);
      const statusWidth = 22;
      doc.setFillColor(...status.color);
      doc.roundedRect(col.x, yPosition + 2, statusWidth, 6, 1, 1, 'F');
      
      doc.setFontSize(6);
      doc.setTextColor(...colors.white);
      doc.setFont('helvetica', 'bold');
      doc.text(status.label, col.x + statusWidth / 2, yPosition + 6, { align: 'center' });
    } else {
      doc.setFontSize(fonts.normalSize);
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'bold');
      doc.text(col.value, col.x, yPosition + 6);
    }
  });

  return yPosition + 22;
};

// Draw Bill To / Ship To section with party logo space
const drawPartySection = (
  doc: jsPDFWithAutoTable,
  data: InvoicePdfData,
  yPosition: number
): number => {
  const { invoice, party, company } = data;
  const { margin, colors, fonts, pageWidth } = PDF_CONFIG;
  const contentWidth = pageWidth - margin.left - margin.right;
  const halfWidth = (contentWidth - 10) / 2;

  // ===== BILL TO Section =====
  const billToX = margin.left;
  
  // Section header
  doc.setFontSize(fonts.tinySize);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', billToX, yPosition);

  yPosition += 5;

  // Bill To Box
  const boxHeight = 32;
  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(billToX, yPosition, halfWidth, boxHeight, 2, 2, 'FD');

  // Party logo placeholder (small)
  const partyLogoSize = 12;
  doc.setFillColor(...colors.light);
  doc.roundedRect(billToX + 4, yPosition + 4, partyLogoSize, partyLogoSize, 1, 1, 'F');
  
  doc.setFontSize(5);
  doc.setTextColor(...colors.muted);
  doc.text('LOGO', billToX + 4 + partyLogoSize / 2, yPosition + 4 + partyLogoSize / 2 + 1, { align: 'center' });

  // Party details
  const partyInfoX = billToX + partyLogoSize + 10;
  
  doc.setFontSize(fonts.normalSize);
  doc.setTextColor(...colors.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.partyName || party?.name || 'Party Name', partyInfoX, yPosition + 8);

  doc.setFontSize(fonts.smallSize);
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'normal');

  let partyY = yPosition + 14;
  if (party?.address) {
    const addressLines = doc.splitTextToSize(party.address, halfWidth - partyLogoSize - 18);
    doc.text(addressLines, partyInfoX, partyY);
    partyY += addressLines.length * 3.5;
  }
  if (party?.country) {
    doc.text(party.country, partyInfoX, partyY);
    partyY += 4;
  }

  // Contact info
  doc.setFontSize(fonts.tinySize);
  const partyEmail = party?.email || party?.contactEmail;
  const partyPhone = party?.phone || party?.contactPhone;
  if (partyEmail) {
    doc.text(`✉ ${partyEmail}`, partyInfoX, partyY);
    partyY += 3;
  }
  if (partyPhone) {
    doc.text(`☎ ${partyPhone}`, partyInfoX, partyY);
  }

  return yPosition + boxHeight + 10;
};

// Draw professional line items table
const drawLineItemsTable = (
  doc: jsPDFWithAutoTable,
  data: InvoicePdfData,
  yPosition: number
): number => {
  const { invoice } = data;
  const { margin, colors, fonts } = PDF_CONFIG;

  // Table data
  const tableData = invoice.lineItems.map((item, index) => [
    (index + 1).toString(),
    item.description || '-',
    item.hsCode || '-',
    item.quantity.toString(),
    item.unit || 'PCS',
    formatCurrency(item.unitPrice, invoice.currency, false),
    formatCurrency(item.lineTotal, invoice.currency, false),
  ]);

  // Professional table styling
  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Description', 'HS Code', 'Qty', 'Unit', 'Unit Price', 'Amount']],
    body: tableData,
    margin: { left: margin.left, right: margin.right },
    theme: 'plain',
    styles: {
      fontSize: fonts.smallSize,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      lineColor: colors.border,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.white,
      fontStyle: 'bold',
      fontSize: fonts.smallSize,
      cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
    },
    bodyStyles: {
      textColor: colors.text,
    },
    alternateRowStyles: {
      fillColor: [250, 252, 255],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 28, halign: 'right' },
      6: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    didDrawCell: (data) => {
      // Add bottom border to last row
      if (data.row.index === tableData.length - 1 && data.section === 'body') {
        const { doc: cellDoc, cell } = data;
        cellDoc.setDrawColor(...colors.primary);
        cellDoc.setLineWidth(0.5);
        cellDoc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
      }
    },
  });

  yPosition = (doc as jsPDFWithAutoTable).lastAutoTable?.finalY || yPosition + 40;
  return yPosition + 15; // Added more space before totals
};

// Draw totals section with professional styling
const drawTotalsSection = (
  doc: jsPDFWithAutoTable,
  data: InvoicePdfData,
  yPosition: number
): number => {
  const { invoice } = data;
  const { margin, colors, fonts, pageWidth } = PDF_CONFIG;

  // Add space above totals
  yPosition += 5;

  // Totals box on the right
  const totalsWidth = 85;
  const totalsX = pageWidth - margin.right - totalsWidth;
  const labelX = totalsX + 5;
  const valueX = pageWidth - margin.right - 5;

  // Calculate subtotal from line items if not provided
  const calculatedSubtotal = invoice.subtotal || invoice.lineItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);

  // Background box for totals
  const boxStartY = yPosition - 3;
  let totalBoxHeight = 40; // Base height with padding
  if ((invoice.discountPercent ?? 0) > 0 || (invoice.discountAmount ?? 0) > 0) totalBoxHeight += 8;
  if ((invoice.taxPercent ?? 0) > 0 || (invoice.taxAmount ?? 0) > 0) totalBoxHeight += 8;
  if (invoice.status !== 'DRAFT') totalBoxHeight += 20;

  doc.setFillColor(...colors.light);
  doc.roundedRect(totalsX, boxStartY, totalsWidth, totalBoxHeight, 2, 2, 'F');

  // Add internal padding before Subtotal
  yPosition += 5;

  // Subtotal
  doc.setFontSize(fonts.smallSize);
  doc.setTextColor(...colors.muted);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', labelX, yPosition);
  doc.setTextColor(...colors.text);
  doc.text(formatPdfAmount(calculatedSubtotal, invoice.currency), valueX, yPosition, { align: 'right' });
  yPosition += 7;

  // Discount
  if ((invoice.discountPercent ?? 0) > 0 || (invoice.discountAmount ?? 0) > 0) {
    doc.setTextColor(...colors.muted);
    doc.text(`Discount (${invoice.discountPercent ?? 0}%):`, labelX, yPosition);
    doc.setTextColor(...colors.danger);
    doc.text(`-${formatPdfAmount(invoice.discountAmount ?? 0, invoice.currency)}`, valueX, yPosition, { align: 'right' });
    yPosition += 7;
  }

  // Tax
  if ((invoice.taxPercent ?? 0) > 0 || (invoice.taxAmount ?? 0) > 0) {
    doc.setTextColor(...colors.muted);
    doc.text(`Tax (${invoice.taxPercent ?? 0}%):`, labelX, yPosition);
    doc.setTextColor(...colors.warning);
    doc.text(`+${formatPdfAmount(invoice.taxAmount ?? 0, invoice.currency)}`, valueX, yPosition, { align: 'right' });
    yPosition += 7;
  }

  // Total Amount - highlighted
  yPosition += 2;
  doc.setFillColor(...colors.primary);
  doc.roundedRect(totalsX, yPosition - 4, totalsWidth, 12, 1, 1, 'F');

  doc.setFontSize(fonts.normalSize);
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', labelX, yPosition + 3);
  doc.setFontSize(fonts.subheadingSize);
  doc.text(formatPdfAmount(invoice.invoiceAmount, invoice.currency), valueX, yPosition + 3, { align: 'right' });

  yPosition += 12;

  // Payment status for issued invoices
  if (invoice.status !== 'DRAFT') {
    yPosition += 5;
    
    doc.setFontSize(fonts.smallSize);
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'normal');
    doc.text('Paid:', labelX, yPosition);
    doc.setTextColor(...colors.success);
    doc.text(formatPdfAmount(invoice.paidAmount, invoice.currency), valueX, yPosition, { align: 'right' });
    yPosition += 6;

    doc.setTextColor(...colors.muted);
    doc.text('Balance Due:', labelX, yPosition);
    const balanceColor = (invoice.outstandingAmount ?? 0) > 0 ? colors.danger : colors.success;
    doc.setTextColor(...balanceColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPdfAmount(invoice.outstandingAmount, invoice.currency), valueX, yPosition, { align: 'right' });
    yPosition += 8;
  }

  return yPosition;
};

// Draw footer with terms and signature space
const drawProfessionalFooter = (
  doc: jsPDFWithAutoTable,
  data: InvoicePdfData,
  yPosition: number
): void => {
  const { company } = data;
  const { margin, colors, fonts, pageWidth, pageHeight } = PDF_CONFIG;

  // Check if we need more space for footer
  const footerHeight = 60;
  if (yPosition > pageHeight - footerHeight) {
    doc.addPage();
    yPosition = margin.top;
  }

  yPosition += 15;

  // Divider
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.line(margin.left, yPosition, pageWidth - margin.right, yPosition);
  yPosition += 8;

  // Terms & Notes section
  doc.setFontSize(fonts.smallSize);
  doc.setTextColor(...colors.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions', margin.left, yPosition);
  yPosition += 5;

  doc.setFontSize(fonts.tinySize);
  doc.setTextColor(...colors.muted);
  doc.setFont('helvetica', 'normal');
  
  const terms = [
    '1. Payment is due within the specified due date.',
    '2. Please include invoice number in payment reference.',
    '3. Bank charges, if any, to be borne by the remitter.',
  ];
  terms.forEach(term => {
    doc.text(term, margin.left, yPosition);
    yPosition += 4;
  });

  // Signature section (right side)
  const sigX = pageWidth - margin.right - 60;
  const sigY = yPosition - 12;
  
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.line(sigX, sigY + 15, sigX + 55, sigY + 15);
  
  doc.setFontSize(fonts.tinySize);
  doc.setTextColor(...colors.muted);
  doc.text('Authorized Signature', sigX + 27.5, sigY + 20, { align: 'center' });

  // Bottom accent bar
  doc.setFillColor(...colors.primary);
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');

  // Footer info on the accent bar
  doc.setFontSize(fonts.tinySize);
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'normal');
  
  const timestamp = `Generated: ${new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  })}`;
  doc.text(timestamp, margin.left, pageHeight - 3);
  
  doc.setFont('helvetica', 'bold');
  doc.text(company?.name || 'Company', pageWidth - margin.right, pageHeight - 3, { align: 'right' });

  // Thank you message above footer bar
  doc.setFontSize(fonts.normalSize);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 15, { align: 'center' });
};

// Main function to generate professional invoice PDF
export const generateInvoicePdf = (data: InvoicePdfData): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  }) as jsPDFWithAutoTable;

  let yPosition = PDF_CONFIG.margin.top;

  // Draw all sections
  yPosition = drawProfessionalHeader(doc, data, yPosition);
  yPosition = drawInvoiceMeta(doc, data, yPosition);
  yPosition = drawPartySection(doc, data, yPosition);
  yPosition = drawLineItemsTable(doc, data, yPosition);
  yPosition = drawTotalsSection(doc, data, yPosition);
  drawProfessionalFooter(doc, data, yPosition);

  return doc;
};

// Save PDF to file
export const downloadInvoicePdf = (data: InvoicePdfData): void => {
  const doc = generateInvoicePdf(data);
  const filename = `Invoice_${data.invoice.invoiceNumber}_${formatDate(data.invoice.invoiceDate).replace(/\//g, '-')}.pdf`;
  doc.save(filename);
};

// Open PDF in new window
export const previewInvoicePdf = (data: InvoicePdfData): void => {
  const doc = generateInvoicePdf(data);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};

// Get PDF as base64
export const getInvoicePdfBase64 = (data: InvoicePdfData): string => {
  const doc = generateInvoicePdf(data);
  return doc.output('datauristring');
};

export default generateInvoicePdf;
