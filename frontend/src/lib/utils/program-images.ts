import { getStrapiURL } from "@/lib/api/api-config";

// Unique fallback images per program slug — each visually distinct
const slugImages: Record<string, string> = {
  "master-of-business-administration":
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=480&fit=crop&q=80",   // business meeting, charts on table
  "master-of-science-in-criminal-justice":
    "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=480&fit=crop&q=80",   // scales of justice
  "master-of-science-in-nursing":
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=480&fit=crop&q=80",   // nurse with stethoscope
  "master-of-public-administration":
    "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&h=480&fit=crop&q=80",   // US Capitol / government building
  "bachelor-of-science-in-management":
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=480&fit=crop&q=80",      // team collaboration whiteboard
  "bachelor-of-science-in-criminal-justice":
    "https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=800&h=480&fit=crop&q=80",   // police badge close-up
  "rn-to-bsn":
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=480&fit=crop&q=80",   // nurse at hospital station
  "bachelor-of-arts-in-psychology":
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=480&fit=crop&q=80",   // woman in professional setting
  "associate-health-information-technology":
    "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=480&fit=crop&q=80",      // medical records / health data
  "certificate-in-medical-coding":
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=480&fit=crop&q=80",   // medical coding / clinical documentation
};

// Section-specific fallback images — unique per section, not reused
const sectionImages: Record<string, Record<string, string>> = {
  "master-of-business-administration": {
    overview: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=500&fit=crop&q=80",   // business team discussion
    curriculum: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop&q=80", // studying / notes
    admissions: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&h=500&fit=crop&q=80", // campus building
    careers: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop&q=80",    // office professionals
  },
  "master-of-science-in-criminal-justice": {
    overview: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop&q=80",   // legal documents / desk
    curriculum: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop&q=80", // person studying
    admissions: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=500&fit=crop&q=80", // application forms
    careers: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=800&h=500&fit=crop&q=80",    // professional at work
  },
  "master-of-science-in-nursing": {
    overview: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&h=500&fit=crop&q=80",   // nurse practitioner with patient
    curriculum: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=500&fit=crop&q=80", // medical education
    admissions: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop&q=80", // healthcare setting
    careers: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=500&fit=crop&q=80",       // doctor / NP in clinic
  },
  "master-of-public-administration": {
    overview: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=500&fit=crop&q=80",   // office meeting / boardroom
    curriculum: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop&q=80", // documents on desk
    admissions: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=500&fit=crop&q=80", // classroom lecture
    careers: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&h=500&fit=crop&q=80",    // modern office workspace
  },
  "bachelor-of-science-in-management": {
    overview: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=500&fit=crop&q=80",      // business presentation
    curriculum: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&h=500&fit=crop&q=80", // laptop and notebook
    admissions: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop&q=80",    // campus aerial
    careers: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&h=500&fit=crop&q=80",       // office workspace
  },
  "bachelor-of-science-in-criminal-justice": {
    overview: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&h=500&fit=crop&q=80",   // courthouse
    curriculum: "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=800&h=500&fit=crop&q=80", // law books
    admissions: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop&q=80", // students campus
    careers: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop&q=80",       // professionals meeting
  },
  "rn-to-bsn": {
    overview: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=500&fit=crop&q=80",   // nursing team
    curriculum: "https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=800&h=500&fit=crop&q=80", // medical education
    admissions: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&h=500&fit=crop&q=80", // woman at laptop
    careers: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=500&fit=crop&q=80",       // hospital corridor
  },
  "bachelor-of-arts-in-psychology": {
    overview: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&h=500&fit=crop&q=80",   // counseling session
    curriculum: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=500&fit=crop&q=80", // textbooks library
    admissions: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=500&fit=crop&q=80", // graduation
    careers: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=500&fit=crop&q=80",   // professional woman
  },
  "associate-health-information-technology": {
    overview: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop&q=80",   // healthcare tech
    curriculum: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=500&fit=crop&q=80", // data screens
    admissions: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop&q=80", // students
    careers: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=500&fit=crop&q=80",       // medical records
  },
  "certificate-in-medical-coding": {
    overview: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=500&fit=crop&q=80",   // medical documentation
    curriculum: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop&q=80",    // coding / documents
    admissions: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop&q=80", // studying
    careers: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&h=500&fit=crop&q=80",    // healthcare office
  },
};

// Field of study fallback — only used if slug not found
const fieldImages: Record<string, string> = {
  "Business & Management":
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=480&fit=crop&q=80",
  "Criminal Justice & Law":
    "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=480&fit=crop&q=80",
  "Nursing & Healthcare":
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=480&fit=crop&q=80",
  "Public Administration & Policy":
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=480&fit=crop&q=80",
  "Psychology & Social Sciences":
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=480&fit=crop&q=80",
  "Health Information & Technology":
    "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=480&fit=crop&q=80",
};

const defaultImage =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=480&fit=crop&q=80";

const defaultCollegeBanner =
  "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop&q=80";

export function getProgramImage(program: {
  Image?: { url: string } | null;
  Slug?: string;
  FieldOfStudy?: string;
}): string {
  if (program.Image?.url) return getStrapiURL(program.Image.url);
  if (program.Slug && slugImages[program.Slug]) return slugImages[program.Slug];
  return fieldImages[program.FieldOfStudy || ""] || defaultImage;
}

export function getProgramSectionImage(
  slug: string,
  section: string,
  image?: { url: string } | null
): string {
  if (image?.url) return getStrapiURL(image.url);
  return sectionImages[slug]?.[section] || defaultImage;
}

export function getCollegeBanner(college: {
  BannerImage?: { url: string } | null;
}): string {
  if (college.BannerImage?.url) return getStrapiURL(college.BannerImage.url);
  return defaultCollegeBanner;
}
