#!/usr/bin/env node

/**
 * Seed script for CFC Education Fair 2026.
 *
 * Creates the complete education fair event via Strapi REST API:
 * - 1 Event (Coins For College Education Fair 2026)
 * - 1 Venue (Virtual Conference Hall)
 * - 5 Speakers with profile images
 * - 8 Sessions with images and speaker relations
 * - 1 Ticket Category (General Admission, free)
 *
 * Usage:
 *   STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=<your-api-token> node scripts/seed-education-fair.mjs
 */

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error(
    "Error: STRAPI_TOKEN environment variable is required.\n" +
      "Create a full-access API token in Strapi Admin > Settings > API Tokens.\n" +
      "Usage: STRAPI_TOKEN=<token> node scripts/seed-education-fair.mjs"
  );
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

const authHeader = { Authorization: `Bearer ${STRAPI_TOKEN}` };

// ── Utility Functions ────────────────────────────────────────────────

async function api(path, method = "GET", body = null) {
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${STRAPI_URL}/api${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function create(collection, data) {
  return api(`/${collection}`, "POST", { data });
}

async function findBySlug(collection, slug) {
  const res = await api(
    `/${collection}?filters[Slug][$eq]=${encodeURIComponent(slug)}`
  );
  return res?.data?.[0] ?? null;
}

function docId(entity) {
  return entity.documentId || entity.id;
}

function blocks(...paragraphs) {
  return paragraphs.map((text) => ({
    type: "paragraph",
    children: [{ type: "text", text }],
  }));
}

/** Convert IST time (hour, minute) on June 15, 2026 to UTC ISO string */
function istToUTC(hour, minute = 0) {
  let utcMinute = minute - 30;
  let utcHour = hour - 5;
  if (utcMinute < 0) {
    utcMinute += 60;
    utcHour -= 1;
  }
  return new Date(Date.UTC(2026, 5, 15, utcHour, utcMinute, 0, 0)).toISOString();
}

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

async function uploadImageFromPicsum(id, width, height, fileName) {
  const imageUrl = `https://picsum.photos/id/${id}/${width}/${height}`;
  console.log(`    Downloading ${fileName}...`);
  const buffer = await downloadImage(imageUrl);
  console.log(`    Uploading ${fileName} (${buffer.length} bytes)...`);
  const uploaded = await uploadFile(buffer, fileName);
  console.log(`    Uploaded: id=${uploaded.id}`);
  return uploaded;
}

// ── Event Data ───────────────────────────────────────────────────────

const eventData = {
  Title: "Coins For College Education Fair 2026",
  Slug: "cfc-education-fair-2026",
  ShortDescription:
    "A free, virtual education fair connecting Indian students with top colleges and scholarship opportunities worldwide. Join us on June 15, 2026.",
  Description: blocks(
    "The Coins For College Education Fair 2026 is India's premier virtual education fair, designed to help students and families navigate the complex world of international college admissions. Whether you're a high school student exploring your options or a parent seeking guidance on funding your child's education abroad, this fair has something for everyone.",
    "Over the course of a single power-packed day, you'll hear from admissions deans, scholarship experts, and education counselors representing universities across the United States, United Kingdom, Australia, Canada, and Europe. Each session is carefully curated to address the most pressing questions Indian students face when applying to colleges abroad.",
    "Our lineup of eight expert-led sessions covers everything from choosing the right university and crafting compelling applications, to understanding visa requirements and planning your finances. Whether your interest lies in engineering, liberal arts, business, or the sciences, you'll gain actionable insights to strengthen your application.",
    "Participating institutions include leading research universities, liberal arts colleges, and specialized STEM programs. Representatives will be available to answer your questions about campus life, admission requirements, available scholarships, and post-graduation career prospects.",
    "The fair is completely free to attend and takes place entirely online, so you can join from the comfort of your home anywhere in India. All you need is a computer or smartphone with an internet connection. Sessions will be conducted in English and are designed to be interactive, with live Q&A segments throughout the day.",
    "Don't miss this opportunity to take the first step toward your dream of studying abroad. Register today and secure your spot at the Coins For College Education Fair 2026!"
  ),
  StartDate: istToUTC(9, 0),
  EndDate: istToUTC(16, 30),
  Location: "Online (Virtual)",
  Category: "expo",
  accessMode: "ticketed",
  isFeatured: true,
  Status: "published",
};

// ── Venue ────────────────────────────────────────────────────────────

const venueData = {
  Name: "Virtual Conference Hall",
  Slug: "virtual-conference-hall",
  City: "Online",
  Country: "India",
  Description: blocks(
    "Our virtual conference hall is powered by cutting-edge livestream technology, allowing you to participate in all sessions from anywhere in the world. Simply log in with your registered account to access keynotes, breakout sessions, and live Q&A — all through your web browser."
  ),
  MainVenue: true,
};

// ── Speakers ─────────────────────────────────────────────────────────

const speakerDefs = [
  {
    Name: "Arjun Mehta",
    Slug: "arjun-mehta",
    Title: "Founder & CEO",
    Organization: "Coins For College",
    ShortBio:
      "Arjun Mehta is the founder of Coins For College, helping thousands of Indian students access international education opportunities.",
    Bio: "Arjun Mehta founded Coins For College with a mission to democratize access to international education for Indian students. With over a decade of experience in education consulting and a background in computer science from IIT Delhi, he has personally guided thousands of students through the college application process. His platform has connected students with over $50 million in scholarships across 20 countries, and he is a frequent speaker at education conferences throughout South Asia.",
    Featured: true,
    SortOrder: 1,
    LinkedIn: "https://linkedin.com/in/example",
    Website: "https://coinsforcollege.org",
    picsumId: 338,
  },
  {
    Name: "Dr. Patricia Holloway",
    Slug: "dr-patricia-holloway",
    Title: "Dean of International Admissions",
    Organization: "Pacific Northwest University",
    ShortBio:
      "Dr. Holloway oversees international admissions at PNU, with a special focus on recruiting talented students from South Asia.",
    Bio: "Dr. Patricia Holloway has served as Dean of International Admissions at Pacific Northwest University for over 15 years, during which time she has tripled the university's international student enrollment. She holds a PhD in Higher Education Administration from Stanford University and has published extensively on cross-cultural admissions practices. Dr. Holloway is passionate about making American higher education accessible to students from diverse backgrounds and regularly travels to India to connect with prospective students.",
    Featured: true,
    SortOrder: 2,
    LinkedIn: "https://linkedin.com/in/example",
    picsumId: 399,
  },
  {
    Name: "Prof. James Richardson",
    Slug: "prof-james-richardson",
    Title: "Professor & International Coordinator",
    Organization: "University of Manchester",
    ShortBio:
      "Prof. Richardson coordinates international student programs and teaches engineering at the University of Manchester.",
    Bio: "Professor James Richardson is a distinguished engineering educator and the International Student Coordinator at the University of Manchester. With a career spanning over 20 years in academia, he has been instrumental in building pathways for international students to pursue STEM degrees in the UK. He has mentored hundreds of Indian students and is known for his hands-on approach to helping students transition to life and study in the United Kingdom. Prof. Richardson is a Fellow of the Royal Academy of Engineering.",
    Featured: true,
    SortOrder: 3,
    LinkedIn: "https://linkedin.com/in/example",
    Twitter: "https://twitter.com/example",
    picsumId: 453,
  },
  {
    Name: "Dr. Meera Iyer",
    Slug: "dr-meera-iyer",
    Title: "Director of Financial Aid",
    Organization: "Global Education Foundation",
    ShortBio:
      "Dr. Iyer leads scholarship and financial aid programs that have funded over 10,000 international students.",
    Bio: "Dr. Meera Iyer is the Director of Financial Aid at the Global Education Foundation, where she oversees scholarship programs totaling over $200 million annually. A graduate of the London School of Economics, she has dedicated her career to making quality education financially accessible for students from developing countries. Her innovative need-based and merit-based scholarship frameworks have been adopted by over 50 institutions worldwide, and she has been recognized by UNESCO for her contributions to educational equity.",
    Featured: true,
    SortOrder: 4,
    LinkedIn: "https://linkedin.com/in/example",
    Website: "https://example.com",
    picsumId: 447,
  },
  {
    Name: "Sarah Chen",
    Slug: "sarah-chen",
    Title: "Head of International Student Services",
    Organization: "University of Melbourne",
    ShortBio:
      "Sarah Chen manages support services for over 15,000 international students at the University of Melbourne.",
    Bio: "Sarah Chen leads the International Student Services division at the University of Melbourne, one of Australia's top-ranked universities. She manages a comprehensive support ecosystem covering everything from visa guidance and housing to career services and cultural integration. With a Master's degree in International Education from Columbia University, Sarah brings a global perspective to student support and has been recognized with the Australian International Education Award for excellence in student services.",
    Featured: false,
    SortOrder: 5,
    picsumId: 349,
  },
];

// ── Sessions ─────────────────────────────────────────────────────────

const sessionDefs = [
  {
    Title: "Opening Keynote: The Future of Global Education",
    Slug: "opening-keynote-future-of-global-education",
    ShortDescription:
      "A visionary address on how global education is evolving and what it means for Indian students aspiring to study abroad.",
    Description: blocks(
      "Join Arjun Mehta, founder of Coins For College, as he delivers the opening keynote for the Education Fair 2026. In this inspiring session, Arjun will explore the rapidly changing landscape of global education and what it means for the next generation of Indian students looking to pursue degrees abroad.",
      "Drawing on his experience helping thousands of students navigate international admissions, Arjun will share insights on emerging trends in global higher education, including the rise of interdisciplinary programs, the growing importance of research experience, and how universities are adapting their admissions processes for a post-pandemic world.",
      "This keynote will also introduce the day's agenda and set the stage for the sessions to follow. Arjun will outline the key themes of the fair — from university selection and scholarship strategies to visa processes and financial planning — giving attendees a roadmap for making the most of every session.",
      "Whether you're just beginning to explore the idea of studying abroad or you're deep into your application process, this keynote will energize and equip you with a fresh perspective on the opportunities that lie ahead."
    ),
    SessionType: "Keynote",
    format: "virtual",
    streamType: "livestream",
    FeaturedSession: true,
    SortOrder: 1,
    startIST: [9, 0],
    endIST: [10, 0],
    speakerSlugs: ["arjun-mehta"],
    picsumId: 24,
  },
  {
    Title: "Studying in the USA: Admissions, Scholarships & Campus Life",
    Slug: "studying-in-usa-admissions-scholarships",
    ShortDescription:
      "Everything Indian students need to know about applying to American universities, securing financial aid, and thriving on campus.",
    Description: blocks(
      "The United States remains the top destination for Indian students seeking higher education abroad, and this session will give you a comprehensive insider's view of the American admissions process. Dr. Patricia Holloway, Dean of International Admissions at Pacific Northwest University, will walk you through what admissions committees actually look for in international applicants.",
      "From standardized test requirements and essay writing tips to extracurricular profiles and letters of recommendation, Dr. Holloway will demystify every aspect of the US college application. She will share real examples of successful applications and common pitfalls that Indian students should avoid.",
      "A significant portion of this session is dedicated to financial aid and scholarships. You'll learn about the different types of aid available — merit-based, need-based, athletic, and departmental scholarships — and get practical advice on how to maximize your chances of receiving funding. Dr. Holloway will also discuss the FAFSA, CSS Profile, and university-specific aid applications.",
      "The session will conclude with a candid look at campus life in the US, including housing, student organizations, cultural adjustment, and career services. Attendees will have the opportunity to ask questions during a live Q&A segment at the end."
    ),
    SessionType: "Keynote",
    format: "virtual",
    streamType: "livestream",
    FeaturedSession: true,
    SortOrder: 2,
    startIST: [10, 15],
    endIST: [11, 15],
    speakerSlugs: ["dr-patricia-holloway"],
    picsumId: 48,
  },
  {
    Title: "Engineering & STEM Pathways: Opportunities in the UK",
    Slug: "engineering-stem-pathways-uk",
    ShortDescription:
      "Explore world-class STEM programs at UK universities and learn how Indian students can build successful engineering careers abroad.",
    Description: blocks(
      "The United Kingdom is home to some of the world's most prestigious engineering and STEM programs, and this session will help you understand how to access them. Prof. James Richardson from the University of Manchester will guide you through the landscape of UK STEM education, from undergraduate to postgraduate opportunities.",
      "Prof. Richardson will cover the UCAS application process, including how it differs from US applications, the importance of predicted grades, and how to write a compelling personal statement for engineering programs. He'll also discuss foundation year programs for students who need to bridge curriculum gaps.",
      "Indian students interested in fields like computer science, electrical engineering, biomedical sciences, and data science will learn about the specific programs and research opportunities available at top UK institutions. Prof. Richardson will highlight the Graduate Route visa, which allows international students to work in the UK for two years after completing their degree.",
      "The session will also address funding options specific to STEM students, including the Chevening Scholarship, Commonwealth Scholarships, and university-specific awards for engineering students. Whether your dream is to study at Manchester, Imperial, or Cambridge, this session will give you the tools to get there."
    ),
    SessionType: "Keynote",
    format: "virtual",
    streamType: "livestream",
    FeaturedSession: true,
    SortOrder: 3,
    startIST: [11, 30],
    endIST: [12, 30],
    speakerSlugs: ["prof-james-richardson"],
    picsumId: 180,
  },
  {
    Title: "Scholarship Application Strategies That Work",
    Slug: "scholarship-application-strategies",
    ShortDescription:
      "Proven strategies for finding, applying to, and winning scholarships for international study.",
    Description: blocks(
      "Scholarships can make the difference between dreaming about studying abroad and actually doing it. In this focused breakout session, Dr. Meera Iyer of the Global Education Foundation will share proven strategies for finding and winning scholarships, based on her experience administering over $200 million in annual financial aid.",
      "Dr. Iyer will walk attendees through the entire scholarship application lifecycle: how to research opportunities, craft compelling essays, gather impactful recommendation letters, and present a strong financial need case. She'll share what selection committees look for and the most common reasons applications get rejected.",
      "Attendees will learn about a wide range of funding sources beyond university aid, including government scholarships like the Fulbright and Chevening programs, private foundation grants, and lesser-known opportunities specifically available to Indian students. Dr. Iyer will also discuss how to combine multiple funding sources to cover the full cost of attendance.",
      "This session is essential for any student or family concerned about the financial aspect of international education. You'll leave with a practical action plan and a curated list of scholarship deadlines to target."
    ),
    SessionType: "Breakout",
    format: "virtual",
    streamType: "livestream",
    FeaturedSession: false,
    SortOrder: 4,
    startIST: [12, 30],
    endIST: [13, 15],
    speakerSlugs: ["dr-meera-iyer"],
    picsumId: 119,
  },
  {
    Title: "Choosing the Right College Abroad",
    Slug: "choosing-the-right-college-abroad",
    ShortDescription:
      "How to evaluate universities, compare programs, and make the best choice for your academic and career goals.",
    Description: blocks(
      "With thousands of universities to choose from across dozens of countries, selecting the right college can feel overwhelming. This breakout session brings together Arjun Mehta and Sarah Chen to help you develop a clear framework for evaluating and comparing universities based on what matters most to you.",
      "You'll learn how to look beyond rankings and consider factors like program quality, research opportunities, campus culture, location, career outcomes, and return on investment. Arjun and Sarah will share practical tools and checklists that students can use to narrow down their options from hundreds to a focused shortlist.",
      "The session will feature real case studies of Indian students who navigated this decision successfully, including students who chose lesser-known universities that turned out to be perfect fits. You'll hear about the importance of campus visits (virtual and in-person), connecting with current students and alumni, and leveraging your network to gather authentic information.",
      "Whether you're torn between the US and the UK, unsure about the difference between a research university and a liberal arts college, or simply don't know where to start, this session will give you the clarity and confidence to make an informed decision."
    ),
    SessionType: "Breakout",
    format: "virtual",
    streamType: "livestream",
    FeaturedSession: false,
    SortOrder: 5,
    startIST: [13, 15],
    endIST: [14, 0],
    speakerSlugs: ["arjun-mehta", "sarah-chen"],
    picsumId: 160,
  },
  {
    Title: "Visa & Immigration Essentials for Student Travelers",
    Slug: "visa-immigration-essentials-students",
    ShortDescription:
      "A practical guide to student visa applications, immigration requirements, and pre-departure preparation.",
    Description: blocks(
      "Securing a student visa is one of the most critical steps in your journey to studying abroad, and this session will ensure you're fully prepared. Sarah Chen, who has guided thousands of international students through immigration processes, will provide a comprehensive overview of student visa requirements for the most popular study destinations.",
      "You'll learn about the specific visa categories for students in the US (F-1), UK (Student visa), Australia (Subclass 500), and Canada (Study Permit), including the documents you need, financial proof requirements, and common interview questions. Sarah will share tips for presenting a strong visa application and avoiding the most frequent reasons for rejection.",
      "Beyond the visa itself, this session covers essential pre-departure preparation including health insurance requirements, accommodation arrangements, banking and currency considerations, and what to expect when you arrive in your host country. Sarah will also discuss work rights for international students and how immigration rules may affect your post-graduation plans.",
      "With visa regulations constantly evolving, this session provides the most current information and practical advice to help you navigate the process with confidence. A live Q&A segment will allow you to ask specific questions about your situation."
    ),
    SessionType: "Breakout",
    format: "virtual",
    streamType: "livestream",
    FeaturedSession: false,
    SortOrder: 6,
    startIST: [14, 15],
    endIST: [15, 0],
    speakerSlugs: ["sarah-chen"],
    picsumId: 225,
  },
  {
    Title: "Financial Planning for International Education",
    Slug: "financial-planning-international-education",
    ShortDescription:
      "A complete guide to budgeting, education loans, and financial strategies for studying abroad from India.",
    Description: blocks(
      "Understanding the true cost of international education and planning your finances accordingly is essential for a successful study abroad experience. In this session, Dr. Meera Iyer and Arjun Mehta team up to provide a comprehensive guide to financial planning for Indian families.",
      "The session begins with a realistic breakdown of costs beyond tuition — including housing, food, transportation, health insurance, books, and personal expenses — for major study destinations. You'll learn how to create a detailed budget and identify ways to reduce costs without compromising your educational experience.",
      "Dr. Iyer will discuss the landscape of education loans available to Indian students, including government-backed loans, private bank loans, and international lending options. She'll explain interest rates, repayment terms, collateral requirements, and how to compare different loan products. Arjun will complement this with insights on currency exchange strategies and managing money across borders.",
      "The session will also cover practical money management tips for students already abroad, including part-time work opportunities, campus employment, and how to build a financial safety net. Attendees will leave with a customizable financial planning template and a clear understanding of the total investment required for their education abroad."
    ),
    SessionType: "Breakout",
    format: "virtual",
    streamType: "livestream",
    FeaturedSession: false,
    SortOrder: 7,
    startIST: [15, 0],
    endIST: [15, 45],
    speakerSlugs: ["dr-meera-iyer", "arjun-mehta"],
    picsumId: 307,
  },
  {
    Title: "Closing Panel: Your Questions Answered",
    Slug: "closing-panel-your-questions-answered",
    ShortDescription:
      "All five speakers come together for a live panel discussion and open Q&A to close out the Education Fair 2026.",
    Description: blocks(
      "The Closing Panel brings together all five of our expert speakers for an open, interactive discussion where you get to ask the questions. This is your chance to get personalized advice from admissions deans, scholarship directors, and education counselors — all in one session.",
      "The panel will begin with each speaker sharing their single most important piece of advice for Indian students aspiring to study abroad. Following these opening statements, the floor will be opened for audience questions submitted through our live Q&A platform. No topic is off-limits — from specific university recommendations to last-minute application tips.",
      "Our moderator will also pose questions submitted by registered attendees in advance, covering the most popular topics from the day's sessions. Expect candid, practical answers that go beyond the prepared presentations and address the real concerns of students and families.",
      "Whether you attended every session or are just joining for the finale, this closing panel is designed to tie everything together and send you off with the clarity, confidence, and motivation to take the next step in your study abroad journey. The panel will conclude with information about follow-up resources and how to stay connected with Coins For College."
    ),
    SessionType: "Panel",
    format: "virtual",
    streamType: "livestream",
    FeaturedSession: true,
    SortOrder: 8,
    startIST: [15, 45],
    endIST: [16, 30],
    speakerSlugs: [
      "arjun-mehta",
      "dr-patricia-holloway",
      "prof-james-richardson",
      "dr-meera-iyer",
      "sarah-chen",
    ],
    picsumId: 367,
  },
];

// ── Ticket Category ──────────────────────────────────────────────────

const ticketCategoryData = {
  name: "General Admission",
  description: blocks(
    "Your free General Admission ticket gives you complete access to all sessions at the Coins For College Education Fair 2026. This includes all keynote presentations, breakout sessions, and the closing panel discussion.",
    "With your registration, you'll receive access to the virtual conference platform, the ability to ask questions during live Q&A segments, and downloadable resources shared by our speakers. You'll also receive session recordings after the event so you can revisit any content you may have missed."
  ),
  price: 0,
  currency: "INR",
  validFrom: "2026-01-01",
  validUntil: "2026-06-15",
  maxPurchaseQuantity: 10,
  isActive: true,
  isFeatured: true,
  sortOrder: 1,
  grantsFullEventAccess: true,
};

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSeeding Education Fair 2026 to ${STRAPI_URL}...\n`);

  // 0. Un-feature other events so the Education Fair becomes the hero
  console.log("0. Un-featuring other events...");
  try {
    const allEvents = await api("/events?filters[isFeatured][$eq]=true&pagination[limit]=50");
    for (const ev of allEvents.data || []) {
      if (ev.Slug !== eventData.Slug) {
        await api(`/events/${docId(ev)}`, "PUT", { data: { isFeatured: false } });
        console.log(`  Un-featured: ${ev.Title}`);
      }
    }
  } catch (err) {
    console.log(`  Warning: could not un-feature other events: ${err.message}`);
  }

  // 1. Create/find event
  console.log("\n1. Event...");
  let event = await findBySlug("events", eventData.Slug);
  if (!event) {
    const res = await create("events", eventData);
    event = res.data;
    console.log(`  Created: ${event.Title} (${docId(event)})`);
  } else {
    console.log(`  Exists: ${event.Title} (${docId(event)})`);
  }

  // Upload event Image + Banner
  try {
    const eventImage = await uploadImageFromPicsum(301, 800, 600, "education-fair-image.jpg");
    const eventBanner = await uploadImageFromPicsum(312, 1200, 400, "education-fair-banner.jpg");
    await api(`/events/${docId(event)}`, "PUT", {
      data: { Image: eventImage.id, Banner: eventBanner.id },
    });
    console.log("  Linked Image + Banner to event");
  } catch (err) {
    console.log(`  Image upload skipped: ${err.message}`);
  }

  // 2. Create/find venue
  console.log("\n2. Venue...");
  let venue = await findBySlug("venues", venueData.Slug);
  if (!venue) {
    const res = await create("venues", venueData);
    venue = res.data;
    console.log(`  Created: ${venue.Name} (${docId(venue)})`);
  } else {
    console.log(`  Exists: ${venue.Name} (${docId(venue)})`);
  }

  // Link venue to event
  await api(`/events/${docId(event)}`, "PUT", {
    data: { venue: docId(venue) },
  });
  console.log("  Linked venue to event");

  // 3. Create/find speakers + upload profile images
  console.log("\n3. Speakers...");
  const speakerMap = {};
  for (const def of speakerDefs) {
    const { picsumId, ...speakerData } = def;
    let speaker = await findBySlug("speakers", def.Slug);
    if (!speaker) {
      const res = await create("speakers", speakerData);
      speaker = res.data;
      console.log(`  Created: ${speaker.Name} (${docId(speaker)})`);
    } else {
      console.log(`  Exists: ${speaker.Name} (${docId(speaker)})`);
    }
    speakerMap[def.Slug] = docId(speaker);

    // Upload profile image
    try {
      const uploaded = await uploadImageFromPicsum(
        picsumId,
        400,
        400,
        `${def.Slug}-profile.jpg`
      );
      await api(`/speakers/${docId(speaker)}`, "PUT", {
        data: { ProfileImage: uploaded.id },
      });
      console.log(`  Linked ProfileImage for ${speaker.Name}`);
    } catch (err) {
      console.log(`  Image skipped for ${def.Name}: ${err.message}`);
    }
  }

  // 4. Create sessions + upload images
  console.log("\n4. Sessions...");
  for (const def of sessionDefs) {
    const { picsumId, startIST, endIST, speakerSlugs, ...rest } = def;

    let session = await findBySlug("sessions", def.Slug);
    if (session) {
      console.log(`  Exists: ${session.Title} (${docId(session)})`);
      continue;
    }

    const sessionData = {
      ...rest,
      StartDate: istToUTC(startIST[0], startIST[1]),
      EndDate: istToUTC(endIST[0], endIST[1]),
      event: docId(event),
      speakers: speakerSlugs.map((slug) => speakerMap[slug]).filter(Boolean),
      venue: docId(venue),
    };

    const res = await create("sessions", sessionData);
    session = res.data;
    console.log(
      `  Created: ${session.Title} (${docId(session)}) — ${def.SessionType}`
    );

    // Upload session image
    try {
      const uploaded = await uploadImageFromPicsum(
        picsumId,
        800,
        450,
        `${def.Slug}-image.jpg`
      );
      await api(`/sessions/${docId(session)}`, "PUT", {
        data: { Image: uploaded.id },
      });
      console.log(`  Linked Image for session`);
    } catch (err) {
      console.log(`  Image skipped: ${err.message}`);
    }
  }

  // 5. Create ticket category + link to event
  console.log("\n5. Ticket Category...");
  // Check if ticket category already exists by name AND linked to this event
  const existingCategories = await api(
    `/ticket-categories?filters[name][$eq]=${encodeURIComponent(ticketCategoryData.name)}&filters[allowedEvents][Slug][$eq]=${eventData.Slug}`
  );
  let ticketCategory = existingCategories?.data?.[0] ?? null;

  if (!ticketCategory) {
    const res = await create("ticket-categories", {
      ...ticketCategoryData,
      allowedEvents: [docId(event)],
    });
    ticketCategory = res.data;
    console.log(`  Created: ${ticketCategory.name} (${docId(ticketCategory)})`);
  } else {
    console.log(`  Exists: ${ticketCategory.name} (${docId(ticketCategory)})`);
    // Update all fields and ensure it's linked to the event
    await api(`/ticket-categories/${docId(ticketCategory)}`, "PUT", {
      data: { ...ticketCategoryData, allowedEvents: [docId(event)] },
    });
    console.log("  Updated and linked to event");
  }

  // ── Summary ──────────────────────────────────────────────────────
  console.log("\n✅ Education Fair 2026 seed complete!\n");
  console.log("Summary:");
  console.log("  Event: Coins For College Education Fair 2026");
  console.log("  Venue: 1 (Virtual Conference Hall)");
  console.log(`  Speakers: ${speakerDefs.length}`);
  console.log(`  Sessions: ${sessionDefs.length}`);
  console.log("  Ticket Categories: 1 (General Admission — Free)");
  console.log(
    `\nVisit ${STRAPI_URL.replace(":1337", ":3000")}/events/cfc-education-fair-2026 to see it!`
  );
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message);
  process.exit(1);
});
