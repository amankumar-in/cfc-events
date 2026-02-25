export default {
  async afterUpdate(event) {
    const { result, params } = event;
    const format = result.format;
    const isVirtualOrHybrid = format === "virtual" || format === "hybrid";
    const isPublished = !!result.publishedAt;

    // --- Auto-create room ---
    // When a virtual/hybrid session is published and has no room, create one.
    // This covers: first publish, format changed to virtual/hybrid, admin
    // cleared room fields to trigger re-creation.
    if (isVirtualOrHybrid && isPublished && !result.dailyRoomName) {
      try {
        strapi.log.info(
          `Auto-creating Daily.co room for session "${result.Title}" (${result.documentId})`
        );
        await strapi
          .service("api::daily.daily")
          .createRoom(result.documentId);
      } catch (err) {
        strapi.log.error(
          `Failed to auto-create Daily room for session ${result.documentId}:`,
          err
        );
      }
      return;
    }

    // --- Cleanup room when format changed to in-person ---
    // If session was changed to in-person but still has a room, delete it.
    if (format === "in-person" && result.dailyRoomName) {
      try {
        strapi.log.info(
          `Deleting Daily.co room for in-person session "${result.Title}" (${result.dailyRoomName})`
        );
        await strapi
          .service("api::daily.daily")
          .deleteRoom(result.dailyRoomName);
      } catch (err) {
        strapi.log.error(
          `Failed to delete Daily room ${result.dailyRoomName}:`,
          err
        );
      }
    }
  },
};
