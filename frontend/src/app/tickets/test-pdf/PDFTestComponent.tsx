"use client";

import { useState, useEffect } from "react";
import { generateQRCodeDataURL } from "@/lib/qrcode";

export default function PDFTestComponent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfMakeLoaded, setPdfMakeLoaded] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

  // Load pdfmake dynamically on client side only
  useEffect(() => {
    // Generate QR code
    const generateQR = async () => {
      try {
        const qrContent = JSON.stringify({
          ticketNumber: "TIX-12345-6789",
          event: "CFC Events",
        });
        const qrCodeDataUrl = await generateQRCodeDataURL(qrContent);
        setQrCodeImage(qrCodeDataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQR();

    // Only import pdfmake in the browser
    import("pdfmake/build/pdfmake").then((pdfMakeModule) => {
      const pdfMake = pdfMakeModule.default || pdfMakeModule;

      // Import fonts
      import("pdfmake/build/vfs_fonts").then((pdfFontsModule) => {
        const pdfFonts = pdfFontsModule.default || pdfFontsModule;
        pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;
        setPdfMakeLoaded(true);
      });
    });
  }, []);

  const generateTestPDF = async () => {
    try {
      setIsGenerating(true);

      // Dynamically import pdfmake again to ensure it's available in this scope
      const pdfMakeModule = await import("pdfmake/build/pdfmake");
      const pdfMake = pdfMakeModule.default || pdfMakeModule;

      // Sample ticket data
      const ticketData = {
        ticketNumber: "TIX-12345-6789",
        eventName: "CFC EVENTS",
        eventTagline: "Uganda Next Investment & Trade Expo",
        attendeeName: "John Doe",
        attendeeEmail: "john.doe@example.com",
        attendeePhone: "+256 123 456 789",
        ticketCategory: "Business Pass",
        validFrom: "May 15, 2025",
        validUntil: "May 17, 2025",
        price: "50,000 UGX",
        eventLocation: "Kampala International Convention Centre, Uganda",
      };

      // Define the document definition
      const docDefinition = {
        pageSize: { width: 600, height: 280 }, // Custom ticket size (landscape)
        pageMargins: [0, 0, 0, 0],
        content: [
          {
            columns: [
              // Main content (left + middle)
              {
                width: "*",
                stack: [
                  // Header background
                  {
                    canvas: [
                      {
                        type: "rect",
                        x: 0,
                        y: 0,
                        w: 430,
                        h: 60,
                        color: "#1e3a8a", // Dark blue (royal blue)
                      },
                    ],
                    absolutePosition: { x: 0, y: 0 },
                  },

                  // Event name & tagline
                  {
                    text: ticketData.eventName,
                    style: "eventName",
                    absolutePosition: { x: 20, y: 15 },
                  },
                  {
                    text: ticketData.eventTagline,
                    style: "eventTagline",
                    absolutePosition: { x: 20, y: 38 },
                  },

                  // Attendee name and contact info
                  {
                    text: ticketData.attendeeName,
                    style: "attendeeName",
                    absolutePosition: { x: 20, y: 80 },
                  },
                  {
                    text: ticketData.attendeeEmail,
                    style: "attendeeEmail",
                    absolutePosition: { x: 20, y: 100 },
                  },
                  {
                    text: ticketData.attendeePhone,
                    style: "attendeePhone",
                    absolutePosition: { x: 20, y: 115 },
                  },

                  // Ticket info - headers (first row)
                  {
                    text: "TICKET TYPE",
                    style: "labelText",
                    absolutePosition: { x: 20, y: 145 },
                  },
                  {
                    text: "TICKET #",
                    style: "labelText",
                    absolutePosition: { x: 170, y: 145 },
                  },
                  {
                    text: "PRICE",
                    style: "labelText",
                    absolutePosition: { x: 320, y: 145 },
                  },

                  // Ticket info - values (first row)
                  {
                    text: ticketData.ticketCategory,
                    style: "valueText",
                    absolutePosition: { x: 20, y: 160 },
                  },
                  {
                    text: ticketData.ticketNumber,
                    style: "valueText",
                    absolutePosition: { x: 170, y: 160 },
                  },
                  {
                    text: ticketData.price,
                    style: "valueText",
                    absolutePosition: { x: 320, y: 160 },
                  },

                  // Ticket info - headers (second row)
                  {
                    text: "VALID FROM",
                    style: "labelText",
                    absolutePosition: { x: 20, y: 190 },
                  },
                  {
                    text: "VALID UNTIL",
                    style: "labelText",
                    absolutePosition: { x: 170, y: 190 },
                  },
                  {
                    text: "STATUS",
                    style: "labelText",
                    absolutePosition: { x: 320, y: 190 },
                  },

                  // Ticket info - values (second row)
                  {
                    text: ticketData.validFrom,
                    style: "valueText",
                    absolutePosition: { x: 20, y: 205 },
                  },
                  {
                    text: ticketData.validUntil,
                    style: "valueText",
                    absolutePosition: { x: 170, y: 205 },
                  },
                  {
                    text: "NOT CHECKED IN",
                    style: "statusText",
                    absolutePosition: { x: 320, y: 205 },
                  },

                  // Location info with icon
                  {
                    columns: [
                      {
                        width: 15,
                        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#666"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
                      },
                      {
                        width: "auto",
                        text: ticketData.eventLocation,
                        style: "locationText",
                      },
                    ],
                    absolutePosition: { x: 20, y: 235 },
                  },

                  // Terms text
                  {
                    text: "Present this ticket at the entrance. Ticket is non-transferable and non-refundable.",
                    style: "termsText",
                    absolutePosition: { x: 20, y: 255 },
                  },

                  // Dotted line separator
                  {
                    canvas: [
                      {
                        type: "line",
                        x1: 430,
                        y1: 0,
                        x2: 430,
                        y2: 280,
                        dash: { length: 2, space: 2 },
                        lineWidth: 1,
                        lineColor: "#aaaaaa",
                      },
                    ],
                  },
                ],
              },

              // QR code section (right side)
              {
                width: 170,
                stack: [
                  // QR background
                  {
                    canvas: [
                      {
                        type: "rect",
                        x: 0,
                        y: 0,
                        w: 170,
                        h: 280,
                        color: "#f8f8f8", // Light gray background
                      },
                    ],
                    absolutePosition: { x: 430, y: 0 },
                  },

                  // Admit one text
                  {
                    text: "ADMIT ONE",
                    style: "admitText",
                    absolutePosition: { x: 480, y: 30 },
                  },

                  // QR code
                  {
                    image: qrCodeImage || "",
                    width: 130,
                    height: 130,
                    absolutePosition: { x: 450, y: 70 },
                  },

                  // Scan text
                  {
                    text: "SCAN TO VERIFY",
                    style: "scanText",
                    absolutePosition: { x: 470, y: 210 },
                  },

                  // Event name at bottom of QR section
                  {
                    text: "CFC EVENTS",
                    style: "qrEventName",
                    absolutePosition: { x: 465, y: 230 },
                  },
                ],
              },
            ],
          },
        ],
        styles: {
          eventName: {
            fontSize: 20,
            bold: true,
            color: "white",
          },
          eventTagline: {
            fontSize: 12,
            color: "#cccccc",
          },
          attendeeName: {
            fontSize: 18,
            bold: true,
            color: "#333333",
          },
          attendeeEmail: {
            fontSize: 12,
            color: "#666666",
          },
          attendeePhone: {
            fontSize: 12,
            color: "#666666",
          },
          labelText: {
            fontSize: 10,
            color: "#888888",
            bold: false,
          },
          valueText: {
            fontSize: 13,
            color: "#333333",
            bold: false,
          },
          statusText: {
            fontSize: 13,
            bold: true,
            color: "#2e7d32", // Green color
          },
          locationText: {
            fontSize: 11,
            color: "#666666",
            italics: true,
          },
          termsText: {
            fontSize: 9,
            color: "#999999",
            italics: true,
          },
          admitText: {
            fontSize: 14,
            bold: true,
            color: "#333333",
          },
          scanText: {
            fontSize: 10,
            color: "#666666",
          },
          qrEventName: {
            fontSize: 12,
            bold: true,
            color: "#333333",
          },
        },
      };

      // Generate and download the PDF
      if (qrCodeImage) {
        pdfMake.createPdf(docDefinition).download(`CFC-Events-Ticket.pdf`);
      } else {
        alert("QR code not loaded yet. Please wait and try again.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Ticket Preview</h2>

      {/* Preview of the ticket - Exactly matching what will be in the PDF */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md mb-6 relative">
        <div className="flex">
          {/* Main ticket content */}
          <div className="flex-grow">
            {/* Header with blue background */}
            <div className="bg-blue-900 text-white py-3 px-5">
              <h3 className="font-bold text-xl">CFC EVENTS</h3>
              <p className="text-xs text-gray-300">
                Uganda Next Investment & Trade Expo
              </p>
            </div>

            {/* Ticket content */}
            <div className="p-5">
              <div className="mb-6">
                <h4 className="text-lg font-bold">John Doe</h4>
                <p className="text-sm text-gray-600">john.doe@example.com</p>
                <p className="text-sm text-gray-600">+256 123 456 789</p>
              </div>

              {/* First row of info */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-xs text-gray-500">TICKET TYPE</p>
                  <p className="text-sm">Business Pass</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">TICKET #</p>
                  <p className="text-sm">TIX-12345-6789</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">PRICE</p>
                  <p className="text-sm">50,000 UGX</p>
                </div>
              </div>

              {/* Second row of info */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-xs text-gray-500">VALID FROM</p>
                  <p className="text-sm">May 15, 2025</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">VALID UNTIL</p>
                  <p className="text-sm">May 17, 2025</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">STATUS</p>
                  <p className="text-sm font-bold text-green-700">
                    NOT CHECKED IN
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start mt-4">
                <svg
                  className="h-4 w-4 text-gray-500 mt-0.5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="text-xs text-gray-600 italic">
                  Kampala International Convention Centre, Uganda
                </span>
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-500 italic mt-4">
                Present this ticket at the entrance. Ticket is non-transferable
                and non-refundable.
              </p>
            </div>
          </div>

          {/* Dotted separator line */}
          <div className="w-0 border-l border-dashed border-gray-400"></div>

          {/* QR code section */}
          <div className="w-40 bg-gray-50 p-5 flex flex-col items-center">
            <div className="text-center">
              <p className="font-bold mb-3">ADMIT ONE</p>
              {qrCodeImage ? (
                <img
                  src={qrCodeImage}
                  alt="Ticket QR Code"
                  className="w-32 h-32 mb-3"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center bg-gray-200 animate-pulse mb-3">
                  <span className="text-gray-400 text-xs">Loading...</span>
                </div>
              )}
              <p className="text-xs text-gray-600 mb-2">SCAN TO VERIFY</p>
              <p className="text-xs font-bold">CFC EVENTS</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={generateTestPDF}
        disabled={isGenerating || !pdfMakeLoaded || !qrCodeImage}
        className="w-full py-3 px-4 bg-blue-900 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors"
      >
        {isGenerating
          ? "Generating PDF..."
          : !pdfMakeLoaded
          ? "Loading PDF Library..."
          : !qrCodeImage
          ? "Loading QR Code..."
          : "Download Ticket as PDF"}
      </button>
    </div>
  );
}
