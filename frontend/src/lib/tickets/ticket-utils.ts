import { generateQRCodeDataURL } from "@/lib/qrcode";

// -------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------

export interface VenueInfo {
  id: number;
  documentId: string;
  Name: string;
  City: string;
  Country: string;
  Address?: string;
}

export interface EventInfo {
  id: number;
  documentId: string;
  Title: string;
  Slug: string;
  ShortDescription?: string;
  StartDate: string;
  EndDate: string;
  Location: string;
  Category?: string;
  venue?: VenueInfo;
}

export interface SessionInfo {
  id: number;
  documentId: string;
  Title: string;
  Slug: string;
  StartDate: string;
  EndDate: string;
  Location?: string;
  SessionType?: string;
  event?: EventInfo;
  venue?: VenueInfo;
}

export interface TicketCategory {
  id: number;
  documentId: string;
  name: string;
  price: number;
  currency: string;
  validFrom: string;
  validUntil: string;
  grantsFullEventAccess?: boolean;
  allowedEvents?: EventInfo[];
  allowedSessions?: SessionInfo[];
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
  event?: EventInfo;
  session?: SessionInfo;
}

// -------------------------------------------------------------------
// Display Info Helper
// -------------------------------------------------------------------

export interface TicketDisplayInfo {
  eventName: string;
  eventTagline: string;
  startDate: string;
  endDate: string;
  location: string;
  isSessionTicket: boolean;
  sessionName?: string;
  sessionType?: string;
  sessionStartDate?: string;
  sessionEndDate?: string;
  eventSlug?: string;
}

export function getTicketDisplayInfo(ticket: Ticket): TicketDisplayInfo {
  const category = ticket.ticketCategory;
  const event = ticket.event || category?.allowedEvents?.[0];
  const session = ticket.session || category?.allowedSessions?.[0];
  const isSessionTicket = !category?.grantsFullEventAccess && !!session;

  const sourceEvent = isSessionTicket ? (session?.event ?? event) : event;
  const sourceVenue = isSessionTicket
    ? (session?.venue ?? sourceEvent?.venue)
    : sourceEvent?.venue;

  const locationStr = sourceVenue
    ? `${sourceVenue.Name}, ${sourceVenue.City}, ${sourceVenue.Country}`
    : (sourceEvent?.Location ?? "");

  return {
    eventName: sourceEvent?.Title ?? "Event",
    eventTagline: sourceEvent?.ShortDescription ?? "",
    startDate: sourceEvent?.StartDate ?? category?.validFrom ?? "",
    endDate: sourceEvent?.EndDate ?? category?.validUntil ?? "",
    location: locationStr,
    isSessionTicket,
    sessionName: session?.Title,
    sessionType: session?.SessionType,
    sessionStartDate: session?.StartDate,
    sessionEndDate: session?.EndDate,
    eventSlug: sourceEvent?.Slug,
  };
}

// -------------------------------------------------------------------
// Populate Query Constants
export const TICKET_DEEP_POPULATE = [
  "populate[ticketCategory][populate][allowedEvents][populate][0]=venue",
  "populate[ticketCategory][populate][allowedSessions][populate][0]=event",
  "populate[ticketCategory][populate][allowedSessions][populate][1]=venue",
  "populate[event][populate][0]=venue",
  "populate[session][populate][0]=event",
  "populate[session][populate][1]=venue",
  "populate[purchase]=*",
].join("&");

