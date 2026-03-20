import { fetchAPI } from "@/lib/api/api-config";
import { ProgramFilters } from "@/components/program/ProgramFilters";

// ── Types ─────────────────────────────────────────────────────────────

interface College {
  id: number;
  Name: string;
  Slug: string;
  ShortName?: string;
  Logo?: { url: string };
}

interface Program {
  id: number;
  Name: string;
  Slug: string;
  ShortDescription: string;
  DegreeLevel: string;
  FieldOfStudy: string;
  Duration?: string;
  Format?: string;
  Tuition?: string;
  Featured: boolean;
  Image?: { url: string };
  college?: College;
}

// ── Data Fetching ─────────────────────────────────────────────────────

async function getAllPrograms() {
  try {
    const res = await fetchAPI(
      `/programs?populate[Image]=true&populate[college][populate][0]=Logo&sort=SortOrder:asc&pagination[limit]=100`,
      { next: { revalidate: 60 } }
    );
    return (res?.data ?? []) as Program[];
  } catch {
    return [];
  }
}

// ── Helpers ───────────────────────────────────────────────────────────

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

// ── Page Component ────────────────────────────────────────────────────

export const metadata = {
  title: "Online Programs | CFC Events",
  description:
    "Explore accredited online degree programs from universities worldwide. Find bachelor's, master's, and certificate programs with clear information on tuition, curriculum, and career outcomes.",
};

export default async function ProgramsPage() {
  const programs = await getAllPrograms();

  // Extract unique filters
  const degreeLevels = [
    ...new Set(programs.map((p) => p.DegreeLevel)),
  ].sort();
  const fieldsOfStudy = [
    ...new Set(programs.map((p) => p.FieldOfStudy)),
  ].sort();
  const colleges = programs
    .filter((p) => p.college)
    .reduce((acc, p) => {
      if (p.college && !acc.find((c) => c.id === p.college!.id)) {
        acc.push(p.college);
      }
      return acc;
    }, [] as College[]);

  return (
    <main className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/30 to-gray-900" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-500 opacity-80" />
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600 opacity-80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <span className="inline-block mb-4 px-4 py-1.5 bg-yellow-500 text-gray-900 text-sm font-bold uppercase tracking-wide">
              Accredited Programs
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Online Degree Programs
            </h1>
            <p className="text-xl text-gray-300">
              Explore accredited programs from partner universities. Every
              program page tells you exactly what you get — tuition, curriculum,
              career outcomes — no ambiguity.
            </p>
          </div>
        </div>
      </section>

      {/* Programs with filters */}
      <ProgramFilters
        programs={programs}
        degreeLevels={degreeLevels}
        fieldsOfStudy={fieldsOfStudy}
        colleges={colleges}
        degreeLevelLabels={degreeLevelLabels}
        formatLabels={formatLabels}
        stats={{
          totalPrograms: programs.length,
          totalColleges: colleges.length,
          onlineCount: programs.filter((p) => p.Format === "online").length,
        }}
      />
    </main>
  );
}
