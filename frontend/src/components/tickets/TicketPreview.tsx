"use client";

import { ScaleWrapper } from "@/components/ui/ScaleWrapper";
import type { Ticket } from "@/lib/tickets/ticket-utils";
import { getTicketDisplayInfo } from "@/lib/tickets/ticket-utils";

interface TicketPreviewProps {
  ticket: Ticket;
  eventContext?: {
    eventName?: string;
    eventLocation?: string;
    eventStartDate?: string;
    eventEndDate?: string;
  };
}

export function TicketPreview({ ticket, eventContext }: TicketPreviewProps) {
  const rawInfo = getTicketDisplayInfo(ticket);
  const info = {
    ...rawInfo,
    eventName: rawInfo.eventName === "Event" && eventContext?.eventName ? eventContext.eventName : rawInfo.eventName,
    location: rawInfo.location || eventContext?.eventLocation || "",
    startDate: rawInfo.startDate || eventContext?.eventStartDate || "",
    endDate: rawInfo.endDate || eventContext?.eventEndDate || "",
  };
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

  return (
    <ScaleWrapper designWidth={800}>
      <div
        className="border border-gray-300 bg-white dark:bg-white rounded-lg overflow-hidden"
        style={{ width: "800px", boxSizing: "border-box" }}
      >
        <div className="flex">
          {/* Main Ticket Content */}
          <div className="w-3/4 bg-white dark:bg-white">
            {/* Header */}
            <div
              className="py-4 px-5 flex justify-between items-center gap-3"
              style={{ backgroundColor: "#1e3a8a" }}
            >
              <div className="min-w-0">
                <h3
                  className="font-bold text-xl m-0 truncate"
                  style={{ color: "#ffffff", letterSpacing: "0.5px" }}
                >
                  {info.isSessionTicket ? info.sessionName : info.eventName}
                </h3>
                {info.isSessionTicket && (
                  <p
                    className="text-sm m-0 mt-1 font-medium truncate"
                    style={{ color: "#e0e7ff" }}
                  >
                    Event: {info.eventName}
                  </p>
                )}
                {info.eventTagline && !info.isSessionTicket && (
                  <p
                    className="text-xs m-0 mt-1 truncate"
                    style={{ color: "#bfdbfe" }}
                  >
                    {info.eventTagline}
                  </p>
                )}
              </div>
              <div className="shrink-0">
                <span
                  className="font-semibold px-2 py-1 rounded-sm whitespace-nowrap"
                  style={{
                    color: "#ffffff",
                    letterSpacing: "0.5px",
                    border: "1px solid rgba(255,255,255,0.4)",
                    fontSize: "10px",
                  }}
                >
                  {badgeLabel}
                </span>
              </div>
            </div>

            {/* Attendee Info */}
            <div className="px-5 pt-4 pb-1">
              <h4 className="text-xl font-bold m-0 text-black dark:text-black">
                {ticket.attendeeName}
              </h4>
              <p className="m-0 mt-0.5 text-sm" style={{ color: "#374151" }}>
                {ticket.attendeeEmail}
              </p>
              {ticket.attendeePhone && (
                <p className="m-0 text-sm" style={{ color: "#374151" }}>
                  {ticket.attendeePhone}
                </p>
              )}
            </div>

            {/* Info Grid */}
            <div className="px-5 pb-4 pt-3">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p
                    className="text-xs uppercase m-0 mb-1"
                    style={{ color: "#6b7280", letterSpacing: "0.5px", fontSize: "11px" }}
                  >
                    Ticket Type
                  </p>
                  <p className="font-medium m-0 text-black dark:text-black">
                    {categoryName}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs uppercase m-0 mb-1"
                    style={{ color: "#6b7280", letterSpacing: "0.5px", fontSize: "11px" }}
                  >
                    Ticket #
                  </p>
                  <p className="font-medium text-sm break-all m-0 text-black dark:text-black">
                    {ticket.ticketNumber}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p
                    className="text-xs uppercase m-0 mb-1"
                    style={{ color: "#6b7280", letterSpacing: "0.5px", fontSize: "11px" }}
                  >
                    Valid From
                  </p>
                  <p className="font-medium m-0 text-black dark:text-black">
                    {validFrom}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs uppercase m-0 mb-1"
                    style={{ color: "#6b7280", letterSpacing: "0.5px", fontSize: "11px" }}
                  >
                    Valid Until
                  </p>
                  <p className="font-medium m-0 text-black dark:text-black">
                    {validUntil}
                  </p>
                </div>
              </div>

              {/* Session Time */}
              {info.isSessionTicket && info.sessionStartDate && (
                <div className="mt-3">
                  <p
                    className="text-xs uppercase m-0 mb-1"
                    style={{ color: "#6b7280", letterSpacing: "0.5px", fontSize: "11px" }}
                  >
                    Session Time{info.sessionType ? ` \u2014 ${info.sessionType}` : ""}
                  </p>
                  <p className="font-medium m-0 text-black dark:text-black">
                    {new Date(info.sessionStartDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    {new Date(info.sessionStartDate).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {info.sessionEndDate &&
                      ` \u2013 ${new Date(info.sessionEndDate).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`}
                  </p>
                </div>
              )}

              {/* Location */}
              {info.location && (
                <div className="flex items-center mt-3.5">
                  <svg
                    className="mr-2"
                    style={{ height: "14px", width: "14px", minWidth: "14px", color: "#6b7280" }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="text-xs" style={{ color: "#374151" }}>
                    {info.location}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Dashed divider */}
          <div style={{ borderLeft: "2px dashed #d1d5db" }}></div>

          {/* QR Code Section */}
          <div
            className="w-1/4 flex flex-col items-center justify-center p-4"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <p
              className="font-bold text-center mb-3"
              style={{ color: "#1e3a8a", fontSize: "13px", letterSpacing: "2px" }}
            >
              ADMIT ONE
            </p>
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
            <p
              className="text-center mb-1.5"
              style={{ fontSize: "10px", color: "#6b7280", letterSpacing: "1px" }}
            >
              SCAN TO VERIFY
            </p>
            <p
              className="text-center font-semibold"
              style={{ fontSize: "12px", color: "#1e3a8a" }}
            >
              {categoryName}
            </p>
          </div>
        </div>
      </div>
    </ScaleWrapper>
  );
}
