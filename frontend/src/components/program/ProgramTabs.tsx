"use client";

import { useState, type ReactNode } from "react";
import { getStrapiURL } from "@/lib/api/api-config";
import { getProgramSectionImage } from "@/lib/utils/program-images";
import {
  BookOpen,
  Briefcase,
  CheckCircle,
  FileText,
  HelpCircle,
  MessageSquare,
  Target,
} from "lucide-react";

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

interface HighlightItem {
  id?: number;
  Title: string;
  Description: string;
}

interface CourseItem {
  id?: number;
  Code?: string;
  Title: string;
  Description: string;
  Credits?: string;
}

interface TestimonialItem {
  id?: number;
  Name: string;
  Role: string;
  Quote: string;
  Photo?: { url: string } | null;
}

interface StatHighlight {
  id?: number;
  Value: string;
  Label: string;
  Description?: string;
}

interface CareerPath {
  id?: number;
  Title: string;
  SalaryRange?: string;
  Description?: string;
}

// ── Block Renderer ────────────────────────────────────────────────────

function renderBlockText(children: BlockChild[]): ReactNode[] {
  return children.map((child, i) => {
    if (child.type === "list-item") {
      return (
        <li key={i}>
          {child.children ? renderBlockText(child.children) : child.text}
        </li>
      );
    }
    let node: ReactNode = child.text ?? "";
    if (child.bold) node = <strong key={i}>{node}</strong>;
    if (child.italic) node = <em key={i}>{node}</em>;
    return node;
  });
}

