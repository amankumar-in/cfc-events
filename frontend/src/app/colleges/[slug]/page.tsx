import { notFound } from "next/navigation";
import { fetchCollegeBySlug } from "@/lib/api/colleges";
import { getStrapiURL } from "@/lib/api/api-config";
import { getProgramImage, getCollegeBanner } from "@/lib/utils/program-images";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  Globe,
  GraduationCap,
  Clock,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────

interface BlockChild {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  children?: BlockChild[];
}

interface Block {
  type: string;
  level?: number;
  children?: BlockChild[];
}

function renderBlockText(children: BlockChild[]): React.ReactNode[] {
  return children.map((child, i) => {
    let node: React.ReactNode = child.text ?? "";
    if (child.bold) node = <strong key={i}>{node}</strong>;
    if (child.italic) node = <em key={i}>{node}</em>;
    return node;
  });
}

function renderBlocks(blocks: Block[]) {
  return blocks.map((block, i) => {
    const content = block.children ? renderBlockText(block.children) : null;
    if (block.type === "heading") {
      return (
        <h3
          key={i}
          className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white"
        >
          {content}
        </h3>
      );
    }
    return (
      <p
        key={i}
        className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed"
      >
        {content}
      </p>
    );
  });
}

const degreeLevelLabels: Record<string, string> = {
  associate: "Associate",
  bachelor: "Bachelor's",
  master: "Master's",
  doctorate: "Doctorate",
  certificate: "Certificate",
  diploma: "Diploma",
};

const formatLabels: Record<string, string> = {
  online: "Online",
  "on-campus": "On-Campus",
  hybrid: "Hybrid",
};

// ── Metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const college = await fetchCollegeBySlug(slug);
  if (!college) return { title: "College Not Found | CFC Events" };

  return {
    title: `${college.Name} | CFC Events`,
    description: college.ShortDescription,
  };
}

// ── Page Component ────────────────────────────────────────────────────

export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const college = await fetchCollegeBySlug(slug);

  if (!college) {
    notFound();
  }

  const programs = college.programs ?? [];
  const faculty = college.Faculty ?? [];
  const events = college.events ?? [];
  const primaryEvent = events[0];
  const descriptionBlocks = college.Description as Block[] | undefined;
  const hasDescription =
    Array.isArray(descriptionBlocks) && descriptionBlocks.length > 0;

  return (
    <main className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getCollegeBanner(college)}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-500 opacity-80" />
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600 opacity-80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link
              href="/programs"
              className="hover:text-yellow-500 transition-colors"
            >
              Programs
            </Link>
            <span>/</span>
            <span className="text-gray-300">{college.Name}</span>
          </div>

          <div className="flex items-start gap-6">
            {college.Logo && (
              <div className="hidden md:flex bg-white p-4 flex-shrink-0">
                <img
                  src={getStrapiURL(college.Logo.url)}
                  alt={college.Name}
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {college.Type && (
                  <Chip variant="primary" size="md">
                    {college.Type === "public"
                      ? "Public University"
                      : "Private University"}
                  </Chip>
                )}
                {college.Featured && (
                  <Chip variant="accent" size="md">
                    Featured
                  </Chip>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {college.Name}
              </h1>

              <p className="text-xl text-gray-300 mb-4 max-w-3xl">
                {college.ShortDescription}
              </p>

              <div className="flex flex-wrap gap-6 text-gray-300">
                {college.City && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-yellow-500" />
                    <span>
                      {college.City}
                      {college.Country ? `, ${college.Country}` : ""}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-yellow-500" />
                  <span>{programs.length} Programs</span>
                </div>
                {college.Website && (
                  <a
                    href={college.Website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-yellow-500 transition-colors"
                  >
                    <Globe className="h-5 w-5 text-yellow-500" />
                    <span>Visit Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      {hasDescription && (
        <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  About {college.ShortName || college.Name}
                </h2>
                <div className="text-lg">
                  {renderBlocks(descriptionBlocks!)}
                </div>
              </div>

              {/* Accreditation sidebar */}
              {college.Accreditation && (
                <div className="lg:col-span-1">
                  <div className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <ShieldCheck className="h-6 w-6 text-yellow-500" />
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Accreditation
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {college.Accreditation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Programs */}
      {programs.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Programs Offered
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                {programs.length} programs available from{" "}
                {college.ShortName || college.Name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map(
                (program: {
                  id: number;
                  Name: string;
                  Slug: string;
                  ShortDescription: string;
                  DegreeLevel: string;
                  FieldOfStudy?: string;
                  Duration?: string;
                  Format?: string;
                  Tuition?: string;
                  Featured: boolean;
                  Image?: { url: string } | null;
                  BannerImage?: { url: string } | null;
                }) => (
                  <Link
                    key={program.id}
                    href={`/programs/${program.Slug}`}
                    className="group block"
                  >
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-yellow-500 transition-colors h-full flex flex-col">
                      {/* Program image */}
                      <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <img
                          src={getProgramImage(program)}
                          alt={program.Name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start gap-2 mb-3">
                          <Chip
                            variant={
                              program.Featured ? "primary" : "secondary"
                            }
                            size="sm"
                          >
                            {degreeLevelLabels[program.DegreeLevel] ||
                              program.DegreeLevel}
                          </Chip>
                          {program.Format && (
                            <Chip variant="outline" size="sm">
                              {formatLabels[program.Format] || program.Format}
                            </Chip>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors mb-2">
                          {program.Name}
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-2">
                          {program.ShortDescription}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {program.Duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{program.Duration}</span>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-yellow-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* Faculty */}
      {faculty.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Faculty & Leadership
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {faculty.map(
                (
                  member: {
                    id?: number;
                    Name: string;
                    Designation: string;
                    Department?: string;
                    Image?: { url: string };
                  },
                  i: number
                ) => (
                  <div key={member.id || i}>
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 mb-3">
                      {member.Image ? (
                        <img
                          src={getStrapiURL(member.Image.url)}
                          alt={member.Name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl font-bold text-gray-300 dark:text-gray-600">
                            {member.Name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      {member.Name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {member.Designation}
                    </p>
                    {member.Department && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">
                        {member.Department}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {primaryEvent && (
        <section className="relative py-16 bg-gray-900 text-white overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 bg-yellow-500 opacity-80" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-500 opacity-60" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet {college.ShortName || college.Name} at{" "}
              {primaryEvent.Title}
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Talk directly with admissions representatives, ask about
              programs, scholarships, and application requirements.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                href={`/events/${primaryEvent.Slug}/tickets`}
              >
                Register Free
              </Button>
              {college.Website && (
                <a
                  href={college.Website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-medium bg-transparent border border-white text-white hover:bg-white/20 transition-colors"
                >
                  Visit {college.ShortName || "University"} Website
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
