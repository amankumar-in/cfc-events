import { generateQRCodeDataURL } from "@/lib/qrcode";

// -------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------

export interface TicketCategory {
  id: number;
  documentId: string;
  name: string;
  price: number;
  currency: string;
  validFrom: string;
  validUntil: string;
}

export interface PurchaseDetails {
  id: number;
  documentId: string;
  referenceNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  totalAmount: number;
  currency: string;
  purchaseDate: string;
  paymentStatus: string;
}

export interface Ticket {
  id: number;
  documentId: string;
  ticketNumber: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  attendeeOrganization: string;
  isCheckedIn: boolean;
  qrCodeData: string;
  qrCodeImage?: string;
  ticketCategory?: TicketCategory;
  purchase?: PurchaseDetails;
}

// -------------------------------------------------------------------
// QR Code Helpers
// -------------------------------------------------------------------

export async function generateQRCodeImages(tickets: Ticket[]): Promise<Ticket[]> {
  const updated = [...tickets];
  for (let i = 0; i < updated.length; i++) {
    try {
      const qrImage = await generateQRCodeDataURL(updated[i].qrCodeData);
      updated[i] = { ...updated[i], qrCodeImage: qrImage };
    } catch (error) {
      console.error(`Error generating QR code for ticket ${i}:`, error);
    }
  }
  return updated;
}

// -------------------------------------------------------------------
// Ticket HTML Template (used for PDF generation)
// -------------------------------------------------------------------

export function renderTicketHTML(ticket: Ticket): string {
  const validFrom = ticket.ticketCategory?.validFrom
    ? new Date(ticket.ticketCategory.validFrom).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "12 April 2025";

  const validUntil = ticket.ticketCategory?.validUntil
    ? new Date(ticket.ticketCategory.validUntil).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "30 April 2025";

  const categoryName = ticket.ticketCategory?.name || "Single Event Ticket";

  return `
    <div style="border: 1px solid #e5e7eb; width: 800px; box-sizing: border-box;">
      <div style="display: flex;">
        <div style="width: 75%; background-color: white;">
          <div style="background-color: #2563eb; color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-weight: bold; font-size: 20px; margin: 0;">UNITE EXPO 2025</h3>
              <p style="font-size: 14px; margin: 0; color: #fff;">Uganda Next Investment & Trade Expo</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 14px; margin: 0; color: #fff;">${categoryName}</p>
            </div>
          </div>
          <div style="padding: 16px;">
            <h4 style="font-size: 20px; font-weight: bold; margin: 0 0 8px 0; color: #000;">${ticket.attendeeName}</h4>
            <p style="margin: 0 0 4px 0; color: #000;">${ticket.attendeeEmail}</p>
            ${ticket.attendeePhone ? `<p style="margin: 0; color: #000;">${ticket.attendeePhone}</p>` : ""}
          </div>
          <div style="padding: 0 16px 16px 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div>
                <p style="font-size: 12px; text-transform: uppercase; color: #6b7280; margin: 0 0 4px 0;">Ticket Type</p>
                <p style="font-weight: 500; margin: 0; color: #000">${categoryName}</p>
              </div>
              <div>
                <p style="font-size: 12px; text-transform: uppercase; color: #6b7280; margin: 0 0 4px 0;">Ticket #</p>
                <p style="font-weight: 500; font-size: 14px; word-break: break-all; margin: 0; color: #000">${ticket.ticketNumber}</p>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <p style="font-size: 12px; text-transform: uppercase; color: #6b7280; margin: 0 0 4px 0;">Valid From</p>
                <p style="font-weight: 500; margin: 0; color: #000">${validFrom}</p>
              </div>
              <div>
                <p style="font-size: 12px; text-transform: uppercase; color: #6b7280; margin: 0 0 4px 0;">Valid Until</p>
                <p style="font-weight: 500; margin: 0; color: #000">${validUntil}</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; margin-top: 16px;">
              <svg style="height: 16px; width: 16px; margin-right: 8px; color: #6b7280;" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span style="font-size: 14px; color: #000;">Kampala International Convention Centre, Uganda</span>
            </div>
          </div>
        </div>
        <div style="border-left: 1px solid #e5e7eb;"></div>
        <div style="width: 25%; background-color: #f9fafb; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px;">
          <p style="font-weight: bold; text-align: center; margin: 0 0 12px 0; color: #000;">ADMIT ONE</p>
          <div style="width: 100%; aspect-ratio: 1; margin-bottom: 12px;">
            <img src="${ticket.qrCodeImage}" alt="Ticket QR Code" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
          <p style="font-size: 12px; text-align: center; color: #000; margin: 0 0 4px 0;">SCAN TO VERIFY</p>
          <p style="font-size: 12px; text-align: center; font-weight: bold; margin: 0; color: #000;">UNITE EXPO 2025</p>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------
// PDF Generation
// -------------------------------------------------------------------

async function renderTicketToImage(ticket: Ticket): Promise<string> {
  const html2canvas = (await import("html2canvas")).default;

  if (!ticket.qrCodeImage) {
    ticket.qrCodeImage = await generateQRCodeDataURL(ticket.qrCodeData);
  }

  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "-9999px";
  tempDiv.style.width = "800px";
  tempDiv.innerHTML = renderTicketHTML(ticket);
  document.body.appendChild(tempDiv);

  const canvas = await html2canvas(tempDiv, {
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true,
  });
  document.body.removeChild(tempDiv);
  return canvas.toDataURL("image/png");
}

export async function generateTicketPDF(ticket: Ticket): Promise<void> {
  const imageData = await renderTicketToImage(ticket);
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfMake = pdfMakeModule.default || pdfMakeModule;

  const docDefinition = {
    pageSize: "A4" as const,
    pageOrientation: "landscape" as const,
    content: [{ image: imageData, width: 750 }],
    pageMargins: [30, 30, 30, 30] as [number, number, number, number],
  };
  pdfMake.createPdf(docDefinition).download(`UNITE-Expo-Ticket-${ticket.ticketNumber}.pdf`);
}

export async function generateAllTicketPDFs(tickets: Ticket[]): Promise<void> {
  const ticketsWithQR = await generateQRCodeImages(tickets);
  const content: Array<{ image: string; width: number } | { text: string; pageBreak: string }> = [];

  for (let i = 0; i < ticketsWithQR.length; i++) {
    const imageData = await renderTicketToImage(ticketsWithQR[i]);
    content.push({ image: imageData, width: 750 });
    if (i < ticketsWithQR.length - 1) {
      content.push({ text: "", pageBreak: "after" });
    }
  }

  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfMake = pdfMakeModule.default || pdfMakeModule;

  const docDefinition = {
    pageSize: "A4" as const,
    pageOrientation: "landscape" as const,
    content,
    pageMargins: [30, 30, 30, 30] as [number, number, number, number],
  };
  pdfMake.createPdf(docDefinition).download("UNITE-Expo-All-Tickets.pdf");
}

// -------------------------------------------------------------------
// Format Helpers
// -------------------------------------------------------------------

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
