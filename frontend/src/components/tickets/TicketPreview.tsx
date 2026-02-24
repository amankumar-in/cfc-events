"use client";

import { ScaleWrapper } from "@/components/ui/ScaleWrapper";
import type { Ticket } from "@/lib/tickets/ticket-utils";

interface TicketPreviewProps {
  ticket: Ticket;
}

export function TicketPreview({ ticket }: TicketPreviewProps) {
  return (
    <ScaleWrapper designWidth={800}>
      <div
        className="border border-gray-300 bg-white dark:bg-white"
        style={{ width: "800px", boxSizing: "border-box" }}
      >
        <div className="flex">
          {/* Main Ticket Content */}
          <div className="w-3/4 bg-white dark:bg-white">
            <div className="bg-blue-600 dark:bg-blue-600 text-white dark:text-white py-3 px-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-2xl m-0">UNITE EXPO 2025</h3>
                <p className="text-xs m-0" style={{ color: "#ffffff" }}>
                  Uganda Next Investment & Trade Expo
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs m-0" style={{ color: "#ffffff" }}>
                  {ticket.ticketCategory?.name || "Single Event Ticket"}
                </p>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-2xl font-bold m-0 text-black dark:text-black">
                {ticket.attendeeName}
              </h4>
              <p className="m-0 text-black dark:text-black">
                {ticket.attendeeEmail}
              </p>
            </div>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase m-0" style={{ color: "#6b7280" }}>
                    Ticket Type
                  </p>
                  <p className="font-medium m-0 text-black dark:text-black">
                    {ticket.ticketCategory?.name || "Single Event Ticket"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase m-0" style={{ color: "#6b7280" }}>
                    Ticket #
                  </p>
                  <p className="font-medium text-sm break-all m-0 text-black dark:text-black">
                    {ticket.ticketNumber}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase m-0" style={{ color: "#6b7280" }}>
                    Valid From
                  </p>
                  <p className="font-medium m-0 text-black dark:text-black">
                    {ticket.ticketCategory?.validFrom
                      ? new Date(ticket.ticketCategory.validFrom).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : "12 April 2025"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase m-0" style={{ color: "#6b7280" }}>
                    Valid Until
                  </p>
                  <p className="font-medium m-0 text-black dark:text-black">
                    {ticket.ticketCategory?.validUntil
                      ? new Date(ticket.ticketCategory.validUntil).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : "30 April 2025"}
                  </p>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <svg
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ color: "#6b7280" }}
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="text-sm text-black dark:text-black">
                  Kampala International Convention Centre, Uganda
                </span>
              </div>
            </div>
          </div>
          <div className="border-l border-gray-300"></div>
          {/* QR Code Section */}
          <div className="w-1/4 bg-gray-50 flex flex-col items-center justify-center p-4">
            <p className="font-bold text-center mb-3 text-black">ADMIT ONE</p>
            <div className="w-full aspect-square mb-3">
              {ticket.qrCodeImage ? (
                <img
                  src={ticket.qrCodeImage}
                  alt="Ticket QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 animate-pulse">
                  <span className="text-gray-400 text-xs">Loading...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-center mb-1 text-black">SCAN TO VERIFY</p>
            <p className="text-xs text-center font-bold text-black">UNITE EXPO 2025</p>
          </div>
        </div>
      </div>
    </ScaleWrapper>
  );
}
