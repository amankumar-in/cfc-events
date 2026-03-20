import { getStrapiURL } from "@/lib/api/api-config";

// Stock images by field of study — used when programs have no uploaded image
const fieldImages: Record<string, string> = {
  "Business & Management":
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=480&fit=crop&q=80",
  "Criminal Justice & Law":
    "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=480&fit=crop&q=80",
  "Nursing & Healthcare":
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=480&fit=crop&q=80",
  "Public Administration & Policy":
    "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&h=480&fit=crop&q=80",
  "Psychology & Social Sciences":
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=480&fit=crop&q=80",
  "Health Information & Technology":
    "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=480&fit=crop&q=80",
};

const defaultImage =
  "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&h=480&fit=crop&q=80";

const defaultCollegeBanner =
  "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop&q=80";

export function getProgramImage(program: {
  Image?: { url: string } | null;
  FieldOfStudy?: string;
}): string {
  if (program.Image?.url) return getStrapiURL(program.Image.url);
  return fieldImages[program.FieldOfStudy || ""] || defaultImage;
}

export function getCollegeBanner(college: {
  BannerImage?: { url: string } | null;
}): string {
  if (college.BannerImage?.url) return getStrapiURL(college.BannerImage.url);
  return defaultCollegeBanner;
}
