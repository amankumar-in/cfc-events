import { fetchFeaturedColleges } from "@/lib/api/colleges";
import { getStrapiURL } from "@/lib/api/api-config";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { getProgramImage } from "@/lib/utils/program-images";

// ── Types ─────────────────────────────────────────────────────────────

interface Program {
  id: number;
  Name: string;
  Slug: string;
  ShortDescription: string;
  DegreeLevel: string;
  FieldOfStudy: string;
  Duration?: string;
  Format?: string;
  Featured: boolean;
  Image?: { url: string };
}

interface College {
  id: number;
  Name: string;
  Slug: string;
  ShortName?: string;
  ShortDescription: string;
  Logo?: { url: string };
  programs?: Program[];
}

const degreeLevelLabels: Record<string, string> = {
  associate: "Associate",
  bachelor: "Bachelor's",
  master: "Master's",
  doctorate: "Doctorate",
  certificate: "Certificate",
  diploma: "Diploma",
};

// ── Component ─────────────────────────────────────────────────────────

export async function FeaturedColleges() {
  let colleges: College[] = [];
  try {
    const res = await fetchFeaturedColleges();
    colleges = res?.data ?? [];
  } catch {
    return null;
  }

  if (colleges.length === 0) return null;

  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Explore Programs from Top Universities
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Accredited programs presented with full transparency — tuition,
              curriculum, and career outcomes
            </p>
          </div>
          <Button
            variant="primary"
            buttonType="outline"
            href="/programs"
            className="mt-4 md:mt-0 whitespace-nowrap"
          >
            View All Programs
          </Button>
        </div>

        {colleges.map((college) => {
          const programs = college.programs ?? [];
          const heroProgram = programs[0];
          const cardPrograms = programs.slice(1, 5);

          if (!heroProgram) return null;

          return (
            <div key={college.id} className="mb-14 last:mb-0">
              {/* College name row */}
              <Link
                href={`/colleges/${college.Slug}`}
                className="group inline-flex items-center gap-2 mb-5"
              >
                {college.Logo && (
                  <img
                    src={getStrapiURL(college.Logo.url)}
                    alt=""
                    className="h-6 w-6 object-contain"
                  />
                )}
                <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors">
                  Learn with {college.ShortName || college.Name}
                </span>
              </Link>

              {/* Udemy-style layout: hero card + thumbnail cards */}
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {/* Hero card — larger, with description + CTA */}
                <Link
                  href={`/programs/${heroProgram.Slug}`}
                  className="group/hero flex-shrink-0 w-80 sm:w-96"
                >
                  <div className="bg-gray-900 dark:bg-gray-700 text-white h-full flex flex-col relative overflow-hidden">
                    {/* Background image with overlay */}
                    <div className="absolute inset-0">
                      <img
                        src={getProgramImage(heroProgram)}
                        alt=""
                        className="w-full h-full object-cover opacity-30"
                      />
                    </div>
                    <div className="relative p-6 flex flex-col flex-1">
                      {/* College logo badge */}
                      {college.Logo && (
                        <div className="bg-white p-1.5 inline-flex self-start mb-4">
                          <img
                            src={getStrapiURL(college.Logo.url)}
                            alt={college.Name}
                            className="h-5 w-auto object-contain"
                          />
                        </div>
                      )}

                      <h3 className="text-lg font-bold mb-2 group-hover/hero:text-yellow-400 transition-colors">
                        {heroProgram.Name}
                      </h3>

                      <p className="text-sm text-gray-300 mb-4 line-clamp-3 flex-1">
                        {heroProgram.ShortDescription}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                        {heroProgram.Duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{heroProgram.Duration}</span>
                          </div>
                        )}
                        <span>
                          {degreeLevelLabels[heroProgram.DegreeLevel] ||
                            heroProgram.DegreeLevel}
                        </span>
                      </div>

                      <span className="inline-flex items-center px-4 py-2 bg-yellow-500 text-black text-sm font-medium self-start group-hover/hero:bg-yellow-400 transition-colors">
                        Learn more
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Thumbnail cards — each with image */}
                {cardPrograms.map((program) => (
                  <Link
                    key={program.id}
                    href={`/programs/${program.Slug}`}
                    className="group/card flex-shrink-0 w-56"
                  >
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-yellow-500 transition-colors h-full flex flex-col">
                      {/* Image with college logo badge */}
                      <div className="relative aspect-[5/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <img
                          src={getProgramImage(program)}
                          alt={program.Name}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        />
                        {college.Logo && (
                          <div className="absolute top-2 right-2 bg-white p-1 shadow-sm">
                            <img
                              src={getStrapiURL(college.Logo.url)}
                              alt=""
                              className="h-4 w-4 object-contain"
                            />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover/card:text-yellow-500 transition-colors mb-1 line-clamp-2">
                          {program.Name}
                        </h4>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-auto">
                          {degreeLevelLabels[program.DegreeLevel] ||
                            program.DegreeLevel}
                          {program.Duration ? ` · ${program.Duration}` : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* View all card */}
                {programs.length > 5 && (
                  <Link
                    href={`/colleges/${college.Slug}`}
                    className="flex-shrink-0 w-48 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:border-yellow-500 transition-colors bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="text-center p-5">
                      <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                        +{programs.length - 5} more
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500">
                        View all programs
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
