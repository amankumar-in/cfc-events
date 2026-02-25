#!/usr/bin/env node

/**
 * Replaces event images with education-themed Unsplash photos.
 * Usage: STRAPI_TOKEN=<token> node scripts/fix-event-images.mjs
 */

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const authHeader = { Authorization: `Bearer ${STRAPI_TOKEN}` };

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
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const data = await res.json();
  return data[0];
}

async function main() {
  // Graduation caps thrown in air — perfect education hero
  console.log("Downloading education banner (graduation caps)...");
  const bannerBuf = await downloadImage(
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&fit=crop&q=80"
  );
  console.log(`Uploading banner (${bannerBuf.length} bytes)...`);
  const banner = await uploadFile(bannerBuf, "education-fair-banner-v2.jpg");
  console.log(`Banner uploaded: id=${banner.id}`);

  // Students in a university library
  console.log("Downloading education image (university campus)...");
  const imgBuf = await downloadImage(
    "https://images.unsplash.com/photo-1562774053-701939374585?w=800&fit=crop&q=80"
  );
  console.log(`Uploading image (${imgBuf.length} bytes)...`);
  const img = await uploadFile(imgBuf, "education-fair-image-v2.jpg");
  console.log(`Image uploaded: id=${img.id}`);

  // Find event
  const evRes = await fetch(
    `${STRAPI_URL}/api/events?filters[Slug][$eq]=cfc-education-fair-2026`,
    { headers: { ...authHeader, "Content-Type": "application/json" } }
  );
  const evData = await evRes.json();
  const event = evData.data[0];
  const docId = event.documentId || event.id;
  console.log(`Event: ${event.Title} (${docId})`);

  // Link images
  const putRes = await fetch(`${STRAPI_URL}/api/events/${docId}`, {
    method: "PUT",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ data: { Image: img.id, Banner: banner.id } }),
  });
  if (!putRes.ok) {
    const text = await putRes.text();
    throw new Error(`PUT failed: ${putRes.status} - ${text}`);
  }
  console.log("Done! Education-themed images linked to event.");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
