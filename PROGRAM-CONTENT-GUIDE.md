# Program Content Guide

Instructions for seeding rich, detailed content for each program. Every program needs to feel like a Coursera degree page — not a brochure, not placeholder text. Real information, real numbers, real depth.

---

## Programs Status

| # | Program | Degree | documentId | Status |
|---|---------|--------|------------|--------|
| 1 | Master of Business Administration (MBA) | master | `wdkfpuc79vxuoxvyl411xl8b` | DONE |
| 2 | Master of Science in Criminal Justice | master | `f99hktrsx6e4mysaa38ni30q` | DONE |
| 3 | Master of Science in Nursing (MSN) | master | `rk65ya4ly5j9jzry76j1rqnp` | DONE |
| 4 | Master of Public Administration (MPA) | master | `vhg9pzrq3sa20ae8dtzsaj6y` | DONE |
| 5 | Bachelor of Science in Management | bachelor | `o1j15bxqc7wn2wmpq4g85bke` | DONE |
| 6 | Bachelor of Science in Criminal Justice | bachelor | `d3mb70nsg6093ieyx4gia6te` | DONE |
| 7 | Bachelor of Science in Nursing (RN to BSN) | bachelor | `x7kmg2a30rpt31qati422hg1` | DONE |
| 8 | Bachelor of Arts in Psychology | bachelor | `f8bt937s5lliyfim3xl79ol9` | DONE |
| 9 | Associate of Science in Health Info Technology | associate | `mlryl50r2kj1uvh5r5t0nxw8` | DONE |
| 10 | Certificate in Medical Coding | certificate | `dbak5kb0o4kvk15w7fxyib70` | DONE |

---

## How to Seed a Program

```bash
TOKEN="daf78d747801cc69a83032d09c0683283b027719b85519e0dad252ea6cc36f63b6cbdf6c091aaf5771bef2d5e45068b0a96070619bb0291d0bfb968081e3f3bcc33b2ddafb471574daa2a1ff7f44b0bad98096257920d903f44e323f02f6268e47a5f1a0241876da4b378e042e7fa272737f8bab49eba9747ac4d1257c498429"
DOC_ID="<documentId from table above>"

curl -s -X PUT "http://localhost:1337/api/programs/${DOC_ID}?status=published" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{ "data": { ... } }'
```

---

## Fields To Populate

Every program needs ALL of the following. No field should be left empty. No field should have placeholder text. Every field should have content that a real student would find genuinely useful.

### 1. Text Fields (already exist, may need enriching)

- **Overview** (blocks) — 3-5 paragraphs minimum. Explain what the program is, who it's for, how it's delivered, what makes it different from similar programs at other schools. Include a "Why This Program Stands Out" section with bullet points. Include a "Who This Program Is For" section describing ideal candidates in specific terms (not "students who want to learn"). Use ASU Albany's actual strengths — affordable tuition, SACSCOC accreditation, working professional focus, specific faculty expertise, alumni network in Georgia.

- **WhatYouWillLearn** (blocks) — Organized by skill category with headings. Not a flat list. Group into 3-4 categories (e.g., "Analytical Skills", "Leadership Skills", "Specialized Expertise"). Each item should be a full sentence describing a concrete capability, not a vague phrase. 8-15 items total.

- **SkillsYouWillGain** (text, comma-separated) — 10-15 specific, searchable skills. Not generic ("communication") — specific ("Evidence-Based Practice", "HIPAA Compliance", "Grant Writing for Federal Programs").

- **Curriculum** (blocks) — Detailed description of concentrations/tracks/electives that supplements the structured Courses field. Explain the structure, prerequisites, sequencing, capstone requirements.

- **AdmissionRequirements** (blocks) — Organized with headings: "Academic Requirements", "Application Materials" (numbered list with what each item should contain), "International Applicants", "Application Deadlines" with exact dates and priority/final distinction. Be specific about GPA thresholds, test score waivers, conditional admission criteria.

