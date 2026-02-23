#!/usr/bin/env node

/**
 * Uploads images to seeded sessions.
 * Usage: STRAPI_TOKEN=<token> node scripts/upload-session-images.mjs
 */

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error("STRAPI_TOKEN required");
  process.exit(1);
}

const authHeader = { Authorization: `Bearer ${STRAPI_TOKEN}` };

// Session slug → picsum photo id (relevant-looking images)
const sessionImages = {
  "opening-keynote-ugandas-digital-future": 180,
  "investment-landscape-east-africa": 260,
  "climate-innovation-for-africa": 28,
  "fintech-revolution-mobile-payments-workshop": 60,
  "digital-health-transformation": 305,
  "blockchain-for-supply-chains": 366,
  "ai-in-africa-from-research-to-impact": 0,
  "fireside-chat-building-pan-african-startup": 433,
  "youth-innovation-showcase": 399,
  "renewable-energy-investment-panel": 447,
  "networking-mixer-investors-meet-founders": 367,
  "closing-ceremony-and-awards": 452,
};

async function downloadImage(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadFile(buffer, fileName) {
  const formData = new FormData();
  const blob = new Blob([buffer], { type: "image/jpeg" });
  formData.append("files", blob, fileName);

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    headers: authHeader,
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} - ${text.substring(0, 200)}`);
  }

  const data = await res.json();
  return data[0];
}

async function updateEntity(collection, documentId, field, fileId) {
  const res = await fetch(`${STRAPI_URL}/api/${collection}/${documentId}`, {
    method: "PUT",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ data: { [field]: fileId } }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update failed: ${res.status} - ${text.substring(0, 200)}`);
  }
  return res.json();
}

async function main() {
  console.log("Uploading session images...\n");

  // Fetch all sessions for the event
  const res = await fetch(
    `${STRAPI_URL}/api/sessions?filters[event][Slug][$eq]=unite-expo-2025&populate[Image]=true&pagination[limit]=50`,
    { headers: authHeader }
  );
  const data = await res.json();
  const sessions = data.data;

  for (const session of sessions) {
    const picsumId = sessionImages[session.Slug];
    if (picsumId === undefined) {
      console.log(`  SKIP: ${session.Title} (no image mapping)`);
      continue;
    }
    if (session.Image) {
      console.log(`  SKIP: ${session.Title} (already has image)`);
      continue;
    }

    try {
      const imageUrl = `https://picsum.photos/id/${picsumId}/800/450`;
      console.log(`  ${session.Title}: downloading...`);
      const buffer = await downloadImage(imageUrl);

      console.log(`  ${session.Title}: uploading (${buffer.length} bytes)...`);
      const uploaded = await uploadFile(buffer, `${session.Slug}-cover.jpg`);

      console.log(`  ${session.Title}: linking file id=${uploaded.id}...`);
      await updateEntity("sessions", session.documentId, "Image", uploaded.id);
      console.log(`  ${session.Title}: DONE`);
    } catch (err) {
      console.log(`  ${session.Title}: ERROR - ${err.message}`);
    }
  }

  console.log("\nAll done!");
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
