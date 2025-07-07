import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { IInputData } from "./schemas/job.schema";

export async function generateInvoicePdf(
  inputData: IInputData
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size in points
  const { width } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 12;
  const margin = 50;
  const rightAlignX = width - margin;

  let y = page.getHeight() - margin;

  // Header
  page.drawText("INVOICE", {
    x: margin,
    y,
    font: boldFont,
    size: 24,
    color: rgb(0, 0, 0),
  });

  y -= 40;

  // Customer details
  page.drawText(`Customer: ${inputData.customerName}`, {
    x: margin,
    y,
    size: fontSize,
    font,
  });

  y -= 20;

  page.drawText(`Email: ${inputData.customerEmail}`, {
    x: margin,
    y,
    size: fontSize,
    font,
  });

  y -= 40;

  // --- Table Generation ---
  const tableTop = y;

  // Table Headers
  page.drawText("Description", {
    x: margin,
    y: tableTop,
    size: fontSize,
    font: boldFont,
  });
  page.drawText("Amount", {
    x: rightAlignX - font.widthOfTextAtSize("Amount", fontSize),
    y: tableTop,
    size: fontSize,
    font: boldFont,
  });

  y -= 25;

  // Table Items
  let total = 0;
  for (const item of inputData.items) {
    page.drawText(item.description, {
      x: margin,
      y,
      size: fontSize,
      font,
    });

    const amountText = item.amount.toFixed(2);
    const amountWidth = font.widthOfTextAtSize(amountText, fontSize);
    page.drawText(amountText, {
      x: rightAlignX - amountWidth,
      y,
      size: fontSize,
      font,
    });

    total += item.amount;
    y -= 20;
  }

  // Line separator
  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: rightAlignX, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 25;

  // Total
  const totalLabel = "Total:";
  const totalValue = total.toFixed(2);
  const totalLabelWidth = boldFont.widthOfTextAtSize(totalLabel, fontSize + 2);
  const totalValueWidth = boldFont.widthOfTextAtSize(totalValue, fontSize + 2);

  page.drawText(totalLabel, {
    x: rightAlignX - totalValueWidth - totalLabelWidth - 5, 
    y,
    font: boldFont,
    size: fontSize + 2,
  });

  page.drawText(totalValue, {
    x: rightAlignX - totalValueWidth,
    y,
    font: boldFont,
    size: fontSize + 2,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