function renderBlocks(blocks: Block[] | undefined | null) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;

  return blocks.map((block, i) => {
    const content = block.children ? renderBlockText(block.children) : null;

    if (block.type === "heading") {
      return (
        <h3
          key={i}
          className="text-lg font-bold mt-6 mb-3 text-gray-900 dark:text-white"
        >
          {content}
        </h3>
      );
    }

    if (block.type === "list") {
      return (
        <div key={i} className="mb-6 space-y-3">
          {block.children?.map((item, j) => (
            <div key={j} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.children ? renderBlockText(item.children) : item.text}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <p key={i} className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
        {content}
      </p>
    );
  });
}

// Section images now handled by getProgramSectionImage from program-images.ts

// ── Component ─────────────────────────────────────────────────────────

interface ProgramTabsProps {
  program: {
    Slug?: string;
    Overview?: Block[];
    OverviewImage?: { url: string } | null;
    WhatYouWillLearn?: Block[];
    SkillsYouWillGain?: string;
    Highlights?: HighlightItem[];
    Stats?: StatHighlight[];
    Curriculum?: Block[];
    CurriculumImage?: { url: string } | null;
    Courses?: CourseItem[];
    AdmissionRequirements?: Block[];
    AdmissionImage?: { url: string } | null;
    CareerOutcomes?: Block[];
    CareerImage?: { url: string } | null;
    CareerPaths?: CareerPath[];
    Testimonials?: Block[];
    TestimonialItems?: TestimonialItem[];
    FAQ?: Block[];
  };
}

interface Tab {
  id: string;
  label: string;
  icon: typeof BookOpen;
  content: ReactNode;
}

export function ProgramTabs({ program }: ProgramTabsProps) {
  const slug = program.Slug || "";
  const tabs: Tab[] = [];

  const hasHighlights = program.Highlights && program.Highlights.length > 0;
  const hasStats = program.Stats && program.Stats.length > 0;
  const hasCourses = program.Courses && program.Courses.length > 0;
  const hasTestimonialItems = program.TestimonialItems && program.TestimonialItems.length > 0;
  const hasCareerPaths = program.CareerPaths && program.CareerPaths.length > 0;

  // ── OVERVIEW TAB ────────────────────────────────────────────
  const hasOverview =
    (program.Overview && program.Overview.length > 0) ||
    (program.WhatYouWillLearn && program.WhatYouWillLearn.length > 0) ||
    program.SkillsYouWillGain ||
    hasHighlights ||
    hasStats;

  if (hasOverview) {
    tabs.push({
      id: "overview",
      label: "Overview",
      icon: BookOpen,
      content: (
        <>
          {/* Overview text + image split */}
          {program.Overview && program.Overview.length > 0 && (
            <div className="mb-14">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3">
                  <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Program Overview
                  </h2>
                  {renderBlocks(program.Overview)}
                </div>
                <div className="lg:col-span-2">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getProgramSectionImage(slug, "overview", program.OverviewImage)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats — blue full-width section */}
          {hasStats && (
            <div className="bg-gray-900 text-white p-8 md:p-10 mb-14 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {program.Stats!.map((stat, i) => (
                  <div key={stat.id || i} className="text-center">
                    <p className="text-3xl md:text-4xl font-bold text-yellow-500 mb-1">
                      {stat.Value}
                    </p>
                    <p className="text-sm font-medium text-white mb-1">
                      {stat.Label}
                    </p>
                    {stat.Description && (
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {stat.Description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What sets this program apart — highlight grid */}
          {hasHighlights && (
            <div className="mb-14">
              <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                What Sets This Program Apart
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {program.Highlights!.map((item, i) => (
                  <div
                    key={item.id || i}
                    className="flex items-start gap-4 p-5 border border-gray-200 dark:border-gray-700"
                  >
                    <CheckCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                        {item.Title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.Description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What You'll Learn */}
          {program.WhatYouWillLearn && program.WhatYouWillLearn.length > 0 && (
            <div className="mb-14 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  What You Will Learn
                </h2>
              </div>
              {renderBlocks(program.WhatYouWillLearn)}
            </div>
          )}

          {/* Skills */}
          {program.SkillsYouWillGain && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Skills You Will Gain
              </h2>
              <div className="flex flex-wrap gap-2">
                {program.SkillsYouWillGain.split(",").map((skill) => (
                  <span
                    key={skill.trim()}
                    className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ),
    });
  }

  // ── CURRICULUM TAB ──────────────────────────────────────────
  const hasCurriculum =
    (program.Curriculum && program.Curriculum.length > 0) || hasCourses;

  if (hasCurriculum) {
    tabs.push({
      id: "curriculum",
      label: "Curriculum",
      icon: FileText,
      content: (
        <>
          {/* Course cards */}
          {hasCourses && (
            <div className="mb-14">
              <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Program Courses
              </h2>
              <div className="space-y-0">
                {program.Courses!.map((course, i) => (
                  <div
                    key={course.id || i}
                    className="border border-gray-200 dark:border-gray-700 -mt-px first:mt-0 p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          {course.Code && (
                            <span className="text-xs font-bold bg-yellow-500 text-black px-2 py-0.5">
                              {course.Code}
                            </span>
                          )}
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {course.Title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {course.Description}
                        </p>
                      </div>
                      {course.Credits && (
                        <span className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {course.Credits} credits
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional curriculum info from blocks */}
          {program.Curriculum && program.Curriculum.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-3">
                {!hasCourses && (
                  <>
                    <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Program Curriculum
                    </h2>
                  </>
                )}
                {hasCourses && (
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Concentration Details
                  </h2>
                )}
                {renderBlocks(program.Curriculum)}
              </div>
              <div className="lg:col-span-2">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={getProgramSectionImage(slug, "curriculum", program.CurriculumImage)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 w-12 h-12 bg-blue-600" />
                </div>
              </div>
            </div>
          )}
        </>
      ),
    });
  }

  // ── ADMISSIONS TAB ──────────────────────────────────────────
  if (program.AdmissionRequirements && program.AdmissionRequirements.length > 0) {
    tabs.push({
      id: "admissions",
      label: "Admissions",
      icon: FileText,
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3">
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Admission Requirements
            </h2>
            {renderBlocks(program.AdmissionRequirements)}
          </div>
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/3] overflow-hidden mb-6">
              <img
                src={getProgramSectionImage(slug, "admissions", program.AdmissionImage)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 p-6">
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                Application Tip
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Start gathering documents early. Strong recommendation letters
                from supervisors in criminal justice carry significant weight.
                Your statement of purpose should connect your professional
                experience to your chosen concentration.
              </p>
            </div>
          </div>
        </div>
      ),
    });
  }

  // ── CAREERS TAB ─────────────────────────────────────────────
  const hasCareers =
    (program.CareerOutcomes && program.CareerOutcomes.length > 0) ||
    hasCareerPaths;

  if (hasCareers) {
    tabs.push({
      id: "careers",
      label: "Careers",
      icon: Briefcase,
      content: (
        <>
          {/* Career overview text + image */}
          {program.CareerOutcomes && program.CareerOutcomes.length > 0 && (
            <div className="mb-14">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3">
                  <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Career Outcomes
                  </h2>
                  {renderBlocks(program.CareerOutcomes)}
                </div>
                <div className="lg:col-span-2">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getProgramSectionImage(slug, "careers", program.CareerImage)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-12 h-12 bg-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Career path cards — dark section */}
          {hasCareerPaths && (
            <div className="bg-gray-900 text-white p-8 md:p-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold mb-8">Career Paths & Salary Ranges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {program.CareerPaths!.map((career, i) => (
                  <div
                    key={career.id || i}
                    className="bg-gray-800 border border-gray-700 p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-white">{career.Title}</h3>
                      {career.SalaryRange && (
                        <span className="text-sm font-bold text-yellow-500 whitespace-nowrap">
                          {career.SalaryRange}
                        </span>
                      )}
                    </div>
                    {career.Description && (
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {career.Description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ),
    });
  }

  // ── TESTIMONIALS TAB ────────────────────────────────────────
  const hasTestimonials =
    hasTestimonialItems ||
    (program.Testimonials && program.Testimonials.length > 0);

  if (hasTestimonials) {
    tabs.push({
      id: "testimonials",
      label: "Student Experience",
      icon: MessageSquare,
      content: (
        <div>
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            What Students Say
          </h2>

          {/* Structured testimonials */}
          {hasTestimonialItems && (
            <div className="space-y-6 mb-10">
              {program.TestimonialItems!.map((item, i) => (
                <div
                  key={item.id || i}
                  className="grid grid-cols-1 md:grid-cols-5 gap-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 md:p-8"
                >
                  {/* Photo or initial */}
                  <div className="md:col-span-1 flex md:block items-center gap-4">
                    <div className="w-16 h-16 md:w-full md:aspect-square bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                      {item.Photo?.url ? (
                        <img
                          src={getStrapiURL(item.Photo.url)}
                          alt={item.Name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl md:text-4xl font-bold text-gray-300 dark:text-gray-600">
                            {item.Name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="md:mt-3">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {item.Name}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500">
                        {item.Role}
                      </p>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="md:col-span-4 relative">
                    <div className="absolute top-0 right-0 text-yellow-500 opacity-10">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg italic">
                      &ldquo;{item.Quote}&rdquo;
                    </p>
                    <div className="w-8 h-0.5 bg-yellow-500 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fallback: block-based testimonials */}
          {!hasTestimonialItems &&
            program.Testimonials &&
            program.Testimonials.length > 0 && (
              <div className="space-y-6">
                {program.Testimonials.map((block, i) => (
                  <div
                    key={i}
                    className="p-6 border-l-4 border-l-yellow-500 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                      {block.children ? renderBlockText(block.children) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      ),
    });
  }

  // ── FAQ TAB ─────────────────────────────────────────────────
  if (program.FAQ && program.FAQ.length > 0) {
    tabs.push({
      id: "faq",
      label: "FAQ",
      icon: HelpCircle,
      content: (
        <div>
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-0">{renderFaqBlocks(program.FAQ)}</div>
        </div>
      ),
    });
  }

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "overview");
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  if (tabs.length === 0) return null;

  return (
    <div>
      {/* Tab navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-10">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-yellow-500 text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-96">{active?.content}</div>
    </div>
  );
}

// ── FAQ renderer ──────────────────────────────────────────────────────

function renderFaqBlocks(blocks: Block[]) {
  const items: { question: ReactNode; answer: ReactNode[] }[] = [];
  let currentQuestion: ReactNode | null = null;
  let currentAnswers: ReactNode[] = [];

  blocks.forEach((block, i) => {
    if (block.type === "heading") {
      if (currentQuestion) {
        items.push({ question: currentQuestion, answer: currentAnswers });
      }
      currentQuestion = block.children ? renderBlockText(block.children) : null;
      currentAnswers = [];
    } else {
      const content = block.children ? renderBlockText(block.children) : null;
      currentAnswers.push(
        <p key={i} className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {content}
        </p>
      );
    }
  });

  if (currentQuestion) {
    items.push({ question: currentQuestion, answer: currentAnswers });
  }

  return items.map((item, i) => (
    <div
      key={i}
      className="border border-gray-200 dark:border-gray-700 -mt-px first:mt-0 p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <span>{item.question}</span>
      </h3>
      <div className="ml-8">{item.answer}</div>
    </div>
  ));
}
