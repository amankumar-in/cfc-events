import { notFound } from "next/navigation";
import { fetchProgramBySlug } from "@/lib/api/programs";
import { getStrapiURL } from "@/lib/api/api-config";
import { getProgramImage } from "@/lib/utils/program-images";
import { ProgramTabs } from "@/components/program/ProgramTabs";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import {
  Clock,
  Monitor,
  Globe,
  GraduationCap,
  Calendar,
  DollarSign,
  BookOpen,
  ExternalLink,
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
  format?: string;
  children?: BlockChild[];
}

// ── Metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await fetchProgramBySlug(slug);
  if (!program) return { title: "Program Not Found | CFC Events" };

  const collegeName = program.college?.Name || "";
  return {
    title: `${program.Name}${collegeName ? ` | ${collegeName}` : ""} | CFC Events`,
    description: program.ShortDescription,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────

const degreeLevelLabels: Record<string, string> = {
  associate: "Associate Degree",
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  doctorate: "Doctoral Degree",
  certificate: "Certificate",
  diploma: "Diploma",
};

const formatLabels: Record<string, string> = {
  online: "100% Online",
  "on-campus": "On-Campus",
  hybrid: "Hybrid",
};

// ── Page Component ────────────────────────────────────────────────────

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await fetchProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  const college = program.college;
  const events = program.events ?? [];
  const primaryEvent = events[0];

  // Key facts for the sidebar
  const keyFacts = [
    {
      icon: GraduationCap,
      label: "Degree",
      value: degreeLevelLabels[program.DegreeLevel] || program.DegreeLevel,
    },
    program.Duration
      ? { icon: Clock, label: "Duration", value: program.Duration }
      : null,
    program.Format
      ? {
          icon: Monitor,
          label: "Format",
          value: formatLabels[program.Format] || program.Format,
        }
      : null,
    program.Language
      ? { icon: Globe, label: "Language", value: program.Language }
      : null,
    program.Credits
      ? { icon: BookOpen, label: "Credits", value: program.Credits }
      : null,
    program.StartDate
      ? { icon: Calendar, label: "Next Intake", value: program.StartDate }
      : null,
    program.ApplicationDeadline
      ? {
          icon: Calendar,
          label: "Application Deadline",
          value: program.ApplicationDeadline,
        }
      : null,
    program.Tuition
      ? { icon: DollarSign, label: "Tuition", value: program.Tuition }
      : null,
  ].filter(Boolean) as {
    icon: typeof Clock;
    label: string;
    value: string;
  }[];

  return (
    <main className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={getProgramImage(program)}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/50 to-transparent" />
          <div className="hidden md:block absolute bottom-0 right-0 w-24 h-24 bg-yellow-500 opacity-80" />
          <div className="hidden md:block absolute top-12 right-24 w-12 h-12 bg-blue-600 opacity-60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-20">
          {/* Breadcrumb — hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link
              href="/programs"
              className="hover:text-yellow-500 transition-colors"
            >
              Programs
            </Link>
            <span>/</span>
            {college && (
              <>
                <Link
                  href={`/colleges/${college.Slug}`}
                  className="hover:text-yellow-500 transition-colors"
                >
                  {college.ShortName || college.Name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-300 truncate">{program.Name}</span>
          </div>

          <div className="max-w-3xl">
            {/* College logo + name — hidden on mobile */}
            {college && (
              <Link
                href={`/colleges/${college.Slug}`}
                className="hidden md:inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
              >
                {college.Logo && (
                  <div className="bg-white p-2 inline-flex">
                    <img
                      src={getStrapiURL(college.Logo.url)}
                      alt={college.Name}
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                )}
                <span className="text-gray-300 text-sm font-medium">
                  {college.Name}
                </span>
              </Link>
            )}

            <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
              <Chip variant="primary" size="sm">
                {degreeLevelLabels[program.DegreeLevel] || program.DegreeLevel}
              </Chip>
              {program.Format && (
                <Chip variant="accent" size="sm">
                  {formatLabels[program.Format] || program.Format}
                </Chip>
              )}
              {program.Featured && (
                <Chip variant="white" size="sm">
                  Featured
                </Chip>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              {program.Name}
            </h1>

            <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8">
              {program.ShortDescription}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              {primaryEvent && (
                <a
                  href={`/events/${primaryEvent.Slug}/tickets`}
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                >
                  Register Now
                </a>
              )}
              {program.ApplicationURL && (
                <a
                  href={program.ApplicationURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 text-lg font-medium bg-transparent border border-white text-white hover:bg-white/20 transition-colors"
                >
                  Apply at {college?.ShortName || "University"}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* Key Facts — floating card, pulled up into hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-6 md:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {keyFacts.map((fact) => (
              <div key={fact.label} className="flex items-start gap-3">
                <fact.icon className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {fact.label}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {fact.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content — Tabs with financial aid callout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Financial aid note */}
        {program.FinancialAidInfo && (
          <div className="flex gap-4 mb-10 p-5 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-500/10">
            <DollarSign className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">
                Financial Aid
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {program.FinancialAidInfo}
              </p>
            </div>
          </div>
        )}

        <ProgramTabs program={program} />
      </div>

      {/* Bottom CTA */}
      {primaryEvent && (
        <section className="relative py-16 bg-gray-900 text-white overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 bg-yellow-500 opacity-80" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-500 opacity-60" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Interested in {program.Name}?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Meet the admissions team from{" "}
              {college?.ShortName || college?.Name || "the university"} at{" "}
              {primaryEvent.Title}. Ask questions, get answers, and start your
              application.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                href={`/events/${primaryEvent.Slug}/tickets`}
              >
                Register Free
              </Button>
              <Button
                variant="light"
                buttonType="outline"
                size="lg"
                href="/programs"
              >
                Explore More Programs
              </Button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
