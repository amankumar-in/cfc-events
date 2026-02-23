#!/usr/bin/env node

/**
 * Seed script for CFC Events platform.
 *
 * Creates rich test data via Strapi REST API:
 * - 3 Venues
 * - 10 Speakers
 * - 8 Sponsors (2 Platinum, 3 Gold, 3 Silver)
 * - 12 Sessions (spanning 3 days, varied types/formats)
 * - 12 FAQs across 4 categories
 * - Connects everything to the UNITE Expo 2025 event
 *
 * Usage:
 *   STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=<your-api-token> node scripts/seed-data.mjs
 */

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error(
    "Error: STRAPI_TOKEN environment variable is required.\n" +
      "Create a full-access API token in Strapi Admin > Settings > API Tokens.\n" +
      "Usage: STRAPI_TOKEN=<token> node scripts/seed-data.mjs"
  );
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

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

// ── Helpers ──────────────────────────────────────────────────────────

function blocks(text) {
  return [
    {
      type: "paragraph",
      children: [{ type: "text", text }],
    },
  ];
}

// ── Venues ──────────────────────────────────────────────────────────

const venues = [
  {
    Name: "Kampala International Conference Centre",
    Slug: "kampala-international-conference-centre",
    Address: "Plot 1 Nile Avenue",
    City: "Kampala",
    Country: "Uganda",
    Description: blocks(
      "The premier conference venue in Kampala, featuring state-of-the-art facilities for international events. Located in the heart of the city with easy access to major hotels and attractions."
    ),
    MapEmbedURL:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7576!2d32.5825!3d0.3136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMMKwMTgnNDkuMCJOIDMywrAzNCc1Ny4wIkU!5e0!3m2!1sen!2sug!4v1",
    MainVenue: true,
    Phone: "+256 414 259 795",
    Email: "info@kicc.go.ug",
    Website: "https://kicc.go.ug",
  },
  {
    Name: "Innovation Hub Kampala",
    Slug: "innovation-hub-kampala",
    Address: "Plot 42 Industrial Area, Luzira",
    City: "Kampala",
    Country: "Uganda",
    Description: blocks(
      "A modern co-working and workshop space designed for hands-on learning sessions and collaborative breakout groups. Equipped with high-speed internet and flexible room configurations."
    ),
    MainVenue: false,
    Phone: "+256 700 123 456",
    Email: "hello@innovationhub.ug",
  },
  {
    Name: "Virtual Session Room",
    Slug: "virtual-session-room",
    City: "Online",
    Country: "Uganda",
    Description: blocks(
      "Our virtual venue powered by Daily.co for seamless online participation. Join from anywhere in the world with just a browser."
    ),
    MainVenue: false,
  },
];

// ── Speakers ────────────────────────────────────────────────────────

