/**
 * Seed script for College and Program data.
 *
 * Usage:
 *   STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=<your-api-token> node seed-colleges.js
 *
 * Create an API token in Strapi Admin → Settings → API Tokens (Full access).
 * The same script works against any Strapi instance (local or production).
 */

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error("STRAPI_TOKEN env variable is required.");
  console.error(
    "Create one in Strapi Admin → Settings → API Tokens → Create new API Token (Full access)"
  );
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

async function api(path, method = "GET", body) {
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  // Strapi v5: append status=published for POST to auto-publish
  const separator = path.includes("?") ? "&" : "?";
  const url =
    method === "POST"
      ? `${STRAPI_URL}/api${path}${separator}status=published`
      : `${STRAPI_URL}/api${path}`;
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

// Helper to build Strapi blocks content
function p(text) {
  return {
    type: "paragraph",
    children: [{ type: "text", text }],
  };
}

function heading(text, level = 3) {
  return {
    type: "heading",
    level,
    children: [{ type: "text", text }],
  };
}

function bold(text) {
  return { type: "text", text, bold: true };
}

function pWithBold(before, boldText, after) {
  return {
    type: "paragraph",
    children: [
      { type: "text", text: before },
      bold(boldText),
      { type: "text", text: after },
    ],
  };
}

function list(items) {
  return {
    type: "list",
    format: "unordered",
    children: items.map((item) => ({
      type: "list-item",
      children: [{ type: "text", text: item }],
    })),
  };
}

// ── College Data ──────────────────────────────────────────────────────

const collegeData = {
  Name: "Albany State University",
  Slug: "albany-state-university",
  ShortName: "ASU Albany",
  ShortDescription:
    "A historically Black university in Albany, Georgia offering over 50 undergraduate and graduate programs. ASU Global brings accredited online degrees to students worldwide with tuition rates among the most affordable in the United States.",
  Description: [
    p(
      "Albany State University, founded in 1903, is a proud member of the University System of Georgia. With over a century of academic excellence, ASU has built a reputation for producing graduates who lead in education, healthcare, public service, business, and criminal justice."
    ),
    p(
      "Through ASU Global, the university extends its reach beyond the physical campus in Albany, Georgia to serve students across the United States and internationally. ASU Global offers fully online associate, bachelor's, master's, and certificate programs with the same accreditation and faculty as on-campus offerings — at tuition rates that are among the lowest in the nation."
    ),
    p(
      "Albany State is accredited by the Southern Association of Colleges and Schools Commission on Colleges (SACSCOC) to award associate, baccalaureate, and master's degrees. Individual programs hold additional specialized accreditations from bodies including AACSB, CCNE, NAACLS, and CACREP."
    ),
  ],
  Website: "https://www.asurams.edu",
  City: "Albany, Georgia",
  Country: "United States",
  Type: "public",
  Accreditation:
    "Southern Association of Colleges and Schools Commission on Colleges (SACSCOC). Programs individually accredited by AACSB (Business), CCNE (Nursing), NAACLS (Laboratory Sciences), CACREP (Counseling).",
  Featured: true,
  SortOrder: 1,
  Faculty: [
    {
      Name: "Dr. Marion Fedrick",
      Designation: "President",
      Department: "Office of the President",
    },
    {
      Name: "Dr. Angela Peters",
      Designation: "Provost and Vice President for Academic Affairs",
      Department: "Academic Affairs",
    },
    {
      Name: "Dr. Kevin Nobles",
      Designation: "Dean, College of Business, Education and Professional Studies",
      Department: "Business & Education",
    },
    {
      Name: "Dr. Abiodun Ojemakinde",
      Designation: "Dean, Darton College of Health Professions",
      Department: "Health Professions",
    },
    {
      Name: "Dr. Tiffany Townsend",
      Designation: "Dean, College of Arts and Sciences",
      Department: "Arts & Sciences",
    },
  ],
};

// ── Program Data ──────────────────────────────────────────────────────

const programs = [
  // ── MASTER'S PROGRAMS ─────────────────────────────────────────
  {
    Name: "Master of Business Administration (MBA)",
    Slug: "master-of-business-administration",
    ShortDescription:
      "Develop strategic leadership and analytical skills to drive organizational growth. ASU's AACSB-accredited MBA emphasizes diversity, ethical decision-making, and real-world business problem-solving.",
    DegreeLevel: "master",
    FieldOfStudy: "Business & Management",
    Tags: "MBA, business administration, leadership, management, strategy, AACSB",
    Duration: "2 years (full-time) / 3 years (part-time)",
    Format: "online",
    Language: "English",
    Credits: "36 credit hours",
    StartDate: "Fall 2026, Spring 2027",
    ApplicationDeadline: "July 1, 2026 (Fall) / November 1, 2026 (Spring)",
    Tuition: "$4,635 per semester (in-state) / $16,320 per semester (out-of-state)",
    FinancialAidInfo:
      "Graduate assistantships available for qualifying students. Federal financial aid (FAFSA) accepted. Military and veteran benefits accepted. Employer tuition reimbursement coordination available.",
    Overview: [
      p(
        "The Master of Business Administration program at Albany State University is designed to develop professional leaders who contribute meaningfully to organizational diversity and sustained growth. This AACSB-accredited program combines rigorous academic coursework with practical business applications."
      ),
      p(
        "Students engage with real-world case studies, collaborate on cross-functional projects, and develop the strategic thinking and ethical reasoning skills that employers value. The program is delivered entirely online, allowing working professionals to advance their careers without relocating or pausing their employment."
      ),
      p(
        "The MBA curriculum covers core business disciplines including accounting, finance, marketing, operations management, and organizational behavior, with an emphasis on data-driven decision-making and global business perspectives."
      ),
    ],
    WhatYouWillLearn: [
      heading("Core Competencies"),
      list([
        "Apply quantitative and qualitative analysis to business decisions across functional areas",
        "Develop and evaluate strategic plans for organizations operating in competitive environments",
        "Lead diverse teams effectively using evidence-based management practices",
        "Evaluate financial statements and build forecasting models for business planning",
        "Design marketing strategies that account for cultural diversity and global markets",
        "Apply ethical frameworks to complex business scenarios involving multiple stakeholders",
      ]),
      heading("Applied Skills"),
      list([
        "Business case analysis and presentation",
        "Financial modeling and budgeting",
        "Market research design and interpretation",
        "Project management using agile and traditional methodologies",
        "Negotiation and conflict resolution in organizational settings",
      ]),
    ],
    SkillsYouWillGain:
      "Strategic Planning, Financial Analysis, Marketing Strategy, Operations Management, Leadership, Data-Driven Decision Making, Business Ethics, Project Management, Organizational Behavior, Negotiation",
    Curriculum: [
      heading("Foundation Courses (12 credit hours)"),
      list([
        "ACCT 6100 – Managerial Accounting for Decision Making",
        "ECON 6200 – Managerial Economics",
        "MGMT 6100 – Organizational Behavior and Leadership",
        "MKTG 6100 – Marketing Management",
      ]),
      heading("Core Courses (18 credit hours)"),
      list([
        "FINC 6200 – Corporate Finance",
        "MGMT 6200 – Operations and Supply Chain Management",
        "MGMT 6300 – Strategic Management (Capstone)",
        "MGMT 6400 – Business Analytics and Research Methods",
        "MGMT 6500 – Global Business Strategy",
        "MGMT 6600 – Business Law and Ethics",
      ]),
      heading("Electives (6 credit hours)"),
      p(
        "Students choose two elective courses from areas including healthcare management, human resource management, information systems management, and entrepreneurship."
      ),
    ],
    AdmissionRequirements: [
      heading("Academic Requirements"),
      list([
        "Bachelor's degree from a regionally accredited institution",
        "Minimum cumulative GPA of 2.5 on a 4.0 scale (conditional admission available for 2.25–2.49 GPA)",
        "GMAT or GRE scores (waived for applicants with 3.0+ GPA or 5+ years professional experience)",
      ]),
      heading("Application Materials"),
      list([
        "Completed online application via the ASU Graduate School portal",
        "Official transcripts from all institutions attended",
        "Two letters of recommendation from professional or academic references",
        "Current resume or CV detailing professional experience",
        "Statement of purpose (500–750 words) describing career goals and reasons for pursuing the MBA",
      ]),
      heading("International Students"),
      list([
        "TOEFL iBT minimum score of 79 or IELTS minimum score of 6.5",
        "Credential evaluation through WES or ECE for international transcripts",
        "Proof of financial support for I-20 processing (on-campus students only)",
      ]),
    ],
    CareerOutcomes: [
      p(
        "MBA graduates from Albany State University pursue leadership roles across industries. The program's emphasis on both analytical rigor and practical application prepares graduates for immediate impact in their organizations."
      ),
      heading("Common Career Paths"),
      list([
        "Business Development Manager – median salary $95,000",
        "Marketing Director – median salary $107,000",
        "Financial Analyst / Controller – median salary $92,000",
        "Operations Manager – median salary $88,000",
        "Healthcare Administrator – median salary $101,000",
        "Management Consultant – median salary $99,000",
        "Entrepreneur / Business Owner",
      ]),
      heading("Employer Network"),
      p(
        "ASU MBA alumni work at organizations including Procter & Gamble, Phoebe Putney Health System, Marine Corps Logistics Base Albany, the State of Georgia, Deloitte, and numerous small and mid-size businesses across the Southeast."
      ),
    ],
    Testimonials: [
      pWithBold(
        '"The online MBA at ASU gave me the flexibility to keep working full-time while advancing my education. The coursework was immediately applicable — I used concepts from my Operations Management class in a process improvement project at work the very next week." — ',
        "Marcus Johnson, MBA '24",
        ", Operations Lead at Phoebe Putney Health System"
      ),
      pWithBold(
        '"Coming from a non-business background in engineering, I was concerned about keeping up. The program is structured to bring everyone to the same level in the foundation courses before diving into advanced topics. The faculty are incredibly responsive and genuinely invested in student success." — ',
        "Priya Venkatesh, MBA '23",
        ", Strategy Analyst at Deloitte"
      ),
    ],
    FAQ: [
      heading("Is this MBA accredited?"),
      p(
        "Yes. The MBA program is offered through the College of Business, Education and Professional Studies, which holds AACSB accreditation — a distinction held by fewer than 6% of business schools worldwide."
      ),
      heading("Can I complete the MBA while working full-time?"),
      p(
        "Absolutely. The program is designed for working professionals. All courses are delivered online with asynchronous components. Most students take two courses per semester and complete the program in two years."
      ),
      heading("Is the GMAT required?"),
      p(
        "The GMAT/GRE requirement is waived for applicants with a cumulative GPA of 3.0 or higher, or those with five or more years of professional managerial experience."
      ),
      heading("What is the difference between in-state and out-of-state tuition?"),
      p(
        "Georgia residents pay approximately $4,635 per semester. Out-of-state students pay approximately $16,320 per semester. ASU offers one of the most affordable MBA programs in the University System of Georgia."
      ),
    ],
    ApplicationURL: "https://www.asurams.edu/enrollment-management/graduate-admissions/index.php",
    Featured: true,
    SortOrder: 1,
  },

  {
    Name: "Master of Science in Criminal Justice",
    Slug: "master-of-science-in-criminal-justice",
    ShortDescription:
      "Advance your career in law enforcement, corrections, or forensic science with concentrations that match your professional goals. Designed for working professionals in the criminal justice system.",
    DegreeLevel: "master",
    FieldOfStudy: "Criminal Justice & Law",
    Tags: "criminal justice, law enforcement, corrections, forensic science, public administration",
    Duration: "2 years",
    Format: "online",
    Language: "English",
    Credits: "36 credit hours",
    StartDate: "Fall 2026, Spring 2027",
    ApplicationDeadline: "July 1, 2026 (Fall) / November 1, 2026 (Spring)",
    Tuition: "$4,635 per semester (in-state) / $16,320 per semester (out-of-state)",
    FinancialAidInfo:
      "Federal financial aid accepted. Law enforcement tuition assistance programs accepted. Graduate assistantships available.",
    Overview: [
      p(
        "The Master of Science in Criminal Justice at Albany State University prepares professionals for advanced leadership roles in law enforcement agencies, correctional institutions, forensic laboratories, and public policy organizations. The program offers four distinct concentrations allowing students to specialize in their area of professional interest."
      ),
      p(
        "Coursework integrates criminological theory with practical applications in policy analysis, program evaluation, and evidence-based practices. Students examine issues of social justice, community policing, forensic investigation, and correctional reform through both academic research and real-world case analysis."
      ),
    ],
    WhatYouWillLearn: [
      list([
        "Analyze criminal behavior using contemporary criminological theories",
        "Evaluate criminal justice policies using research methodology and statistical analysis",
        "Apply forensic science principles to criminal investigations",
        "Design and assess community-based crime prevention programs",
        "Lead organizational change within criminal justice agencies",
        "Navigate legal and ethical challenges in law enforcement and corrections",
      ]),
    ],
    SkillsYouWillGain:
      "Criminological Analysis, Policy Evaluation, Forensic Science, Research Methods, Leadership, Community Policing, Corrections Management, Legal Writing",
    Curriculum: [
      heading("Core Courses (18 credit hours)"),
      list([
        "CRJU 5100 – Advanced Criminological Theory",
        "CRJU 5200 – Research Methods in Criminal Justice",
        "CRJU 5300 – Criminal Justice Administration",
        "CRJU 5400 – Statistics for Criminal Justice Research",
        "CRJU 5500 – Legal Issues in Criminal Justice",
        "CRJU 5900 – Capstone Seminar",
      ]),
      heading("Concentrations (18 credit hours)"),
      p(
        "Choose one: Law Enforcement, Corrections, Forensic Science, or Public Administration. Each concentration includes six specialized courses."
      ),
    ],
    AdmissionRequirements: [
      list([
        "Bachelor's degree from a regionally accredited institution (criminal justice or related field preferred)",
        "Minimum 2.5 GPA",
        "GRE scores (waived for applicants with 3.0+ GPA or 3+ years professional experience in criminal justice)",
        "Official transcripts, two recommendation letters, and a statement of purpose",
        "International students: TOEFL iBT 79+ or IELTS 6.5+",
      ]),
    ],
    CareerOutcomes: [
      heading("Career Paths"),
      list([
        "Police Chief / Assistant Chief – median salary $95,000",
        "Federal Law Enforcement Agent (FBI, DEA, ATF) – median salary $90,000",
        "Corrections Administrator – median salary $75,000",
        "Forensic Science Lab Director – median salary $85,000",
        "Criminal Justice Policy Analyst – median salary $72,000",
        "Probation and Parole Director – median salary $68,000",
      ]),
    ],
    Testimonials: [
      pWithBold(
        '"I enrolled in the MS Criminal Justice program while serving as a sergeant with the Albany Police Department. The Law Enforcement concentration gave me the academic foundation I needed to move into administration. I was promoted to lieutenant before I even graduated." — ',
        "Lt. DeAndre Williams, MSCJ '23",
        ", Albany Police Department"
      ),
    ],
    FAQ: [
      heading("Do I need a criminal justice bachelor's degree?"),
      p(
        "No. While a background in criminal justice or a related field is preferred, students from any discipline are welcome. Students without prior criminal justice coursework may be required to complete prerequisite courses."
      ),
      heading("Can I work full-time while enrolled?"),
      p(
        "Yes. The program is designed for working professionals. Many students are active law enforcement officers, corrections professionals, or legal professionals."
      ),
    ],
    ApplicationURL: "https://www.asurams.edu/enrollment-management/graduate-admissions/index.php",
    Featured: true,
    SortOrder: 2,
  },

  {
    Name: "Master of Science in Nursing (MSN)",
    Slug: "master-of-science-in-nursing",
    ShortDescription:
      "Advance your nursing career with three specialized tracks: Family Nurse Practitioner, Nurse Educator, or Nursing Informatics. CCNE-accredited and designed for working registered nurses.",
    DegreeLevel: "master",
    FieldOfStudy: "Nursing & Healthcare",
    Tags: "nursing, MSN, nurse practitioner, FNP, nurse educator, nursing informatics, CCNE, healthcare",
    Duration: "2 to 3 years (depending on track)",
    Format: "online",
    Language: "English",
    Credits: "39–45 credit hours (varies by track)",
    StartDate: "Fall 2026",
    ApplicationDeadline: "March 15, 2026",
    Tuition: "$4,635 per semester (in-state) / $16,320 per semester (out-of-state)",
    FinancialAidInfo:
      "HRSA Nurse Corps Scholarship and Loan Repayment programs. Federal and state financial aid. Georgia HOPE scholarship for eligible students. Employer tuition assistance accepted.",
    Overview: [
      p(
        "The Master of Science in Nursing program at Albany State University prepares registered nurses for advanced practice, leadership, and specialized roles in healthcare. Accredited by the Commission on Collegiate Nursing Education (CCNE), the program offers three distinct tracks to match your career goals."
      ),
      p(
        "The Family Nurse Practitioner (FNP) track prepares you to provide primary care to patients across the lifespan. The Nurse Educator (NE) track equips you to teach the next generation of nurses in academic and clinical settings. The Nursing Informatics (NI) track positions you at the intersection of healthcare and technology."
      ),
    ],
    WhatYouWillLearn: [
      list([
        "Provide advanced clinical care across the lifespan (FNP track)",
        "Design and deliver nursing education curriculum (NE track)",
        "Implement and manage health information systems (NI track)",
        "Apply evidence-based practice to improve patient outcomes",
        "Lead interdisciplinary healthcare teams",
        "Conduct nursing research and quality improvement projects",
      ]),
    ],
    SkillsYouWillGain:
      "Advanced Patient Assessment, Clinical Decision-Making, Health Informatics, Curriculum Design, Evidence-Based Practice, Healthcare Leadership, Pharmacology, Research Methods",
    Curriculum: [
      heading("Core Courses (all tracks)"),
      list([
        "NURS 6100 – Advanced Pathophysiology",
        "NURS 6200 – Advanced Pharmacology",
        "NURS 6300 – Advanced Health Assessment",
        "NURS 6400 – Nursing Research and Evidence-Based Practice",
        "NURS 6500 – Health Policy and Ethics",
      ]),
      heading("FNP Track (additional 24 credit hours)"),
      p(
        "Includes 600+ clinical hours with primary care rotations in family practice, pediatrics, and geriatrics. Prepares for AANP or ANCC certification exam."
      ),
      heading("Nurse Educator Track (additional 18 credit hours)"),
      p(
        "Focus on curriculum development, assessment strategies, and teaching methodologies in academic and clinical settings."
      ),
      heading("Nursing Informatics Track (additional 18 credit hours)"),
      p(
        "Focus on health IT systems, data analytics, project management, and electronic health records implementation."
      ),
    ],
    AdmissionRequirements: [
      list([
        "BSN from a CCNE or ACEN accredited program",
        "Active, unencumbered RN license",
        "Minimum 3.0 GPA in BSN program",
        "One year of clinical nursing experience",
        "Official transcripts, three recommendation letters (at least one from a nursing supervisor), and a professional goals statement",
        "International students: TOEFL iBT 83+ or IELTS 7.0",
      ]),
    ],
    CareerOutcomes: [
      list([
        "Family Nurse Practitioner – median salary $120,000",
        "Nursing Faculty / Professor – median salary $80,000",
        "Chief Nursing Informatics Officer – median salary $115,000",
        "Clinical Nurse Specialist – median salary $95,000",
        "Director of Nursing Education – median salary $90,000",
      ]),
    ],
    Testimonials: [
      pWithBold(
        '"The FNP program at ASU prepared me exceptionally well for the certification exam. I passed on my first attempt and had a job offer before graduation. The clinical rotations in rural Georgia communities were invaluable — I now serve a community that desperately needs primary care providers." — ',
        "Dr. Keisha Brown, FNP-BC, MSN '23",
        ", Phoebe Primary Care"
      ),
    ],
    FAQ: [
      heading("Is the MSN program fully online?"),
      p(
        "The didactic coursework is fully online. The FNP track requires in-person clinical rotations (600+ hours) which can be completed at approved clinical sites near your location. The NE and NI tracks are fully online."
      ),
      heading("Does this program prepare me for certification?"),
      p(
        "Yes. The FNP track prepares graduates to sit for the AANP or ANCC Family Nurse Practitioner certification exam. The NE track prepares for the Certified Nurse Educator (CNE) exam."
      ),
    ],
    ApplicationURL: "https://www.asurams.edu/enrollment-management/graduate-admissions/index.php",
    Featured: false,
    SortOrder: 3,
  },

  {
    Name: "Master of Public Administration (MPA)",
    Slug: "master-of-public-administration",
    ShortDescription:
      "Prepare for leadership in government, nonprofit, and public service organizations with concentrations in public management, criminal justice administration, or community development.",
    DegreeLevel: "master",
    FieldOfStudy: "Public Administration & Policy",
    Tags: "public administration, MPA, government, nonprofit, public policy, leadership",
    Duration: "2 years",
    Format: "online",
    Language: "English",
    Credits: "39 credit hours",
    StartDate: "Fall 2026, Spring 2027",
    ApplicationDeadline: "July 1, 2026 (Fall)",
    Tuition: "$4,635 per semester (in-state) / $16,320 per semester (out-of-state)",
    FinancialAidInfo: "Federal financial aid accepted. Graduate assistantships available.",
    Overview: [
      p(
        "The Master of Public Administration at Albany State University prepares students for leadership roles in public, nonprofit, and private organizations. The program emphasizes evidence-based management, public policy analysis, and ethical governance."
      ),
      p(
        "Students choose from multiple concentrations including Public Management, Criminal Justice Administration, and Community and Economic Development. The curriculum integrates theory with practical application through case studies, simulations, and a capstone project addressing a real public administration challenge."
      ),
    ],
    WhatYouWillLearn: [
      list([
        "Develop and analyze public policies using quantitative and qualitative methods",
        "Manage public and nonprofit budgets, including grant writing and fiscal analysis",
        "Lead organizational change in government and nonprofit settings",
        "Design and evaluate public programs for effectiveness and equity",
        "Navigate the legal and ethical landscape of public service",
      ]),
    ],
    SkillsYouWillGain:
      "Public Policy Analysis, Budget Management, Grant Writing, Program Evaluation, Ethical Leadership, Strategic Planning, Community Engagement, Government Relations",
    Curriculum: [
      heading("Core Courses (27 credit hours)"),
      list([
        "PUBA 6100 – Foundations of Public Administration",
        "PUBA 6200 – Public Policy Analysis",
        "PUBA 6300 – Public Budgeting and Finance",
        "PUBA 6400 – Research Methods for Public Administration",
        "PUBA 6500 – Human Resource Management in the Public Sector",
        "PUBA 6600 – Administrative Law and Ethics",
        "PUBA 6700 – Organizational Theory and Behavior",
        "PUBA 6800 – Grant Writing and Resource Development",
        "PUBA 6900 – Capstone in Public Administration",
      ]),
      heading("Concentration Courses (12 credit hours)"),
      p(
        "Choose from Public Management, Criminal Justice Administration, or Community and Economic Development."
      ),
    ],
    AdmissionRequirements: [
      list([
        "Bachelor's degree from a regionally accredited institution",
        "Minimum 2.5 GPA",
        "GRE waived for applicants with 3.0+ GPA or 3+ years public service experience",
        "Official transcripts, two recommendation letters, statement of purpose, and current resume",
      ]),
    ],
    CareerOutcomes: [
      list([
        "City Manager / Assistant City Manager – median salary $95,000",
        "Nonprofit Executive Director – median salary $78,000",
        "Government Program Director – median salary $85,000",
        "Policy Analyst – median salary $72,000",
        "Public Affairs Specialist – median salary $68,000",
      ]),
    ],
    Testimonials: [
      pWithBold(
        '"The MPA program gave me the skills to transition from a frontline social worker to a nonprofit director. The grant writing course alone paid for the entire degree — I secured a $250,000 federal grant for my organization within six months of taking that class." — ',
        "Jasmine Carter, MPA '24",
        ", Executive Director, Southwest Georgia Community Action Council"
      ),
    ],
    FAQ: [
      heading("Is this program accredited by NASPAA?"),
      p(
        "The program is offered through an accredited institution (SACSCOC). ASU is pursuing NASPAA accreditation for the MPA program."
      ),
    ],
    ApplicationURL: "https://www.asurams.edu/enrollment-management/graduate-admissions/index.php",
    Featured: false,
    SortOrder: 4,
  },

  // ── BACHELOR'S PROGRAMS ───────────────────────────────────────

  {
    Name: "Bachelor of Science in Management",
    Slug: "bachelor-of-science-in-management",
    ShortDescription:
      "Build analytical and decision-making skills for careers in healthcare management, operations, quality control, and financial analysis. AACSB-accredited with a specialization in healthcare management.",
    DegreeLevel: "bachelor",
    FieldOfStudy: "Business & Management",
    Tags: "management, business, healthcare management, AACSB, undergraduate",
    Duration: "4 years (full-time) / flexible for part-time",
    Format: "online",
    Language: "English",
    Credits: "120 credit hours",
    StartDate: "Fall 2026, Spring 2027, Summer 2027",
    ApplicationDeadline: "Rolling admissions (priority: June 1 for Fall)",
    Tuition: "$3,342 per semester (in-state) / $11,712 per semester (out-of-state)",
    FinancialAidInfo:
      "Pell Grants, Georgia HOPE Scholarship, institutional scholarships, federal student loans, and veteran benefits accepted. Transfer credit accepted from regionally accredited institutions.",
    Overview: [
      p(
        "The Bachelor of Science in Management at Albany State University helps students build the analytical and decision-making skills needed for leadership roles in business and healthcare organizations. The AACSB-accredited program combines a strong foundation in business fundamentals with practical management applications."
      ),
      p(
        "Students develop expertise in quantitative analysis, organizational behavior, strategic planning, and information technology. A specialization option in healthcare management prepares students for the growing demand for skilled administrators in hospitals, clinics, insurance companies, and public health organizations."
      ),
    ],
    WhatYouWillLearn: [
      list([
        "Apply management theories and principles to real-world organizational challenges",
        "Analyze business data to support strategic decision-making",
        "Manage projects, teams, and organizational resources effectively",
        "Understand healthcare systems, policy, and administration (healthcare specialization)",
        "Communicate professionally in written and verbal formats",
        "Apply ethical frameworks to business and management decisions",
      ]),
    ],
    SkillsYouWillGain:
      "Business Analysis, Project Management, Team Leadership, Strategic Planning, Healthcare Administration, Financial Literacy, Business Communication, Critical Thinking",
    Curriculum: [
      heading("General Education (42 credit hours)"),
      p("Core curriculum in English composition, mathematics, sciences, social sciences, and humanities."),
      heading("Business Core (33 credit hours)"),
      list([
        "Principles of Accounting I & II",
        "Principles of Microeconomics & Macroeconomics",
        "Business Statistics",
        "Business Law",
        "Principles of Marketing",
        "Principles of Finance",
        "Management Information Systems",
        "Business Communication",
        "Strategic Management (Capstone)",
      ]),
      heading("Management Major (27 credit hours)"),
      list([
        "Organizational Behavior",
        "Operations Management",
        "Human Resource Management",
        "International Business",
        "Entrepreneurship",
        "Quality Management",
        "Healthcare Management specialization courses (optional)",
      ]),
    ],
    AdmissionRequirements: [
      list([
        "High school diploma or GED equivalent",
        "Minimum 2.0 GPA (2.5 for competitive admission)",
        "SAT or ACT scores (optional for 2026 applicants)",
        "Official high school or college transcripts",
        "Transfer students: minimum 30 transferable credits with 2.0 GPA",
      ]),
    ],
    CareerOutcomes: [
      list([
        "Business Analyst – median salary $65,000",
        "Healthcare Administrator – median salary $70,000",
        "Operations Coordinator – median salary $55,000",
        "Human Resources Specialist – median salary $52,000",
        "Quality Assurance Manager – median salary $68,000",
        "Many graduates continue to ASU's MBA program",
      ]),
    ],
    Testimonials: [
      pWithBold(
        '"I chose ASU for the affordable tuition and the healthcare management specialization. I completed my degree entirely online while working as a medical office manager. My employer promoted me to Practice Administrator three months after graduation." — ',
        "Tameka Robinson, BS Management '24",
        ""
      ),
    ],
    FAQ: [
      heading("Can I transfer credits from a community college?"),
      p(
        "Yes. ASU accepts transfer credits from regionally accredited institutions. Students typically transfer 30–60 credits from community colleges. ASU has articulation agreements with several Georgia colleges."
      ),
      heading("Is there a healthcare management specialization?"),
      p(
        "Yes. Within the BS in Management, students can specialize in healthcare management, preparing for roles in hospital administration, health insurance, and public health organizations."
      ),
    ],
    ApplicationURL: "https://www.asurams.edu/enrollment-management/undergraduate-admissions/index.php",
    Featured: true,
    SortOrder: 5,
  },

  {
    Name: "Bachelor of Science in Criminal Justice",
    Slug: "bachelor-of-science-in-criminal-justice",
    ShortDescription:
      "Prepare for careers in law enforcement, corrections, juvenile justice, and social justice advocacy. Combines criminological theory with practical fieldwork and leadership development.",
    DegreeLevel: "bachelor",
    FieldOfStudy: "Criminal Justice & Law",
    Tags: "criminal justice, law enforcement, corrections, social justice, undergraduate",
    Duration: "4 years",
    Format: "online",
    Language: "English",
    Credits: "120 credit hours",
    StartDate: "Fall 2026, Spring 2027",
    ApplicationDeadline: "Rolling admissions",
    Tuition: "$3,342 per semester (in-state) / $11,712 per semester (out-of-state)",
    FinancialAidInfo:
      "Federal and state financial aid, institutional scholarships, veteran benefits. Law enforcement agency tuition assistance coordination.",
    Overview: [
      p(
        "The Bachelor of Science in Criminal Justice at Albany State University prepares students to become leaders and advocates for social justice within the criminal justice system. The program covers law enforcement, courts, corrections, and juvenile justice from both theoretical and practical perspectives."
      ),
      p(
        "Students develop critical thinking skills to analyze the causes and consequences of crime, evaluate the effectiveness of criminal justice policies, and understand the social, economic, and racial factors that shape the justice system. The program prepares graduates for careers in law enforcement, corrections, federal agencies, and graduate study in law or criminal justice."
      ),
    ],
    WhatYouWillLearn: [
      list([
        "Analyze criminal behavior using sociological and psychological theories",
        "Understand the structure and function of law enforcement, courts, and correctional systems",
        "Evaluate criminal justice policies for effectiveness and equity",
        "Apply constitutional law principles to criminal justice practice",
        "Conduct criminological research using quantitative and qualitative methods",
        "Communicate effectively in professional criminal justice settings",
      ]),
    ],
    SkillsYouWillGain:
      "Criminal Investigation, Policy Analysis, Legal Writing, Research Methods, Community Relations, Crisis Management, Leadership, Ethical Reasoning",
    Curriculum: [
      heading("Major Courses (36 credit hours)"),
      list([
        "Introduction to Criminal Justice",
        "Criminology",
        "Criminal Law",
        "Criminal Procedure",
        "Policing in America",
        "Corrections",
        "Juvenile Justice",
        "Research Methods in Criminal Justice",
        "Criminal Justice Ethics",
        "Senior Seminar (Capstone)",
        "Two electives from departmental offerings",
      ]),
    ],
    AdmissionRequirements: [
      list([
        "High school diploma or GED",
        "Minimum 2.0 GPA",
        "Official transcripts",
        "SAT/ACT optional for 2026",
      ]),
    ],
    CareerOutcomes: [
      list([
        "Police Officer / Detective – median salary $55,000–$75,000",
        "Correctional Officer / Supervisor – median salary $48,000–$65,000",
        "Federal Agent (FBI, DEA, ICE, ATF) – median salary $75,000–$95,000",
        "Probation / Parole Officer – median salary $50,000",
        "Victim Advocate – median salary $45,000",
        "Pathway to law school or graduate programs in criminal justice",
      ]),
    ],
    Testimonials: [],
    FAQ: [
      heading("Does this program include internships?"),
      p(
        "Yes. Students are encouraged to complete internships with local law enforcement agencies, courts, and correctional facilities. ASU has partnerships with the Albany Police Department, Dougherty County Sheriff's Office, and the Georgia Department of Corrections."
      ),
    ],
    ApplicationURL: "https://www.asurams.edu/enrollment-management/undergraduate-admissions/index.php",
    Featured: false,
    SortOrder: 6,
  },

  {
    Name: "Bachelor of Science in Nursing (RN to BSN)",
    Slug: "rn-to-bsn",
    ShortDescription:
      "Advance from Associate Degree in Nursing to BSN while continuing to work. CCNE-accredited program designed for licensed Registered Nurses seeking career advancement.",
    DegreeLevel: "bachelor",
    FieldOfStudy: "Nursing & Healthcare",
    Tags: "nursing, RN to BSN, CCNE, healthcare, registered nurse",
    Duration: "12 to 18 months (for RN holders)",
    Format: "online",
    Language: "English",
    Credits: "120 credit hours (30 upper-division nursing credits)",
    StartDate: "Fall 2026, Spring 2027",
    ApplicationDeadline: "June 1, 2026 (Fall)",
    Tuition: "$3,342 per semester (in-state) / $11,712 per semester (out-of-state)",
    FinancialAidInfo:
      "HRSA scholarships, employer tuition assistance, federal financial aid, Georgia HOPE scholarship.",
    Overview: [
      p(
        "The RN to BSN program at Albany State University supports licensed Registered Nurses in advancing from an Associate Degree to a Bachelor of Science in Nursing. The CCNE-accredited program is delivered entirely online, allowing working nurses to continue their clinical practice while earning their BSN."
      ),
      p(
        "The curriculum builds on your existing nursing knowledge and clinical experience, adding depth in evidence-based practice, community health, nursing leadership, and health assessment. Graduates are prepared for expanded roles in clinical care, management, and public health — and meet the growing employer preference for BSN-prepared nurses."
      ),
    ],
    WhatYouWillLearn: [
      list([
        "Apply evidence-based practice frameworks to improve patient outcomes",
        "Assess community health needs and design population-focused interventions",
        "Lead quality improvement initiatives in clinical settings",
        "Integrate informatics and technology into nursing practice",
        "Provide culturally competent care to diverse patient populations",
      ]),
    ],
    SkillsYouWillGain:
      "Evidence-Based Practice, Community Health Assessment, Nursing Leadership, Health Informatics, Patient Safety, Quality Improvement, Cultural Competency",
    Curriculum: [
      heading("Upper-Division Nursing Courses (30 credit hours)"),
      list([
        "NURS 3100 – Professional Role Transition",
        "NURS 3200 – Health Assessment Across the Lifespan",
        "NURS 3300 – Evidence-Based Nursing Practice",
        "NURS 4100 – Community and Public Health Nursing",
        "NURS 4200 – Nursing Leadership and Management",
        "NURS 4300 – Nursing Informatics",
        "NURS 4400 – Population Health",
        "NURS 4500 – Nursing Research",
        "NURS 4600 – Capstone in Professional Nursing",
      ]),
    ],
    AdmissionRequirements: [
      list([
        "Active, unencumbered RN license",
        "Associate Degree in Nursing or nursing diploma from an accredited program",
        "Minimum 2.5 GPA",
        "Official transcripts from all institutions attended",
        "Current CPR certification",
      ]),
    ],
    CareerOutcomes: [
      list([
        "BSN-prepared Clinical Nurse – higher eligibility for promotions and specialized roles",
        "Charge Nurse / Nurse Manager – median salary $78,000",
        "Public Health Nurse – median salary $65,000",
        "Pathway to MSN (FNP, Nurse Educator, Informatics) programs including ASU's own MSN",
      ]),
    ],
    Testimonials: [],
    FAQ: [
      heading("How long does the RN to BSN take?"),
      p(
        "Most students complete the program in 12 to 18 months while working full-time as an RN."
      ),
    ],
    ApplicationURL: "https://www.asurams.edu/enrollment-management/undergraduate-admissions/index.php",
    Featured: false,
    SortOrder: 7,
  },

  {
    Name: "Bachelor of Arts in Psychology",
    Slug: "bachelor-of-arts-in-psychology",
    ShortDescription:
      "Understand human behavior, cognition, and emotion through scientific methods. Prepares students for careers in counseling, social services, human resources, or graduate study.",
    DegreeLevel: "bachelor",
    FieldOfStudy: "Psychology & Social Sciences",
    Tags: "psychology, mental health, counseling, social science, undergraduate",
    Duration: "4 years",
    Format: "online",
    Language: "English",
    Credits: "120 credit hours",
    StartDate: "Fall 2026, Spring 2027",
    ApplicationDeadline: "Rolling admissions",
    Tuition: "$3,342 per semester (in-state) / $11,712 per semester (out-of-state)",
    FinancialAidInfo: "Federal and state aid, institutional scholarships, veteran benefits.",
    Overview: [
      p(
        "The Bachelor of Arts in Psychology at Albany State University provides a deep understanding of human thoughts, emotions, and behaviors through scientific methods. The program covers major areas of psychology including developmental, social, cognitive, abnormal, and biological psychology."
      ),
      p(
        "Students develop strong research skills, statistical literacy, and critical thinking abilities that are valued across industries. The program prepares graduates for entry-level careers in social services, human resources, and community organizations, as well as for graduate study in clinical psychology, counseling, social work, or related fields."
      ),
    ],
    WhatYouWillLearn: [
      list([
        "Apply psychological theories to understand individual and group behavior",
        "Design and conduct psychological research using scientific methods",
        "Analyze data using statistical techniques common in behavioral sciences",
        "Evaluate psychological assessments and their applications",
        "Understand the biological bases of behavior and mental processes",
        "Apply psychological principles to real-world problems in clinical, educational, and organizational settings",
      ]),
    ],
    SkillsYouWillGain:
      "Research Design, Statistical Analysis, Critical Thinking, Behavioral Assessment, Counseling Basics, Scientific Writing, Cultural Competency, Active Listening",
    Curriculum: [
      heading("Psychology Major Courses"),
      list([
        "General Psychology",
        "Research Methods in Psychology",
        "Statistics for Behavioral Sciences",
        "Developmental Psychology",
        "Abnormal Psychology",
        "Social Psychology",
        "Cognitive Psychology",
        "Biological Psychology",
        "Personality Theories",
        "History and Systems of Psychology",
        "Senior Seminar (Capstone)",
      ]),
    ],
    AdmissionRequirements: [
      list([
        "High school diploma or GED",
        "Minimum 2.0 GPA",
        "Official transcripts",
      ]),
    ],
    CareerOutcomes: [
      list([
        "Mental Health Technician – median salary $38,000",
        "Human Resources Specialist – median salary $52,000",
        "Case Manager / Social Services – median salary $45,000",
        "Research Assistant – median salary $40,000",
        "Pathway to graduate programs in Clinical Psychology, Counseling, Social Work, or Psychiatry",
      ]),
    ],
    Testimonials: [],
    FAQ: [
      heading("Can I become a licensed therapist with this degree?"),
      p(
        "A bachelor's in psychology is the first step. To become a licensed therapist, you will need a master's degree (such as ASU's M.Ed. in Counselor Education) or a doctorate. This program prepares you well for graduate study."
      ),
    ],
    ApplicationURL: "https://www.asurams.edu/enrollment-management/undergraduate-admissions/index.php",
    Featured: false,
    SortOrder: 8,
  },

  // ── ASSOCIATE PROGRAMS ────────────────────────────────────────

  {
    Name: "Associate of Science in Health Information Technology",
    Slug: "associate-health-information-technology",
    ShortDescription:
      "Prepare for careers as a health information technician. Learn data management, medical coding, and health information systems in this fully online associate program.",
    DegreeLevel: "associate",
    FieldOfStudy: "Health Information & Technology",
    Tags: "health information technology, medical coding, HIT, associate, healthcare IT",
    Duration: "2 years",
    Format: "online",
    Language: "English",
    Credits: "60 credit hours",
    StartDate: "Fall 2026",
    ApplicationDeadline: "June 1, 2026",
    Tuition: "$3,342 per semester (in-state) / $11,712 per semester (out-of-state)",
    FinancialAidInfo: "Pell Grants, Georgia HOPE, institutional scholarships, federal loans.",
    Overview: [
      p(
        "The Associate of Science in Health Information Technology at Albany State University prepares students for roles as health information technicians in hospitals, clinics, insurance companies, and government health agencies. Students learn medical terminology, health data management, coding systems (ICD-10, CPT), privacy regulations (HIPAA), and electronic health records administration."
      ),
      p(
        "Graduates are prepared to sit for national certification exams including the Registered Health Information Technician (RHIT) exam offered by the American Health Information Management Association (AHIMA)."
      ),
    ],
    WhatYouWillLearn: [
      list([
        "Manage and maintain electronic health records (EHR) systems",
        "Assign medical codes using ICD-10-CM, ICD-10-PCS, and CPT coding systems",
        "Ensure compliance with HIPAA privacy and security regulations",
        "Analyze health data for quality improvement and reporting",
        "Support healthcare revenue cycle management through accurate documentation",
      ]),
    ],
    SkillsYouWillGain:
      "Medical Coding (ICD-10, CPT), Electronic Health Records, HIPAA Compliance, Health Data Analytics, Revenue Cycle Management, Medical Terminology",
    Curriculum: [
      heading("Program Courses"),
      list([
        "Medical Terminology",
        "Health Information Systems",
        "ICD-10-CM/PCS Coding",
        "CPT Coding",
        "Health Data Management",
        "Legal Aspects of Health Information",
        "Healthcare Statistics",
        "Quality Improvement in Healthcare",
        "Professional Practice Experience",
      ]),
    ],
    AdmissionRequirements: [
      list([
        "High school diploma or GED",
        "Minimum 2.0 GPA",
        "Official transcripts",
      ]),
    ],
    CareerOutcomes: [
      list([
        "Health Information Technician – median salary $47,000",
        "Medical Coder – median salary $50,000",
        "Health Data Analyst – median salary $52,000",
        "Can transfer to BSN or BS in Health Information Management programs",
      ]),
    ],
    Testimonials: [],
    FAQ: [
      heading("Does this prepare me for the RHIT certification?"),
      p("Yes. Graduates are eligible to sit for the RHIT exam offered by AHIMA."),
    ],
    ApplicationURL: "https://www.asurams.edu/enrollment-management/undergraduate-admissions/index.php",
    Featured: false,
    SortOrder: 9,
  },

  // ── CERTIFICATE PROGRAMS ──────────────────────────────────────

  {
    Name: "Certificate in Medical Coding",
    Slug: "certificate-in-medical-coding",
    ShortDescription:
      "Fast-track your career in healthcare with a focused certificate in medical coding. Prepare for the CCA certification exam and enter one of healthcare's most in-demand fields.",
    DegreeLevel: "certificate",
    FieldOfStudy: "Health Information & Technology",
    Tags: "medical coding, certificate, CCA, healthcare, ICD-10, CPT, AHIMA",
    Duration: "9 to 12 months",
    Format: "online",
    Language: "English",
    Credits: "18 credit hours",
    StartDate: "Fall 2026, Spring 2027",
    ApplicationDeadline: "Rolling admissions",
    Tuition: "$3,342 per semester (in-state) / $11,712 per semester (out-of-state)",
    FinancialAidInfo: "Federal financial aid accepted. Some employer tuition assistance programs applicable.",
    Overview: [
      p(
        "The Certificate in Medical Coding at Albany State University trains students to assign diagnostic and procedural codes to patient records using ICD-10-CM, ICD-10-PCS, and CPT coding systems. Medical coders are essential to the healthcare revenue cycle, ensuring that providers are reimbursed accurately for services rendered."
      ),
      p(
        "This focused program can be completed in as little as nine months and prepares graduates to sit for the Certified Coding Associate (CCA) certification exam offered by the American Health Information Management Association (AHIMA). Credits earned in this certificate program can be applied toward the Associate of Science in Health Information Technology."
      ),
    ],
    WhatYouWillLearn: [
      list([
        "Assign ICD-10-CM and CPT codes accurately from clinical documentation",
        "Apply coding guidelines and conventions to complex medical cases",
        "Understand anatomy, physiology, and pathophysiology as it relates to coding",
        "Navigate reimbursement systems and payer requirements",
        "Maintain compliance with coding ethics and regulatory standards",
      ]),
    ],
    SkillsYouWillGain:
      "ICD-10-CM Coding, CPT Coding, Medical Terminology, Clinical Documentation Review, Revenue Cycle Management, Compliance",
    Curriculum: [
      heading("Certificate Courses"),
      list([
        "Medical Terminology",
        "Anatomy and Physiology for Coders",
        "ICD-10-CM Coding",
        "CPT/HCPCS Coding",
        "Coding Practicum",
        "Healthcare Reimbursement Methodologies",
      ]),
    ],
    AdmissionRequirements: [
      list([
        "High school diploma or GED",
        "No prior healthcare experience required",
        "Official transcripts",
      ]),
    ],
    CareerOutcomes: [
      list([
        "Medical Coder – median salary $50,000",
        "Coding Specialist – median salary $53,000",
        "Health Information Clerk – median salary $42,000",
        "Credits transfer to the AS in Health Information Technology program",
      ]),
    ],
    Testimonials: [
      pWithBold(
        '"I completed the medical coding certificate in 10 months while working part-time. I passed the CCA exam on my first attempt and had three job offers within two weeks. The program paid for itself before I even finished." — ',
        "Danielle Foster, CCA, Certificate '24",
        ""
      ),
    ],
    FAQ: [
      heading("Do I need a healthcare background?"),
      p(
        "No. The program starts with foundational courses in medical terminology and anatomy. Students from any background can succeed."
      ),
      heading("Can I apply these credits toward a degree?"),
      p(
        "Yes. All 18 credit hours count toward the Associate of Science in Health Information Technology."
      ),
    ],
    ApplicationURL: "https://www.asurams.edu/enrollment-management/undergraduate-admissions/index.php",
    Featured: false,
    SortOrder: 10,
  },
];

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding to ${STRAPI_URL}...\n`);

  // 1. Create the college (auto-published via ?status=published)
  console.log("Creating college: Albany State University...");
  const collegeRes = await api("/colleges", "POST", { data: collegeData });
  const collegeDocId = collegeRes.data.documentId;
  console.log(`  → College created and published (documentId: ${collegeDocId})`);

  // 2. Create programs and link to college
  const programDocIds = [];
  for (const program of programs) {
    console.log(`Creating program: ${program.Name}...`);
    const progRes = await api("/programs", "POST", {
      data: {
        ...program,
        college: collegeDocId,
      },
    });
    const progDocId = progRes.data.documentId;
    programDocIds.push(progDocId);
    console.log(`  → Program created and published (documentId: ${progDocId})`);
  }

  // 3. Link college to events (if any events exist)
  try {
    const eventsRes = await api("/events?pagination[limit]=10");
    const events = eventsRes.data || [];
    if (events.length > 0) {
      const eventDocIds = events.map((e) => e.documentId);
      await api(`/colleges/${collegeDocId}?status=published`, "PUT", {
        data: { events: eventDocIds },
      });
      console.log(`\nLinked college to ${eventDocIds.length} event(s)`);

      // Also link programs to events
      for (const progDocId of programDocIds) {
        await api(`/programs/${progDocId}?status=published`, "PUT", {
          data: { events: eventDocIds },
        });
      }
      console.log(`Linked ${programDocIds.length} programs to events`);
    }
  } catch (err) {
    console.log("Could not link to events (this is ok):", err.message);
  }

  console.log("\nDone! Seed completed successfully.");
  console.log(
    `Visit ${STRAPI_URL}/admin to verify the data, then set up API permissions:`
  );
  console.log(
    "  → Settings → Users & Permissions → Roles → Public → College & Program → find, findOne"
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