export const TICKET_CATEGORY_DEEP_POPULATE = [
  "populate[allowedEvents][populate][0]=venue",
  "populate[allowedSessions][populate][0]=event",
  "populate[allowedSessions][populate][1]=venue",
].join("&");

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
  const info = getTicketDisplayInfo(ticket);
  const categoryName = ticket.ticketCategory?.name || "Ticket";

  const validFrom = ticket.ticketCategory?.validFrom
    ? new Date(ticket.ticketCategory.validFrom).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : info.startDate
      ? new Date(info.startDate).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  const validUntil = ticket.ticketCategory?.validUntil
    ? new Date(ticket.ticketCategory.validUntil).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : info.endDate
      ? new Date(info.endDate).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  const badgeLabel = info.isSessionTicket ? "SESSION" : "FULL ACCESS";

  const sessionTimeSection = info.isSessionTicket && info.sessionStartDate
    ? `<div style="margin-top: 12px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 0 0 4px 0;">Session Time${info.sessionType ? ` \u2014 ${info.sessionType}` : ""}</p>
        <p style="font-weight: 500; margin: 0; color: #000">${new Date(info.sessionStartDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} ${new Date(info.sessionStartDate).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}${info.sessionEndDate ? ` \u2013 ${new Date(info.sessionEndDate).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}` : ""}</p>
      </div>`
    : "";

  const headerTitle = info.isSessionTicket && info.sessionName ? info.sessionName : info.eventName;
  const headerSubtitle = info.isSessionTicket
    ? `<p style="font-size: 13px; margin: 4px 0 0 0; color: #e0e7ff; font-weight: 500;">Event: ${info.eventName}</p>`
    : (info.eventTagline ? `<p style="font-size: 13px; margin: 4px 0 0 0; color: #bfdbfe;">${info.eventTagline}</p>` : "");

  return `
    <div style="border: 1px solid #d1d5db; width: 800px; box-sizing: border-box; border-radius: 8px; overflow: hidden;">
      <div style="display: flex;">
        <div style="width: 600px; background-color: white;">
          <table style="width: 100%; background-color: #1e3a8a; border-collapse: collapse;">
            <tr>
              <td style="padding: 16px 20px; vertical-align: middle;">
                <h3 style="font-weight: bold; font-size: 20px; margin: 0; letter-spacing: 0.5px; color: #fff;">${headerTitle}</h3>
                ${headerSubtitle}
              </td>
              <td style="padding: 0 20px; vertical-align: middle; text-align: right; width: 1px;">
                <div style="font-size: 11px; font-weight: 600; letter-spacing: 1px; border: 1px solid rgba(255,255,255,0.4); border-radius: 3px; color: #fff; padding: 6px 10px; white-space: nowrap; display: inline-block; text-align: center;">${badgeLabel}</div>
              </td>
            </tr>
          </table>
          <div style="padding: 16px 20px;">
            <h4 style="font-size: 20px; font-weight: bold; margin: 0 0 4px 0; color: #000;">${ticket.attendeeName}</h4>
            <p style="margin: 0 0 2px 0; color: #374151; font-size: 14px;">${ticket.attendeeEmail}</p>
            ${ticket.attendeePhone ? `<p style="margin: 0; color: #374151; font-size: 14px;">${ticket.attendeePhone}</p>` : ""}
          </div>
          <div style="padding: 0 20px 16px 20px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 8px;">
                  <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 0 0 4px 0;">Ticket Type</p>
                  <p style="font-weight: 500; margin: 0; color: #000">${categoryName}</p>
                </td>
                <td style="width: 50%; vertical-align: top; padding-left: 8px;">
                  <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 0 0 4px 0;">Ticket #</p>
                  <p style="font-weight: 500; font-size: 13px; word-break: break-all; margin: 0; color: #000">${ticket.ticketNumber}</p>
                </td>
              </tr>
            </table>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 8px;">
                  <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 0 0 4px 0;">Valid From</p>
                  <p style="font-weight: 500; margin: 0; color: #000">${validFrom}</p>
                </td>
                <td style="width: 50%; vertical-align: top; padding-left: 8px;">
                  <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 0 0 4px 0;">Valid Until</p>
                  <p style="font-weight: 500; margin: 0; color: #000">${validUntil}</p>
                </td>
              </tr>
            </table>
            ${info.location ? `
            <table style="border-collapse: collapse; margin-top: 14px;">
              <tr>
                <td style="vertical-align: middle; width: 22px; padding: 0;">
                  <span style="font-size: 14px; color: #6b7280;">\u{1F4CD}</span>
                </td>
                <td style="vertical-align: middle; padding: 0;">
                  <span style="font-size: 13px; color: #374151;">${info.location}</span>
                </td>
              </tr>
            </table>` : ""}
            ${sessionTimeSection}
          </div>
        </div>
        <div style="border-left: 2px dashed #d1d5db;"></div>
        <div style="width: 200px; background-color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px;">
          <p style="font-weight: 700; text-align: center; margin: 0 0 12px 0; color: #1e3a8a; font-size: 13px; letter-spacing: 2px;">ADMIT ONE</p>
          <div style="width: 140px; height: 140px; margin: 0 auto 12px auto;">
            <img src="${ticket.qrCodeImage}" alt="Ticket QR Code" style="width: 140px; height: 140px;" />
          </div>
          <p style="font-size: 10px; text-align: center; color: #6b7280; margin: 0 0 6px 0; letter-spacing: 1px;">SCAN TO VERIFY</p>
          <p style="font-size: 12px; text-align: center; font-weight: 600; margin: 0; color: #1e3a8a;">${categoryName}</p>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------
// PDF Generation
// -------------------------------------------------------------------

function getPdfFilename(ticket: Ticket): string {
  const info = getTicketDisplayInfo(ticket);
  const slug = info.eventSlug || "event";
  return `${slug}-Ticket-${ticket.ticketNumber}.pdf`;
}

function getAllPdfFilename(tickets: Ticket[]): string {
  const info = tickets[0] ? getTicketDisplayInfo(tickets[0]) : null;
  const slug = info?.eventSlug || "event";
  return `${slug}-All-Tickets.pdf`;
}

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
  pdfMake.createPdf(docDefinition).download(getPdfFilename(ticket));
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
  pdfMake.createPdf(docDefinition).download(getAllPdfFilename(tickets));
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
