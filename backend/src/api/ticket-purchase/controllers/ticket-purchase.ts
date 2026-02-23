import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::ticket-purchase.ticket-purchase",
  ({ strapi }) => ({
    async updateByReference(ctx) {
      try {
        const { referenceNumber } = ctx.params;
        const { data } = ctx.request.body;

        if (!referenceNumber) {
          return ctx.badRequest("Reference number is required");
        }

        if (!data) {
          return ctx.badRequest("Request body should contain a data object");
        }

        const entities = await strapi.documents("api::ticket-purchase.ticket-purchase").findMany({
          filters: { referenceNumber },
        });

        if (!entities || entities.length === 0) {
          return ctx.notFound(
            `No ticket purchase found with reference number: ${referenceNumber}`
          );
        }

        if (entities.length > 1) {
          return ctx.badRequest(
            `Multiple ticket purchases found with reference number: ${referenceNumber}`
          );
        }

        const entity = entities[0];

        const updatedEntity = await strapi.documents("api::ticket-purchase.ticket-purchase").update({
          documentId: entity.documentId,
          data,
          status: "published",
        });

        return this.transformResponse(updatedEntity);
      } catch (error) {
        strapi.log.error("Error updating ticket purchase by reference:", error);
        return ctx.internalServerError(
          `Internal Server Error: ${error.message}`
        );
      }
    },
  })
);
