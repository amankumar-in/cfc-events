"use client";

import { useState, useRef, useEffect } from "react";
import { getStrapiURL } from "@/lib/api/api-config";
import { Chip } from "@/components/ui/Chip";
import { Clock, ChevronDown, X, GraduationCap, MapPin, Monitor } from "lucide-react";
import Link from "next/link";
import { getProgramImage } from "@/lib/utils/program-images";

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
  Image?: { url: string } | null;
  college?: College;
}

interface Props {
  programs: Program[];
  degreeLevels: string[];
  fieldsOfStudy: string[];
  colleges: College[];
  degreeLevelLabels: Record<string, string>;
  formatLabels: Record<string, string>;
  stats: {
    totalPrograms: number;
    totalColleges: number;
    onlineCount: number;
  };
}

// ── Dropdown hook ─────────────────────────────────────────────────────

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return { open, setOpen, ref };
}

// ── Component ─────────────────────────────────────────────────────────

export function ProgramFilters({
  programs,
  degreeLevels,
  fieldsOfStudy,
  colleges,
  degreeLevelLabels,
  formatLabels,
  stats,
}: Props) {
  const [selectedDegree, setSelectedDegree] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);

  const degreeDropdown = useDropdown();
  const fieldDropdown = useDropdown();
  const collegeDropdown = useDropdown();

  const filtered = programs.filter((p) => {
    if (selectedDegree && p.DegreeLevel !== selectedDegree) return false;
    if (
      selectedFields.length > 0 &&
      !selectedFields.includes(p.FieldOfStudy)
    )
      return false;
    if (selectedCollege && p.college?.id !== selectedCollege) return false;
    return true;
  });

  const hasActiveFilter =
    selectedDegree || selectedFields.length > 0 || selectedCollege;

  function toggleField(field: string) {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      {/* Filter + Stats bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left — Filters */}
            <div className="flex items-center gap-3 overflow-x-auto min-w-0">
              {/* Degree Level dropdown */}
              <div className="relative flex-shrink-0" ref={degreeDropdown.ref}>
                <button
                  onClick={() => degreeDropdown.setOpen(!degreeDropdown.open)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border whitespace-nowrap transition-colors ${
                    selectedDegree
                      ? "bg-yellow-500 text-black border-yellow-500"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-yellow-500"
                  }`}
                >
                  <span>
                    {selectedDegree
                      ? degreeLevelLabels[selectedDegree] || selectedDegree
                      : "Degree Level"}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${degreeDropdown.open ? "rotate-180" : ""}`} />
                </button>
                {degreeDropdown.open && (
                  <div className="absolute z-20 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <button onClick={() => { setSelectedDegree(null); degreeDropdown.setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${!selectedDegree ? "font-bold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>All Levels</button>
                    {degreeLevels.map((level) => (
                      <button key={level} onClick={() => { setSelectedDegree(level); degreeDropdown.setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedDegree === level ? "font-bold text-yellow-600 dark:text-yellow-500" : "text-gray-600 dark:text-gray-400"}`}>
                        {degreeLevelLabels[level] || level}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Field of Study multi-select dropdown */}
              <div className="relative flex-shrink-0" ref={fieldDropdown.ref}>
                <button
                  onClick={() => fieldDropdown.setOpen(!fieldDropdown.open)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border whitespace-nowrap transition-colors ${
                    selectedFields.length > 0
                      ? "bg-yellow-500 text-black border-yellow-500"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-yellow-500"
                  }`}
                >
                  <span>
                    {selectedFields.length === 0
                      ? "Field of Study"
                      : selectedFields.length === 1
                        ? selectedFields[0]
                        : `${selectedFields.length} fields`}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${fieldDropdown.open ? "rotate-180" : ""}`} />
                </button>
                {fieldDropdown.open && (
                  <div className="absolute z-20 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg max-h-64 overflow-y-auto">
                    {fieldsOfStudy.map((field) => {
                      const isSelected = selectedFields.includes(field);
                      return (
                        <button key={field} onClick={() => toggleField(field)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3">
                          <span className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${isSelected ? "bg-yellow-500 border-yellow-500" : "border-gray-300 dark:border-gray-600"}`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            )}
                          </span>
                          <span className={isSelected ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}>{field}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* University dropdown (only if multiple) */}
              {colleges.length > 1 && (
                <div className="relative flex-shrink-0" ref={collegeDropdown.ref}>
                  <button
                    onClick={() => collegeDropdown.setOpen(!collegeDropdown.open)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border whitespace-nowrap transition-colors ${
                      selectedCollege
                        ? "bg-yellow-500 text-black border-yellow-500"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-yellow-500"
                    }`}
                  >
                    <span>{selectedCollege ? (colleges.find((c) => c.id === selectedCollege)?.ShortName || colleges.find((c) => c.id === selectedCollege)?.Name || "University") : "University"}</span>
                    <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${collegeDropdown.open ? "rotate-180" : ""}`} />
                  </button>
                  {collegeDropdown.open && (
                    <div className="absolute z-20 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                      <button onClick={() => { setSelectedCollege(null); collegeDropdown.setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${!selectedCollege ? "font-bold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>All Universities</button>
                      {colleges.map((college) => (
                        <button key={college.id} onClick={() => { setSelectedCollege(college.id); collegeDropdown.setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${selectedCollege === college.id ? "font-bold text-yellow-600 dark:text-yellow-500" : "text-gray-600 dark:text-gray-400"}`}>
                          {college.Logo && <img src={getStrapiURL(college.Logo.url)} alt="" className="h-4 w-4 object-contain" />}
                          {college.ShortName || college.Name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Clear */}
              {hasActiveFilter && (
                <button
                  onClick={() => { setSelectedDegree(null); setSelectedFields([]); setSelectedCollege(null); }}
                  className="flex-shrink-0 flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-500 font-medium hover:text-yellow-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>

            {/* Right — Stats (hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <GraduationCap className="h-4 w-4 text-yellow-500" />
                <span><strong className="text-gray-900 dark:text-white">{stats.totalPrograms}</strong> Programs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 text-yellow-500" />
                <span><strong className="text-gray-900 dark:text-white">{stats.totalColleges}</strong> {stats.totalColleges === 1 ? "University" : "Universities"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Monitor className="h-4 w-4 text-yellow-500" />
                <span><strong className="text-gray-900 dark:text-white">{stats.onlineCount}</strong> Online</span>
              </div>
            </div>
          </div>

          {/* Selected field tags */}
          {selectedFields.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedFields.map((field) => (
                <button key={field} onClick={() => toggleField(field)} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-yellow-500 text-black">
                  {field}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Showing {filtered.length} of {programs.length} programs
        </p>

        {/* Program cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((program) => (
            <Link
              key={program.id}
              href={`/programs/${program.Slug}`}
              className="group block"
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-yellow-500 transition-colors h-full flex flex-col">
                {/* Program image with college logo badge */}
                <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <img
                    src={getProgramImage(program)}
                    alt={program.Name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {program.college?.Logo && (
                    <div className="absolute top-3 left-3 bg-white p-1.5 shadow-sm">
                      <img
                        src={getStrapiURL(program.college.Logo.url)}
                        alt={program.college.Name}
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* College name */}
                  {program.college && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                      {program.college.ShortName || program.college.Name}
                    </p>
                  )}

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors mb-2">
                    {program.Name}
                  </h3>

                  <div className="flex items-start gap-2 mb-3">
                    <Chip
                      variant={program.Featured ? "primary" : "secondary"}
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

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-2">
                    {program.ShortDescription}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    {program.Duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{program.Duration}</span>
                      </div>
                    )}
                    {program.Tuition && (
                      <div className="flex items-center gap-1 truncate max-w-[200px]">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {program.Tuition.split("/")[0].trim()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              No programs match your filters
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filter criteria
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
