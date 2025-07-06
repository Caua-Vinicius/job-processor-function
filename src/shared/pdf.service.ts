import puppeteer, { Browser } from "puppeteer";
import { IInputData } from "./schemas/job.schema";

function getInvoiceHtml(inputData: IInputData): string {
  let total = 0;
  const itemsHtml = inputData.items
    .map((item) => {
      total += item.amount;
      return `
        <tr class="item">
          <td>${item.description}</td>
          <td class="amount">${item.amount.toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice</title>
        <style>
          body { font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 24px; color: #555; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
          .header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .customer-details { margin-bottom: 40px; }
          .items-table { width: 100%; text-align: left; border-collapse: collapse; }
          .items-table td { padding: 8px; border-bottom: 1px solid #eee; }
          .items-table .heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
          .items-table .item:last-child td { border-bottom: none; }
          .total-row td { border-top: 2px solid #eee; font-weight: bold; }
          .amount { text-align: right; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">INVOICE</div>
          <div class="customer-details">
            <strong>Customer:</strong> ${inputData.customerName}<br>
            <strong>Email:</strong> ${inputData.customerEmail}
          </div>
          <table class="items-table">
            <tr class="heading">
              <td>Item Description</td>
              <td class="amount">Amount</td>
            </tr>
            ${itemsHtml}
            <tr class="total-row">
              <td></td>
              <td class="amount">Total: ${total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;
}

export async function generateInvoicePdf(
  inputData: IInputData
): Promise<Buffer> {
  let browser: Browser;
  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    const htmlContent = getInvoiceHtml(inputData);

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,

      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
