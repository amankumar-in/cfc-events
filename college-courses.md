Brainstorming: College & Program Showcase Feature

  What I've Reviewed

  1. Screenshot 1 (Udemy/Google): Google's branded row on Udemy homepage — logo + program
   name + rating + individual courses displayed as cards. Eye-catching, immediately tells
   students "Google offers this."
  2. Screenshot 2 (Coursera degrees listing): All programs from all universities,
  filterable by degree level, subject, university. Each card shows: university logo,
  degree name, degree type, ratings. Organized by category sections.
  3. Screenshot 3 (Coursera program detail): Rich detail page with: degree overview,
  "what you'll learn", skills, tuition breakdown, admission requirements, career
  outcomes, program structure, testimonials, FAQs. Tabs for deeper sub-sections.
  4. ASU Albany website: Programs listed as plain text names with 1-3 sentence
  descriptions. No cost, no duration, no admission info, no outcomes. The Biology page is
   similarly sparse — mentions labs and career paths vaguely but zero actionable data.
  5. Current CFC Events state: You have Sponsors (with Tier/Logo/Featured),
  Organizations, Events, Sessions, Speakers. The homepage has a static OnlinePrograms Q&A
   component and a hardcoded CollegeMarquee with 24 college names. No dynamic college or
  program models exist.

  ---
  My Recommendation: New Content Types (Don't Reuse Sponsor)

  Why not reuse Sponsor for colleges:
  - Sponsor has Tier (Platinum/Gold/Silver) — irrelevant to colleges
  - A college needs fundamentally different fields (accreditation, location, type,
  programs)
  - Mixing them makes the Strapi admin confusing — "is this a sponsor or a college?"
  - A college could also be a sponsor independently (ASU sponsors your event AND is
  showcased as a college)
  - Sponsor → Event is the only relationship; College needs College → Programs → Event

  Proposed Data Model:

  1. College (new content type)

  ┌──────────────────┬───────────────────────┬──────────────────────────────────┐
  │      Field       │         Type          │             Purpose              │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ Name             │ string (required)     │ "Albany State University"        │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ Slug             │ uid                   │ URL-friendly name                │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ ShortName        │ string                │ "ASU Albany" (for cards/chips)   │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ Logo             │ media                 │ University logo                  │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ BannerImage      │ media                 │ Hero image for college page      │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ ShortDescription │ text                  │ One-liner for cards              │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ Description      │ blocks (rich text)    │ Full about section               │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ Website          │ string                │ College website URL              │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ City             │ string                │ "Albany, Georgia"                │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ Country          │ string                │ "United States"                  │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ Type             │ enum: public, private │ Institution type                 │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ Accreditation    │ text                  │ Accreditation body names         │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ Featured         │ boolean               │ Show on homepage featured row    │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ SortOrder        │ integer               │ Display order                    │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ Relations        │                       │                                  │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ programs         │ oneToMany → Program   │ Programs offered                 │
  ├──────────────────┼───────────────────────┼──────────────────────────────────┤
  │ events           │ manyToMany → Event    │ Which events they participate in │
  └──────────────────┴───────────────────────┴──────────────────────────────────┘

  2. Program (new content type)

  This is the big one — inspired by what Coursera does right and what ASU Albany does
  wrong:

  ┌────────────────────────────┬──────────────────────────┬─────────────────────────┐
  │           Field            │           Type           │         Purpose         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Core                       │                          │                         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Name                       │ string (required)        │ "Master of Science in   │
  │                            │                          │ Management"             │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Slug                       │ uid                      │ URL-friendly            │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ ShortDescription           │ text                     │ Card-level summary      │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Image                      │ media                    │ Program card image      │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ BannerImage                │ media                    │ Detail page hero        │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Classification             │                          │                         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │                            │ enum: associate,         │                         │
  │ DegreeLevel                │ bachelor, master,        │ Filtering               │
  │                            │ doctorate, certificate,  │                         │
  │                            │ diploma                  │                         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ FieldOfStudy               │ string                   │ "Business & Management" │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Tags                       │ text (or JSON)           │ Searchable tags         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Key Facts (what Coursera   │                          │                         │
  │ nails)                     │                          │                         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Duration                   │ string                   │ "2 years" / "18 months" │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Format                     │ enum: online, on-campus, │ Delivery mode           │
  │                            │  hybrid                  │                         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Language                   │ string                   │ "English"               │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Credits                    │ string                   │ "36 credit hours"       │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ StartDate                  │ string                   │ "Fall 2026" (next       │
  │                            │                          │ intake)                 │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ ApplicationDeadline        │ string                   │ "June 30, 2026"         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Cost (critical missing     │                          │                         │
  │ piece on college sites)    │                          │                         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Tuition                    │ string                   │ "$15,000 total" or      │
  │                            │                          │ "$500/credit"           │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ FinancialAidInfo           │ text                     │ Scholarships, payment   │
  │                            │                          │ plans                   │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Rich Content Sections      │                          │                         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Overview                   │ blocks (rich text)       │ Detailed program        │
  │                            │                          │ overview                │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ WhatYouWillLearn           │ blocks (rich text)       │ Learning outcomes       │
  │                            │                          │ (bullet-friendly)       │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ SkillsYouWillGain          │ text                     │ Comma-separated or      │
  │                            │                          │ structured              │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Curriculum                 │ blocks (rich text)       │ Course list / program   │
  │                            │                          │ structure               │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ AdmissionRequirements      │ blocks (rich text)       │ GPA, tests, documents   │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ CareerOutcomes             │ blocks (rich text)       │ Jobs, salary ranges,    │
  │                            │                          │ placement rates         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Testimonials               │ blocks (rich text)       │ Student quotes          │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ FAQ                        │ blocks (rich text)       │ Program-specific FAQs   │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Display                    │                          │                         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Featured                   │ boolean                  │ Highlight on            │
  │                            │                          │ homepage/listing        │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ SortOrder                  │ integer                  │ Display ordering        │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ Relations                  │                          │                         │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │ college                    │ manyToOne → College      │ Which college offers    │
  │                            │                          │ this                    │
  ├────────────────────────────┼──────────────────────────┼─────────────────────────┤
  │                            │                          │ Which events feature    │
  │ events                     │ manyToMany → Event       │ this program (drives    │
  │                            │                          │ CTA)                    │
  └────────────────────────────┴──────────────────────────┴─────────────────────────┘

  ---
  Relationship Model
                                                                                         
  College ──(1:M)──► Program
  College ──(M:M)──► Event                                                               
  Program ──(M:M)──► Event                                                               
                                                                                         
  Event has: sponsors, colleges, programs                                                
  College has: programs, events
  Program has: college, events                                                           
                                                                                         
  The CTA flow: When a student views a program, the events relation determines which     
  event registration page the "Sign Up" button links to. If ASU is participating in "CFC 
  Education Fair 2026", that event is linked to both the college and its programs → the  
  CTA says "Meet ASU at CFC Education Fair 2026 → Register Now."

  ---
  Frontend Pages
                                                                                         
  ┌──────────────────┬──────────────────────────────────────┬────────────────────────┐
  │      Route       │               Purpose                │      Inspiration       │   
  ├──────────────────┼──────────────────────────────────────┼────────────────────────┤
  │ Homepage         │ Featured college row (like Google on │ Screenshot 1           │   
  │                  │  Udemy) + Featured programs grid     │                        │
  ├──────────────────┼──────────────────────────────────────┼────────────────────────┤   
  │                  │ All programs from all colleges,      │ Screenshot 2 (Coursera │
  │ /programs        │ filterable by degree level, field,   │  degrees listing)      │   
  │                  │ college                              │                        │
  ├──────────────────┼──────────────────────────────────────┼────────────────────────┤   
  │ /programs/[slug] │ Rich program detail page with all    │ Screenshot 3 (Coursera │
  │                  │ facts, tabbed sections               │  detail)               │   
  ├──────────────────┼──────────────────────────────────────┼────────────────────────┤
  │ /colleges/[slug] │ College profile with all their       │ Like a Coursera        │   
  │                  │ programs listed                      │ university page        │   
  └──────────────────┴──────────────────────────────────────┴────────────────────────┘
                                                                                         
  Homepage Integration

  Replace the current static OnlinePrograms component and hardcoded CollegeMarquee with: 
   
  1. Featured College Row (like Google on Udemy): ASU logo + "Explore Programs from      
  Albany State University" + 3-4 program cards scrollable horizontally
  2. Featured Programs Grid: Top programs across all colleges, each card showing: college
   logo, program name, degree level, duration, format, tuition range                     
  3. Keep the existing Q&A component but make it contextual
                                                                                         
  ---             
  What Makes This Scalable                                                               
                                                                                         
  - Adding a new college: Create College entry in Strapi, add programs, link to events →
  automatically appears on frontend                                                      
  - Featured control: Toggle Featured on any college/program to spotlight them on
  homepage                                                                               
  - Multi-event support: Same college/program can participate in multiple events
  - CTA routing: Program → Event relation drives where "Register" goes                   
  - Separation of concerns: Sponsors remain sponsors (financial backers), Colleges are   
  educational partners (content contributors)    


   Refined Decisions                                                                      
                  
  Based on your feedback:

  1. Tabs on program detail — Yes. Tabs like: Overview | Curriculum | Admissions |       
  Careers | FAQ. Visitor lands on Overview, can jump to any section.
  2. Faculty as a repeatable component inside College — No separate model. The College   
  content type will have a Faculty repeatable component with fields: Name, Image,        
  Designation, Subject/Department. This keeps faculty management inside the college entry
   itself.                                                                               
  3. Dual CTA — Primary CTA always: "Register for [Event Name]" (driven by Program →
  Event relation). Optional secondary CTA: "Apply at [College Name]" (driven by college's
   Website field or a dedicated ApplicationURL field on Program). If not provided, only
  primary shows.                                                                         
  4. No /colleges listing page — College pages exist at /colleges/[slug] but no listing
  page for now. Colleges are discoverable through homepage featured row and program      
  cards.
  5. Rich seed content — I'll create a seed script with genuinely rich content for all   
  ASU Global programs. Not placeholder text — real descriptions, realistic tuition       
  figures, actual career outcomes, proper curriculum breakdowns.
                                                                                         
  ---             
  Moving Data from Local to Remote Strapi
                                         
  Three practical options:
                                                                                         
  Option A: API Seed Script (Recommended)
                                                                                         
  Write a Node.js script that creates entries via Strapi's REST API. You point it at any 
  Strapi instance (local or production) via an environment variable:
                                                                                         
  # Local         
  STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=xxx node seed-colleges.js                
                                                                                         
  # Production                                                                           
  STRAPI_URL=https://your-production-strapi.com STRAPI_TOKEN=xxx node seed-colleges.js   
                                                                                         
  Pros: Works against any instance, version-controlled, repeatable, handles relations    
  properly, can include image uploads.                                                   
  Cons: Need an API token on production.                                                 
                                                                                         
  Option B: Strapi Transfer (built-in since v4.6)                                        
                                                                                         
  # Export from local                                                                    
  npx strapi transfer --to https://production-strapi.com
  But this transfers everything — not selective.                                         
                                                                                         
  Option C: Strapi Import/Export Plugin                                                  
                                                                                         
  Install strapi-plugin-import-export-entries. Export specific content types as JSON from
   local admin, import in production admin via UI.
                                                                                         
  My recommendation: Option A — a seed script gives you full control, is selective (only 
  colleges + programs), is repeatable, and lives in your repo.
                                                                                         
  ---             
  Implementation Plan
                                                                                         
  1. Backend: Create College and Program content types + Faculty repeatable component in
  Strapi                                                                                 
  2. Backend: Add colleges and programs relations to the Event model
  3. Seed Script: Rich ASU data for all 20 programs with genuine content                 
  4. Frontend API: lib/api/colleges.ts and lib/api/programs.ts                           
  5. Frontend Pages:                                                                     
    - /programs — listing page with filters                                              
    - /programs/[slug] — tabbed detail page                                              
    - /colleges/[slug] — college profile                                                 
  6. Homepage: Featured college row + featured programs section (replace static          
  components)                                    