const speakers = [
  {
    Name: "Dr. Sarah Nakamya",
    Slug: "dr-sarah-nakamya",
    Title: "Chief Innovation Officer",
    Organization: "Uganda Technology Fund",
    ShortBio:
      "Dr. Nakamya leads Uganda's national innovation strategy and has championed digital transformation across public services.",
    Bio: "Dr. Sarah Nakamya is a globally recognized leader in technology policy and digital innovation. With over 15 years of experience driving national-level technology initiatives, she has been instrumental in shaping Uganda's digital landscape. She holds a PhD from MIT in Computer Science and has previously worked at the World Bank and Google.",
    Featured: true,
    SortOrder: 1,
    LinkedIn: "https://linkedin.com/in/example",
    Twitter: "https://twitter.com/example",
    Website: "https://example.com",
  },
  {
    Name: "James Okello",
    Slug: "james-okello",
    Title: "Venture Capital Partner",
    Organization: "East Africa Ventures",
    ShortBio:
      "James has funded over 50 startups across East Africa, with a portfolio valued at over $200M.",
    Bio: "James Okello is a leading venture capitalist in East Africa with a keen eye for transformative startups. His portfolio spans fintech, agritech, healthtech, and climate technology. He is passionate about unlocking Africa's potential through strategic investment.",
    Featured: true,
    SortOrder: 2,
    LinkedIn: "https://linkedin.com/in/example",
  },
  {
    Name: "Prof. Amina Wanjiku",
    Slug: "prof-amina-wanjiku",
    Title: "Professor of Sustainable Development",
    Organization: "Makerere University",
    ShortBio:
      "An award-winning researcher focused on climate adaptation and sustainable agriculture in sub-Saharan Africa.",
    Bio: "Professor Amina Wanjiku is a renowned academic and researcher whose work spans climate science, agriculture, and sustainable development. She has published over 100 papers and advises multiple international organizations.",
    Featured: true,
    SortOrder: 3,
    Twitter: "https://twitter.com/example",
  },
  {
    Name: "David Muwanga",
    Slug: "david-muwanga",
    Title: "CEO",
    Organization: "PayGo Africa",
    ShortBio:
      "David built PayGo from a startup to a continent-wide mobile payments platform serving 5 million users.",
    Bio: "David Muwanga is a serial entrepreneur who has built multiple successful fintech companies across Africa. His current venture, PayGo Africa, processes millions of transactions daily and has revolutionized mobile payments in the region.",
    Featured: false,
    SortOrder: 4,
    LinkedIn: "https://linkedin.com/in/example",
    Website: "https://example.com",
  },
  {
    Name: "Grace Achieng",
    Slug: "grace-achieng",
    Title: "Director of Digital Health",
    Organization: "WHO Africa Region",
    ShortBio:
      "Grace is driving the adoption of digital health solutions across 47 African countries.",
    Bio: "Grace Achieng leads digital health initiatives across the African region for the World Health Organization. Her work has improved healthcare delivery for millions through telemedicine, electronic health records, and AI-powered diagnostics.",
    Featured: false,
    SortOrder: 5,
  },
  {
    Name: "Peter Kiggundu",
    Slug: "peter-kiggundu",
    Title: "Blockchain Architect",
    Organization: "ChainTech Labs",
    ShortBio:
      "Peter specializes in blockchain solutions for supply chain transparency and financial inclusion.",
    Bio: "Peter Kiggundu is a pioneering blockchain developer focused on applying distributed ledger technology to real-world challenges in Africa. He has built decentralized platforms for agricultural supply chains and cross-border payments.",
    Featured: false,
    SortOrder: 6,
    LinkedIn: "https://linkedin.com/in/example",
  },
  {
    Name: "Maria Tumusiime",
    Slug: "maria-tumusiime",
    Title: "Head of AI Research",
    Organization: "Makerere AI Lab",
    ShortBio:
      "Maria leads East Africa's foremost AI research lab, focused on practical AI for development.",
    Bio: "Maria Tumusiime is a leading AI researcher whose lab develops machine learning solutions for African challenges including crop disease detection, natural language processing for local languages, and predictive analytics for public health.",
    Featured: false,
    SortOrder: 7,
    Website: "https://example.com",
  },
  {
    Name: "Robert Ssempala",
    Slug: "robert-ssempala",
    Title: "Managing Director",
    Organization: "Uganda Investment Authority",
    ShortBio:
      "Robert leads efforts to attract and facilitate foreign direct investment into Uganda.",
    Bio: "Robert Ssempala has been at the forefront of Uganda's investment promotion strategy for over a decade. Under his leadership, foreign direct investment into Uganda has increased by 40%.",
    Featured: true,
    SortOrder: 8,
    LinkedIn: "https://linkedin.com/in/example",
  },
  {
    Name: "Fatima Hassan",
    Slug: "fatima-hassan",
    Title: "Climate Tech Entrepreneur",
    Organization: "GreenSol Energy",
    ShortBio:
      "Fatima founded GreenSol, providing affordable solar solutions to over 100,000 off-grid households.",
    Bio: "Fatima Hassan is a passionate climate tech entrepreneur who believes in the power of renewable energy to transform lives. Her company, GreenSol Energy, has deployed solar solutions across rural Uganda, Tanzania, and Kenya.",
    Featured: false,
    SortOrder: 9,
    Twitter: "https://twitter.com/example",
  },
  {
    Name: "Daniel Opio",
    Slug: "daniel-opio",
    Title: "Youth Innovation Lead",
    Organization: "UNICEF Uganda",
    ShortBio:
      "Daniel empowers young innovators across Uganda through mentorship and funding programs.",
    Bio: "Daniel Opio leads UNICEF Uganda's youth innovation programs, supporting young entrepreneurs and tech innovators through mentorship, training, and seed funding. He has helped launch over 200 youth-led ventures.",
    Featured: false,
    SortOrder: 10,
  },
];