- **CareerOutcomes** (blocks) — 2-3 paragraphs of narrative about career trajectory, then detailed by sector. Include the employer network paragraph naming real organizations in Georgia/Southeast where alumni work.

- **Testimonials** (blocks) — Fallback only. Use TestimonialItems instead.

- **FAQ** (blocks) — 5-7 questions minimum. Each answer should be a full paragraph (3-5 sentences), not a one-liner. Cover: "Do I need a specific bachelor's degree?", "Can I work full-time?", "Is [test] required?", "When can I start?", "How much does it cost total?", "Can I switch tracks/concentrations?", plus 1-2 program-specific questions.

### 2. Structured Components (NEW — these create the visual richness)

#### Highlights (repeatable: program.highlight-item)
- **What**: 5-6 key differentiators that make this program stand out
- **Fields**: `Title` (short, punchy — 3-6 words), `Description` (2-3 sentences explaining why this matters to a student)
- **Content guide**: Think "What would make a student choose THIS program over the same degree at another school?" Specific advantages: accreditation, faculty background, cost, flexibility, career outcomes, alumni network, concentrations, capstone format, GRE waiver policy, employer partnerships.
- **DO NOT write**: Generic statements like "Quality education" or "Expert faculty". Every highlight must be specific and verifiable.

#### Stats (repeatable: program.stat-highlight)
- **What**: 5-6 key numbers/metrics displayed as big visual callouts
- **Fields**: `Value` (the number — "$18,540", "36", "100%", "2 years", "No GRE"), `Label` (what it measures — "Total cost for GA residents", "Credit hours"), `Description` (1-2 sentence context)
- **Content guide**: Include total program cost (for GA residents), credit hours, number of concentrations/tracks, online percentage, typical completion time, GRE policy. Make the Value short enough to display large. The Description adds the nuance.
- **Use real numbers from ASU's published tuition rates**: In-state ~$3,342/semester undergrad, ~$4,635/semester graduate. Out-of-state ~$11,712/semester undergrad, ~$16,320/semester graduate.

