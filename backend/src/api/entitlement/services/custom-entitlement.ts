export default () => ({
  async checkAccess(userId: number, eventId?: string, sessionId?: string) {
    const filters: Record<string, any> = {
      user: { id: userId },
    };

    if (eventId) {
      filters.event = { documentId: eventId };
    }

    if (sessionId) {
      filters.session = { documentId: sessionId };
    }

    const entitlements = await strapi.documents("api::entitlement.entitlement").findMany({
      filters,
      populate: ["event", "session", "ticket"],
    });

    if (entitlements.length > 0) {
      return { hasAccess: true, entitlement: entitlements[0] };
    }

    // If checking session access, also check event-level entitlement
    if (sessionId && !eventId) {
      const session = await strapi.documents("api::session.session").findOne({
        documentId: sessionId,
        populate: ["event"],
      });

      if (session?.event) {
        const eventEntitlements = await strapi.documents("api::entitlement.entitlement").findMany({
          filters: {
            user: { id: userId },
            event: { documentId: session.event.documentId },
          },
          populate: ["event", "session", "ticket"],
        });

        if (eventEntitlements.length > 0) {
          return { hasAccess: true, entitlement: eventEntitlements[0] };
        }
      }
    }

    return { hasAccess: false, entitlement: null };
  },

  async grantEntitlement(
    userId: number,
    eventId: string,
    sessionId?: string,
    source?: string,
    ticketId?: string
  ) {
    // Check for existing entitlement to avoid duplicates
    const filters: Record<string, any> = {
      user: { id: userId },
      event: { documentId: eventId },
    };
    if (sessionId) {
      filters.session = { documentId: sessionId };
    }

    const existing = await strapi.documents("api::entitlement.entitlement").findMany({
      filters,
    });

    if (existing.length > 0) {
      return existing[0];
    }

    const data: Record<string, any> = {
      user: userId,
      event: eventId,
      source: source || "manual_grant",
      grantedAt: new Date().toISOString(),
    };

    if (sessionId) {
      data.session = sessionId;
    }

    if (ticketId) {
      data.ticket = ticketId;
    }

    const entitlement = await strapi.documents("api::entitlement.entitlement").create({
      // @ts-expect-error - data shape is dynamic based on optional fields
      data,
      populate: ["event", "session", "ticket", "user"],
    });

    return entitlement;
  },
});