// ── Sponsors ────────────────────────────────────────────────────────

const sponsors = [
  {
    Name: "Uganda Development Bank",
    Slug: "uganda-development-bank",
    Tier: "Platinum",
    Description:
      "Uganda's premier development finance institution supporting economic growth.",
    Website: "https://udbl.co.ug",
  },
  {
    Name: "MTN Uganda",
    Slug: "mtn-uganda",
    Tier: "Platinum",
    Description:
      "Leading telecommunications provider connecting millions across Uganda.",
    Website: "https://mtn.co.ug",
  },
  {
    Name: "Stanbic Bank Uganda",
    Slug: "stanbic-bank-uganda",
    Tier: "Gold",
    Description:
      "Full-service financial institution driving trade and investment.",
    Website: "https://stanbicbank.co.ug",
  },
  {
    Name: "Airtel Uganda",
    Slug: "airtel-uganda",
    Tier: "Gold",
    Description:
      "Major telecommunications and mobile money provider in Uganda.",
    Website: "https://airtel.co.ug",
  },
  {
    Name: "Uganda Breweries",
    Slug: "uganda-breweries",
    Tier: "Gold",
    Description:
      "A leading beverage company and proud supporter of Ugandan innovation.",
    Website: "https://ugandabreweries.com",
  },
  {
    Name: "Umeme Limited",
    Slug: "umeme-limited",
    Tier: "Silver",
    Description:
      "Uganda's largest electricity distribution company powering growth.",
    Website: "https://umeme.co.ug",
  },
  {
    Name: "SafeBoda",
    Slug: "safeboda",
    Tier: "Silver",
    Description:
      "Homegrown ride-hailing platform and super app revolutionizing urban transport.",
    Website: "https://safeboda.com",
  },
  {
    Name: "Fenix International",
    Slug: "fenix-international",
    Tier: "Silver",
    Description:
      "Pay-as-you-go solar energy provider empowering off-grid communities.",
    Website: "https://fenixintl.com",
  },
];

// ── FAQ Categories ──────────────────────────────────────────────────

const faqCategories = [
  { Name: "General", identifier: "general" },
  { Name: "Registration & Tickets", identifier: "registration-tickets" },
  { Name: "Virtual Attendance", identifier: "virtual-attendance" },
  { Name: "Venue & Logistics", identifier: "venue-logistics" },
];

// ── FAQs ────────────────────────────────────────────────────────────

const faqs = [
  {
    Question: "What is UNITE Expo 2025?",
    Answer:
      "UNITE Expo 2025 is Uganda's largest international trade and investment exposition, bringing together innovators, investors, and policymakers from over 50 countries to explore opportunities in Uganda's growing economy.",
    category: "General",
  },
  {
    Question: "When does the event take place?",
    Answer:
      "The event runs from July 7-14, 2025, with sessions scheduled across all 7 days. Check the Sessions page for the detailed schedule.",
    category: "General",
  },
  {
    Question: "Who should attend this event?",
    Answer:
      "The expo welcomes entrepreneurs, investors, government officials, researchers, students, and anyone interested in Uganda's innovation and investment landscape.",
    category: "General",
  },
  {
    Question: "How do I register for the event?",
    Answer:
      "You can register by visiting the Tickets page and selecting your preferred access level. Early bird tickets are available at a discounted rate.",
    category: "Registration & Tickets",
  },
  {
    Question: "What ticket types are available?",
    Answer:
      "We offer Standard Access (general sessions), Premium Access (all sessions + workshops), and VIP Access (everything + exclusive networking events). Group discounts are available for teams of 5 or more.",
    category: "Registration & Tickets",
  },
  {
    Question: "Can I get a refund on my ticket?",
    Answer:
      "Full refunds are available up to 14 days before the event. Partial refunds (50%) are available up to 7 days before. Please contact us through the Contact page for refund requests.",
    category: "Registration & Tickets",
  },
  {
    Question: "Can I attend sessions virtually?",
    Answer:
      "Yes! Virtual and hybrid sessions can be attended online through our platform. Simply log in with your registered account during the session's scheduled time.",
    category: "Virtual Attendance",
  },
  {
    Question: "How do I access virtual sessions?",
    Answer:
      "After registering and signing in, navigate to the session page. When a virtual session is live, a 'Join' button will appear. No additional software is needed — everything runs in your browser.",
    category: "Virtual Attendance",
  },
  {
    Question: "Are sessions recorded?",
    Answer:
      "Most virtual and hybrid sessions are recorded and available for replay within 24 hours after the session ends. In-person-only sessions are not recorded.",
    category: "Virtual Attendance",
  },
  {
    Question: "Where is the main venue?",
    Answer:
      "The main venue is the Kampala International Conference Centre, located on Plot 1 Nile Avenue in central Kampala. It is easily accessible from all major hotels and the airport.",
    category: "Venue & Logistics",
  },
  {
    Question: "Is there parking available?",
    Answer:
      "Yes, the venue offers paid parking. We also recommend using ride-hailing services like SafeBoda for convenient transport to and from the venue.",
    category: "Venue & Logistics",
  },
  {
    Question: "Will there be food and refreshments?",
    Answer:
      "Light refreshments and coffee are provided during breaks. Full catering is available for VIP ticket holders. Several restaurants and cafes are within walking distance of the venue.",
    category: "Venue & Logistics",
  },
];

