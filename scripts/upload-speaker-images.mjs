#!/usr/bin/env node

/**
 * Uploads profile images to seeded speakers and logos to sponsors.
 * Step 1: Upload file to Strapi media library
 * Step 2: Link uploaded file to the entity via PUT
 *
 * Usage: STRAPI_TOKEN=<token> node scripts/upload-speaker-images.mjs
 */

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error("STRAPI_TOKEN required");
  process.exit(1);
}

const authHeader = { Authorization: `Bearer ${STRAPI_TOKEN}` };

// Speaker slug → picsum photo id
const speakerImages = {
  "dr-sarah-nakamya": 64,
  "james-okello": 91,
  "prof-amina-wanjiku": 65,
  "david-muwanga": 70,
  "grace-achieng": 26,
  "peter-kiggundu": 78,
  "maria-tumusiime": 25,
  "robert-ssempala": 77,
  "fatima-hassan": 63,
  "daniel-opio": 82,
};

// Sponsor slug → picsum photo id
const sponsorImages = {
  "uganda-development-bank": 119,
  "mtn-uganda": 160,
  "stanbic-bank-uganda": 180,
  "airtel-uganda": 188,
  "uganda-breweries": 225,
  "umeme-limited": 237,
  "safeboda": 247,
  "fenix-international": 250,
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
  // Returns array of uploaded files
  return data[0];
}

async function updateEntity(collection, documentId, field, fileId) {
  const res = await fetch(`${STRAPI_URL}/api/${collection}/${documentId}`, {
    method: "PUT",
    headers: {
      ...authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { [field]: fileId } }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update failed: ${res.status} - ${text.substring(0, 200)}`);
  }
  return res.json();
}

async function findBySlug(collection, slug, populateField) {
  const res = await fetch(
    `${STRAPI_URL}/api/${collection}?filters[Slug][$eq]=${encodeURIComponent(slug)}&populate=${populateField}`,
    { headers: authHeader }
  );
  const d = await res.json();
  return d?.data?.[0] ?? null;
}

async function main() {
  console.log("Uploading speaker profile images...\n");

  for (const [slug, picsumId] of Object.entries(speakerImages)) {
    const speaker = await findBySlug("speakers", slug, "ProfileImage");
    if (!speaker) {
      console.log(`  SKIP: ${slug} not found`);
      continue;
    }
    if (speaker.ProfileImage) {
      console.log(`  SKIP: ${speaker.Name} already has image`);
      continue;
    }

    try {
      const imageUrl = `https://picsum.photos/id/${picsumId}/400/400`;
      console.log(`  ${speaker.Name}: downloading...`);
      const buffer = await downloadImage(imageUrl);

      console.log(`  ${speaker.Name}: uploading (${buffer.length} bytes)...`);
      const uploaded = await uploadFile(buffer, `${slug}-profile.jpg`);

      console.log(`  ${speaker.Name}: linking file id=${uploaded.id}...`);
      await updateEntity("speakers", speaker.documentId, "ProfileImage", uploaded.id);
      console.log(`  ${speaker.Name}: DONE`);
    } catch (err) {
      console.log(`  ${speaker.Name}: ERROR - ${err.message}`);
    }
  }

  console.log("\nUploading sponsor logos...\n");

  for (const [slug, picsumId] of Object.entries(sponsorImages)) {
    const sponsor = await findBySlug("sponsors", slug, "Logo");
    if (!sponsor) {
      console.log(`  SKIP: ${slug} not found`);
      continue;
    }
    if (sponsor.Logo) {
      console.log(`  SKIP: ${sponsor.Name} already has logo`);
      continue;
    }

    try {
      const imageUrl = `https://picsum.photos/id/${picsumId}/200/200`;
      console.log(`  ${sponsor.Name}: downloading...`);
      const buffer = await downloadImage(imageUrl);

      console.log(`  ${sponsor.Name}: uploading (${buffer.length} bytes)...`);
      const uploaded = await uploadFile(buffer, `${slug}-logo.jpg`);

      console.log(`  ${sponsor.Name}: linking file id=${uploaded.id}...`);
      await updateEntity("sponsors", sponsor.documentId, "Logo", uploaded.id);
      console.log(`  ${sponsor.Name}: DONE`);
    } catch (err) {
      console.log(`  ${sponsor.Name}: ERROR - ${err.message}`);
    }
  }

  console.log("\nAll done!");
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