#### Courses (repeatable: program.course-item)
- **What**: Individual courses in the program displayed as expandable cards
- **Fields**: `Code` (e.g., "CRJU 5100"), `Title` (course name), `Description` (2-4 sentences — what the course covers, what students do, what skills they build), `Credits` (usually "3")
- **Content guide**: List ALL core courses (typically 6). List concentration/specialization courses (at least the first concentration's courses in full — 4-6 courses). For other concentrations, describe in the Curriculum blocks field. Each description should explain what students actually DO in the course — not just the topic. Mention specific methodologies, tools, frameworks, projects.
- **Invent realistic course codes**: Use the department prefix (NURS, MGMT, PUBA, PSYC, etc.) + 4-digit number. Undergraduate: 3000-4000 level. Graduate: 5000-6000 level.

#### TestimonialItems (repeatable: program.testimonial-item)
- **What**: 2-3 student/alumni testimonials displayed as featured cards with photos
- **Fields**: `Name` (full name with credentials if applicable), `Role` (current title + organization + graduation year), `Quote` (3-5 sentences — specific, detailed, mentioning courses/experiences/outcomes), `Photo` (media — leave null for now, frontend shows initial)
- **Content guide**: Each testimonial must feel like a real person. Include their background BEFORE the program, what specifically helped them (name a course, a project, a professor's approach), and a concrete outcome AFTER (promotion, new job, project they led, salary change, certification passed). Use realistic Georgia-area employers and organizations. Vary the backgrounds — one current professional, one career changer, one who continued to a higher degree.
- **DO NOT write**: Generic praise like "Great program, learned a lot." Every quote must have a specific, verifiable detail.

#### CareerPaths (repeatable: program.career-path)
- **What**: 6-8 specific job titles with salary ranges displayed as dark cards
- **Fields**: `Title` (job title), `SalaryRange` (e.g., "$85,000 – $110,000"), `Description` (1-2 sentences — what the role involves and how this degree qualifies you)
- **Content guide**: Use realistic salary ranges from BLS (Bureau of Labor Statistics) data for the Southeast/Georgia region. Include both entry-level post-degree roles and advanced roles attainable in 5+ years. For each career, explain HOW this specific degree (not just any degree) qualifies someone. Include at least one "pathway" career (e.g., "Pathway to doctoral programs").
- **DO NOT write**: Inflated salary numbers. Georgia salaries are typically 10-15% below national medians. Be honest — that builds trust.

### 3. Media Fields

Each program needs images uploaded via Strapi Admin panel:
- **Image** — Card thumbnail (used on /programs listing and homepage). Aspect ratio ~16:9.
- **BannerImage** — Hero background on program detail page. Wide, atmospheric. Aspect ratio ~3:1.
- **OverviewImage** — Shown alongside overview text. Students studying, campus life, professional setting relevant to the field.
- **CurriculumImage** — Shown alongside curriculum. Classroom, lab, library, online learning setup.
- **AdmissionImage** — Shown alongside admissions. Application process, campus, graduation.
- **CareerImage** — Shown alongside careers. Professionals working in the field.

Until images are uploaded, the frontend uses Unsplash fallbacks mapped by FieldOfStudy.

---

## Content Quality Checklist

Before marking a program DONE, verify:

- [ ] Overview has 3+ paragraphs plus "Why This Program Stands Out" and "Who This Program Is For"
- [ ] WhatYouWillLearn has 3+ category headings with 3-5 items each
- [ ] SkillsYouWillGain has 10+ specific skills
- [ ] 5-6 Highlights with specific, non-generic differentiators
- [ ] 5-6 Stats with real numbers and context descriptions
- [ ] 6+ Courses with codes, full descriptions, and credits
- [ ] Curriculum blocks describe the full program structure including all concentrations/tracks
- [ ] AdmissionRequirements has Academic Requirements, Application Materials (numbered), International Applicants, Deadlines
- [ ] CareerOutcomes has narrative paragraphs plus employer network
- [ ] 6-8 CareerPaths with realistic salary ranges and descriptions
- [ ] 2-3 TestimonialItems with specific, detailed quotes
- [ ] 5-7 FAQ items with full paragraph answers
- [ ] All text reads naturally — no placeholder feel, no repetitive phrasing across programs
- [ ] Tuition numbers are consistent with ASU's published rates
- [ ] Salary ranges are realistic for Georgia/Southeast region

---

## Reference: ASU Albany Facts

Use these consistently across all programs:

- **University**: Albany State University (founded 1903)
- **System**: University System of Georgia
- **Location**: Albany, Georgia
- **Type**: Public, HBCU (Historically Black College/University)
- **Accreditation**: SACSCOC (Southern Association of Colleges and Schools Commission on Colleges)
- **Colleges**: College of Arts and Sciences, College of Business Education and Professional Studies (AACSB accredited), Darton College of Health Professions
- **Graduate tuition (in-state)**: ~$4,635/semester (9 credit hours)
- **Graduate tuition (out-of-state)**: ~$16,320/semester
- **Undergraduate tuition (in-state)**: ~$3,342/semester
- **Undergraduate tuition (out-of-state)**: ~$11,712/semester
- **Online delivery**: ASU Global
- **Key employers in region**: Phoebe Putney Health System, Marine Corps Logistics Base Albany, Procter & Gamble, Georgia Department of Corrections, Albany Police Department, Dougherty County government, Georgia Bureau of Investigation
- **Graduate admissions URL**: https://www.asurams.edu/enrollment-management/graduate-admissions/index.php
- **Undergraduate admissions URL**: https://www.asurams.edu/enrollment-management/undergraduate-admissions/index.php