// ── Sessions ────────────────────────────────────────────────────────

// Day offsets from event start (July 7, 2025)
const baseDate = new Date("2025-07-07T00:00:00.000Z");

function sessionDate(dayOffset, hour, minute = 0) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// Sessions reference speakers and venues by index
const sessionDefs = [
  {
    Title: "Opening Keynote: Uganda's Digital Future",
    Slug: "opening-keynote-ugandas-digital-future",
    ShortDescription:
      "A visionary address on how digital transformation is reshaping Uganda's economic landscape.",
    Description: blocks(
      "Join Dr. Sarah Nakamya as she delivers the opening keynote, painting a compelling vision of Uganda's digital future. Learn about the national strategy for technology adoption, the role of AI and blockchain, and the opportunities awaiting innovators and investors."
    ),
    SessionType: "Keynote",
    format: "hybrid",
    streamType: "livestream",
    FeaturedSession: true,
    day: 0,
    startHour: 9,
    endHour: 10,
    speakerSlugs: ["dr-sarah-nakamya", "robert-ssempala"],
    venueName: "Kampala International Conference Centre",
    SortOrder: 1,
  },
  {
    Title: "Investment Landscape in East Africa",
    Slug: "investment-landscape-east-africa",
    ShortDescription:
      "A deep dive into investment trends and opportunities across the East African region.",
    Description: blocks(
      "This panel brings together leading investors and policymakers to discuss the investment climate in East Africa. Learn about sectors poised for growth, regulatory developments, and strategies for maximizing returns."
    ),
    SessionType: "Panel",
    format: "hybrid",
    streamType: "call",
    FeaturedSession: true,
    day: 0,
    startHour: 10,
    startMin: 30,
    endHour: 12,
    speakerSlugs: ["james-okello", "robert-ssempala", "david-muwanga"],
    venueName: "Kampala International Conference Centre",
    SortOrder: 2,
  },
  {
    Title: "Climate Innovation for Africa",
    Slug: "climate-innovation-for-africa",
    ShortDescription:
      "Exploring cutting-edge climate technologies and sustainable development strategies.",
    Description: blocks(
      "Professor Amina Wanjiku leads a discussion on the latest developments in climate technology, with a focus on solutions being developed in and for Africa. Topics include renewable energy, carbon markets, and climate-smart agriculture."
    ),
    SessionType: "Conference",
    format: "in-person",
    FeaturedSession: false,
    day: 0,
    startHour: 14,
    endHour: 15,
    endMin: 30,
    speakerSlugs: ["prof-amina-wanjiku", "fatima-hassan"],
    venueName: "Kampala International Conference Centre",
    SortOrder: 3,
  },
  {
    Title: "Fintech Revolution: Mobile Payments Workshop",
    Slug: "fintech-revolution-mobile-payments-workshop",
    ShortDescription:
      "Hands-on workshop exploring the future of mobile payments and financial inclusion.",
    Description: blocks(
      "Get hands-on experience with the latest fintech tools and frameworks. David Muwanga shares insights from building PayGo Africa and leads participants through practical exercises on designing mobile payment solutions."
    ),
    SessionType: "Workshop",
    format: "in-person",
    FeaturedSession: false,
    day: 1,
    startHour: 9,
    endHour: 11,
    speakerSlugs: ["david-muwanga", "peter-kiggundu"],
    venueName: "Innovation Hub Kampala",
    SortOrder: 4,
  },
  {
    Title: "Digital Health Transformation",
    Slug: "digital-health-transformation",
    ShortDescription:
      "How technology is revolutionizing healthcare delivery across Africa.",
    Description: blocks(
      "Grace Achieng presents the WHO's digital health strategy for Africa and showcases successful implementations. Learn about telemedicine, AI diagnostics, and digital health records that are saving lives."
    ),
    SessionType: "Conference",
    format: "hybrid",
    streamType: "call",
    FeaturedSession: false,
    day: 1,
    startHour: 11,
    startMin: 30,
    endHour: 13,
    speakerSlugs: ["grace-achieng"],
    venueName: "Kampala International Conference Centre",
    SortOrder: 5,
  },
  {
    Title: "Blockchain for Supply Chains",
    Slug: "blockchain-for-supply-chains",
    ShortDescription:
      "Practical applications of blockchain technology in African supply chains.",
    Description: blocks(
      "Peter Kiggundu demonstrates how blockchain is being used to create transparent, efficient supply chains across Africa. From coffee exports to pharmaceutical distribution, see real-world case studies."
    ),
    SessionType: "Workshop",
    format: "in-person",
    FeaturedSession: false,
    day: 1,
    startHour: 14,
    endHour: 16,
    speakerSlugs: ["peter-kiggundu"],
    venueName: "Innovation Hub Kampala",
    SortOrder: 6,
  },
  {
    Title: "AI in Africa: From Research to Impact",
    Slug: "ai-in-africa-from-research-to-impact",
    ShortDescription:
      "Showcasing AI innovations developed in Africa for African challenges.",
    Description: blocks(
      "Maria Tumusiime presents groundbreaking AI research from the Makerere AI Lab, including computer vision for crop disease detection and NLP for local languages. A must-attend for tech enthusiasts."
    ),
    SessionType: "Keynote",
    format: "virtual",
    streamType: "livestream",
    FeaturedSession: true,
    day: 2,
    startHour: 9,
    endHour: 10,
    speakerSlugs: ["maria-tumusiime"],
    venueName: "Virtual Session Room",
    SortOrder: 7,
  },
  {
    Title: "Fireside Chat: Building a Pan-African Startup",
    Slug: "fireside-chat-building-pan-african-startup",
    ShortDescription:
      "An intimate conversation about the journey of scaling startups across Africa.",
    Description: blocks(
      "Join David Muwanga and James Okello for an candid fireside chat about the challenges and triumphs of building startups that scale across African borders. Real stories, hard lessons, and practical advice."
    ),
    SessionType: "Fireside",
    format: "hybrid",
    streamType: "call",
    FeaturedSession: false,
    day: 2,
    startHour: 10,
    startMin: 30,
    endHour: 11,
    endMin: 30,
    speakerSlugs: ["david-muwanga", "james-okello"],
    venueName: "Kampala International Conference Centre",
    SortOrder: 8,
  },
  {
    Title: "Youth Innovation Showcase",
    Slug: "youth-innovation-showcase",
    ShortDescription:
      "Young innovators present their breakthrough solutions to African challenges.",
    Description: blocks(
      "Daniel Opio hosts this dynamic showcase featuring the best youth-led innovations from across Uganda. Watch live demos, hear pitches, and vote for your favorites."
    ),
    SessionType: "Exhibition",
    format: "in-person",
    FeaturedSession: false,
    day: 2,
    startHour: 13,
    endHour: 15,
    speakerSlugs: ["daniel-opio"],
    venueName: "Kampala International Conference Centre",
    SortOrder: 9,
  },
  {
    Title: "Renewable Energy Investment Panel",
    Slug: "renewable-energy-investment-panel",
    ShortDescription:
      "Experts discuss investment opportunities in Africa's renewable energy sector.",
    Description: blocks(
      "A panel of experts examines the enormous potential for renewable energy investment in East Africa. From solar to geothermal, discover the technologies and markets driving the green transition."
    ),
    SessionType: "Panel",
    format: "hybrid",
    streamType: "call",
    FeaturedSession: false,
    day: 2,
    startHour: 15,
    startMin: 30,
    endHour: 17,
    speakerSlugs: ["fatima-hassan", "james-okello", "robert-ssempala"],
    venueName: "Kampala International Conference Centre",
    SortOrder: 10,
  },
  {
    Title: "Networking Mixer: Investors Meet Founders",
    Slug: "networking-mixer-investors-meet-founders",
    ShortDescription:
      "An evening of structured networking connecting startups with potential investors.",
    Description: blocks(
      "The highlight networking event of the expo. Speed networking rounds, curated matchmaking, and plenty of space for organic connections. VIP and Premium ticket holders get priority access."
    ),
    SessionType: "Networking",
    format: "in-person",
    FeaturedSession: false,
    day: 1,
    startHour: 17,
    endHour: 19,
    speakerSlugs: ["james-okello", "daniel-opio"],
    venueName: "Kampala International Conference Centre",
    SortOrder: 11,
  },
  {
    Title: "Closing Ceremony & Awards",
    Slug: "closing-ceremony-and-awards",
    ShortDescription:
      "Celebrating achievements and recognizing outstanding contributions to innovation.",
    Description: blocks(
      "The grand finale of UNITE Expo 2025. Join us for the closing ceremony featuring award presentations for Best Innovation, Best Youth Project, and Investor's Choice. Dr. Sarah Nakamya delivers closing remarks."
    ),
    SessionType: "Keynote",
    format: "hybrid",
    streamType: "livestream",
    FeaturedSession: true,
    day: 2,
    startHour: 17,
    endHour: 19,
    speakerSlugs: ["dr-sarah-nakamya", "daniel-opio", "robert-ssempala"],
    venueName: "Kampala International Conference Centre",
    SortOrder: 12,
  },
];

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSeeding data to ${STRAPI_URL}...\n`);

  // Strapi v5 uses documentId for relations, not numeric id
  function docId(entity) {
    return entity.documentId || entity.id;
  }

  // 1. Find the UNITE Expo 2025 event
  console.log("Looking for UNITE Expo 2025 event...");
  let event = await findBySlug("events", "unite-expo-2025");
  if (!event) {
    console.log("  Creating UNITE Expo 2025 event...");
    const res = await create("events", {
      Title: "UNITE Expo 2025",
      Slug: "unite-expo-2025",
      ShortDescription:
        "Uganda's premier international trade and investment exposition connecting global innovators, investors, and policymakers.",
      Description: blocks(
        "UNITE Expo 2025 is the largest international trade and investment exposition in Uganda, bringing together over 300 exhibitors and 20,000 attendees from 50+ countries. Explore investment opportunities, attend world-class sessions, and connect with leaders shaping East Africa's future."
      ),
      StartDate: "2025-07-07T09:00:00.000Z",
      EndDate: "2025-07-14T19:00:00.000Z",
      Location: "Kampala International Conference Centre, Kampala, Uganda",
      Category: "expo",
      accessMode: "ticketed",
      isFeatured: true,
      Status: "published",
    });
    event = res.data;
    console.log(`  Created event: ${event.Title} (documentId: ${docId(event)})`);
  } else {
    console.log(`  Found event: ${event.Title} (documentId: ${docId(event)})`);
  }

  // 2. Create Venues
  console.log("\nCreating venues...");
  const venueMap = {};
  for (const v of venues) {
    let existing = await findBySlug("venues", v.Slug);
    if (!existing) {
      const res = await create("venues", v);
      existing = res.data;
      console.log(`  Created venue: ${existing.Name} (documentId: ${docId(existing)})`);
    } else {
      console.log(`  Venue exists: ${existing.Name} (documentId: ${docId(existing)})`);
    }
    venueMap[v.Name] = docId(existing);
  }

  // Connect main venue to event
  const mainVenueDocId = venueMap["Kampala International Conference Centre"];
  if (mainVenueDocId) {
    await api(`/events/${docId(event)}`, "PUT", {
      data: { venue: mainVenueDocId },
    });
    console.log("  Connected main venue to event");
  }

  // 3. Create Speakers
  console.log("\nCreating speakers...");
  const speakerMap = {};
  for (const s of speakers) {
    let existing = await findBySlug("speakers", s.Slug);
    if (!existing) {
      const res = await create("speakers", s);
      existing = res.data;
      console.log(`  Created speaker: ${existing.Name} (documentId: ${docId(existing)})`);
    } else {
      console.log(`  Speaker exists: ${existing.Name} (documentId: ${docId(existing)})`);
    }
    speakerMap[s.Slug] = docId(existing);
  }

  // 4. Create Sponsors
  console.log("\nCreating sponsors...");
  const sponsorDocIds = [];
  for (const sp of sponsors) {
    let existing = await findBySlug("sponsors", sp.Slug);
    if (!existing) {
      const res = await create("sponsors", sp);
      existing = res.data;
      console.log(
        `  Created sponsor: ${existing.Name} [${sp.Tier}] (documentId: ${docId(existing)})`
      );
    } else {
      console.log(
        `  Sponsor exists: ${existing.Name} [${sp.Tier}] (documentId: ${docId(existing)})`
      );
    }
    sponsorDocIds.push(docId(existing));
  }

  // Connect sponsors to event
  await api(`/events/${docId(event)}`, "PUT", {
    data: { sponsors: sponsorDocIds },
  });
  console.log("  Connected sponsors to event");

  // 5. Create FAQ Categories
  console.log("\nCreating FAQ categories...");
  const faqCategoryMap = {};
  for (const cat of faqCategories) {
    // FAQ categories use 'identifier' field, not 'Slug'
    const res = await api(
      `/faq-categories?filters[identifier][$eq]=${encodeURIComponent(cat.identifier)}`
    );
    let existing = res?.data?.[0] ?? null;
    if (!existing) {
      const createRes = await create("faq-categories", cat);
      existing = createRes.data;
      console.log(
        `  Created FAQ category: ${existing.Name} (documentId: ${docId(existing)})`
      );
    } else {
      console.log(
        `  FAQ category exists: ${existing.Name} (documentId: ${docId(existing)})`
      );
    }
    faqCategoryMap[cat.Name] = docId(existing);
  }

  // 6. Create FAQs
  console.log("\nCreating FAQs...");
  for (const faq of faqs) {
    await create("faqs", {
      Question: faq.Question,
      Answer: faq.Answer,
      Category: faqCategoryMap[faq.category],
      event: docId(event),
    });
    console.log(`  Created FAQ: ${faq.Question.substring(0, 50)}...`);
  }

  // 7. Create Sessions
  console.log("\nCreating sessions...");
  for (const sd of sessionDefs) {
    let existing = await findBySlug("sessions", sd.Slug);
    if (existing) {
      console.log(`  Session exists: ${existing.Title} (documentId: ${docId(existing)})`);
      continue;
    }

    const startMin = sd.startMin ?? 0;
    const endMin = sd.endMin ?? 0;

    const sessionData = {
      Title: sd.Title,
      Slug: sd.Slug,
      ShortDescription: sd.ShortDescription,
      Description: sd.Description,
      SessionType: sd.SessionType,
      format: sd.format,
      streamType: sd.streamType || undefined,
      FeaturedSession: sd.FeaturedSession,
      SortOrder: sd.SortOrder,
      StartDate: sessionDate(sd.day, sd.startHour, startMin),
      EndDate: sessionDate(sd.day, sd.endHour, endMin),
      event: docId(event),
      speakers: sd.speakerSlugs
        .map((slug) => speakerMap[slug])
        .filter(Boolean),
      venue: venueMap[sd.venueName],
    };

    const res = await create("sessions", sessionData);
    console.log(
      `  Created session: ${res.data.Title} (documentId: ${docId(res.data)}) — ${sd.SessionType}, ${sd.format}`
    );
  }

  console.log("\n✅ Seed data complete!\n");
  console.log("Summary:");
  console.log(`  Event: UNITE Expo 2025`);
  console.log(`  Venues: ${venues.length}`);
  console.log(`  Speakers: ${speakers.length}`);
  console.log(`  Sponsors: ${sponsors.length}`);
  console.log(`  Sessions: ${sessionDefs.length}`);
  console.log(`  FAQ Categories: ${faqCategories.length}`);
  console.log(`  FAQs: ${faqs.length}`);
  console.log(
    `\nVisit ${STRAPI_URL.replace(":1337", ":3000")}/events/unite-expo-2025 to see it!`
  );
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message);
  process.exit(1);
});
