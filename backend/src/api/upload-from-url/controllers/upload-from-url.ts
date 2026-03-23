import fs from "fs";
import os from "os";
import path from "path";

const mimeToExt: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
  "image/tiff": ".tiff",
};

export default {
  async create(ctx) {
    const { url } = ctx.request.body;

    if (!url || typeof url !== "string") {
      return ctx.badRequest("url is required");
    }

    let tmpPath: string | null = null;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return ctx.badRequest(`Failed to fetch image: ${response.status}`);
      }

      const contentType = response.headers.get("content-type")?.split(";")[0].trim() || "";
      if (!contentType.startsWith("image/")) {
        return ctx.badRequest(`URL did not return an image: ${contentType}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // Extract filename from URL, fall back to content-type based name
      const urlPath = new URL(url).pathname;
      let basename = path.basename(urlPath).split("?")[0];
      const ext = mimeToExt[contentType] || path.extname(basename) || ".jpg";

      if (!basename || basename === "/" || !path.extname(basename)) {
        basename = `upload-${Date.now()}${ext}`;
      }

      // Write to temp file
      tmpPath = path.join(os.tmpdir(), `strapi-url-upload-${Date.now()}-${basename}`);
      fs.writeFileSync(tmpPath, buffer);

      const uploaded = await strapi
        .plugin("upload")
        .service("upload")
        .upload({
          data: {},
          files: {
            originalFilename: basename,
            mimetype: contentType,
            size: buffer.length,
            filepath: tmpPath,
          },
        });

      ctx.body = uploaded;
    } catch (error) {
      return ctx.badRequest(`Failed to fetch URL: ${error.message}`);
    } finally {
      if (tmpPath && fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
    }
  },
};
