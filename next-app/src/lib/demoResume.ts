import type { IResume } from "@/models";
import { templateCatalog } from "@/lib/templateCatalog";

const timestamp = "2026-04-17T09:00:00.000Z";

const createBaseResume = (): IResume => ({
  _id: "demo-resume",
  userId: "demo-user",
  title: "Senior Product Designer Resume",
  public: true,
  personal_info: {
    full_name: "Elena Morozova",
    email: "elena@resumematch.ru",
    phone: "+7 (926) 555-18-43",
    location: "Moscow, Russia",
    linkedin: "linkedin.com/in/elena-morozova",
    website: "www.elenamoro.design",
    profession: "Senior Product Designer",
    image: "/images/demo-avatar.svg",
  },
  professional_summary:
    "Senior product designer with 8+ years of experience shaping fintech and SaaS products from first concept to shipped, measurable outcomes. Strong in product thinking, design systems, research synthesis, and leading cross-functional delivery with PM and engineering teams.",
  experience: [
    {
      company: "AtlasPay",
      position: "Senior Product Designer",
      start_date: "2022-02",
      end_date: "",
      is_current: true,
      description:
        "Led end-to-end redesign of onboarding and subscription surfaces across web and mobile. Improved activation by 21%, reduced abandonment by 18%, and introduced reusable patterns adopted by 4 product squads.",
    },
    {
      company: "CloudMetric",
      position: "Product Designer",
      start_date: "2019-04",
      end_date: "2022-01",
      is_current: false,
      description:
        "Designed analytics workflows, dashboard IA, and reporting modules for B2B customers. Partnered with engineering on component architecture and reduced design-to-dev handoff cycles by 35%.",
    },
    {
      company: "North Studio",
      position: "UX/UI Designer",
      start_date: "2016-06",
      end_date: "2019-03",
      is_current: false,
      description:
        "Created landing pages, design systems, and product MVPs for early-stage startups in edtech and recruitment. Facilitated discovery workshops and built high-fidelity prototypes for investor demos.",
    },
  ],
  education: [
    {
      institution: "British Higher School of Art and Design",
      degree: "Master",
      field: "Digital Product Design",
      graduation_date: "2018-06",
      gpa: "4.8/5",
    },
    {
      institution: "Moscow State University",
      degree: "Bachelor",
      field: "Visual Communication",
      graduation_date: "2016-06",
      gpa: "4.7/5",
    },
  ],
  skills: [
    "Product Strategy",
    "Interaction Design",
    "Design Systems",
    "User Research",
    "Figma",
    "Framer Prototyping",
    "A/B Testing",
    "Tailwind UI Thinking",
    "Facilitation",
    "Stakeholder Communication",
  ],
  project: [
    {
      name: "Subscription Upgrade Experience",
      type: "Growth / Monetization",
      description:
        "Redesigned pricing comparison, checkout handoff, and upgrade nudges for a SaaS workspace. Increased paid conversion from trial by 14% in 8 weeks.",
    },
    {
      name: "Design System Rollout",
      type: "Platform / Design Ops",
      description:
        "Built a multi-team component library with token governance, documentation, and implementation principles that shortened UI production time by 30%.",
    },
  ],
  template: "executive",
  accent_color: "#1d4ed8",
  text_overrides: {
    elements: {},
    sections: {},
  },
  createdAt: timestamp,
  updatedAt: timestamp,
});

const cloneResume = (resume: IResume): IResume => ({
  ...resume,
  personal_info: { ...resume.personal_info },
  experience: resume.experience.map((item) => ({ ...item })),
  education: resume.education.map((item) => ({ ...item })),
  skills: [...resume.skills],
  project: resume.project.map((item) => ({ ...item })),
  text_overrides: {
    elements: { ...(resume.text_overrides?.elements ?? {}) },
    sections: { ...(resume.text_overrides?.sections ?? {}) },
  },
});

export const demoResume = createBaseResume();

export const getTemplateDemoResume = (templateId: string): IResume => {
  const template = templateCatalog.find((item) => item.id === templateId);
  const base = cloneResume(demoResume);

  base._id = `demo-${templateId}`;
  base.title = `${template?.name ?? "Template"} Preview`;
  base.template = templateId;
  base.accent_color = template?.accentColor ?? demoResume.accent_color;

  return base;
};

const executiveTemplate = templateCatalog.find((item) => item.id === "executive");
const premiumAccent = executiveTemplate?.accentColor ?? "#1d4ed8";

const stepFoundation = cloneResume(demoResume);
stepFoundation._id = "process-step-foundation";
stepFoundation.template = "executive";
stepFoundation.accent_color = premiumAccent;
stepFoundation.professional_summary = "";
stepFoundation.experience = [];
stepFoundation.education = [];
stepFoundation.skills = [];
stepFoundation.project = [];

const stepPositioning = cloneResume(stepFoundation);
stepPositioning._id = "process-step-positioning";
stepPositioning.professional_summary =
  "Senior product designer focused on turning complex product flows into clear, high-converting experiences for SaaS and fintech teams.";

const stepProof = cloneResume(stepPositioning);
stepProof._id = "process-step-proof";
stepProof.experience = demoResume.experience.slice(0, 2);
stepProof.education = demoResume.education.slice(0, 1);
stepProof.skills = demoResume.skills.slice(0, 6);

const stepPolish = cloneResume(demoResume);
stepPolish._id = "process-step-polish";
stepPolish.template = "executive";
stepPolish.accent_color = premiumAccent;

export const resumeProcessSteps = [
  {
    id: "foundation",
    step: "01",
    title: "Start with profile basics and a premium visual direction",
    description:
      "We first lock the headline, contact block, and chosen premium template so the user instantly sees the resume take shape instead of staring at a blank form.",
    points: [
      "Name, profession, email, phone, and location are filled first.",
      "The premium Executive template gives immediate visual confidence.",
      "A strong photo placeholder helps the page feel real from the first minute.",
    ],
    resume: stepFoundation,
  },
  {
    id: "positioning",
    step: "02",
    title: "Add a concise summary that explains the candidate's value",
    description:
      "Before listing every role, we show how a short strategic summary frames the person for recruiters and sets the tone for the rest of the page.",
    points: [
      "The summary focuses on outcomes, not generic adjectives.",
      "The wording is short enough to scan in seconds.",
      "This section becomes the bridge between profile details and work proof.",
    ],
    resume: stepPositioning,
  },
  {
    id: "proof",
    step: "03",
    title: "Fill the first meaningful experience, education, and skill proof",
    description:
      "At this stage the resume stops being a shell and starts answering recruiter questions about seniority, specialization, and credibility.",
    points: [
      "Two strongest roles are enough to communicate momentum early.",
      "Skills are grouped around the actual target role.",
      "Education stays compact and supportive instead of taking over the page.",
    ],
    resume: stepProof,
  },
  {
    id: "polish",
    step: "04",
    title: "Finish with projects and final polish for a complete application-ready version",
    description:
      "The final pass rounds out the document with measurable projects, stronger phrasing, and a full premium layout that feels ready to send.",
    points: [
      "Projects add extra differentiation beyond standard work history.",
      "The final version reads clearly in both quick scans and deeper review.",
      "Users can now export, iterate, or adapt the same base for a new vacancy.",
    ],
    resume: stepPolish,
  },
] as const;
