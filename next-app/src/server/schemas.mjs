import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const resumeSchema = z.object({
  title: z.string().min(1).max(200),
  personal_info: z
    .object({
      full_name: z.string().optional().default(""),
      email: z.string().optional().default(""),
      phone: z.string().optional().default(""),
      location: z.string().optional().default(""),
      linkedin: z.string().optional().default(""),
      website: z.string().optional().default(""),
      profession: z.string().optional().default(""),
      image: z.string().optional().default(""),
    })
    .passthrough(),
  professional_summary: z.string().optional().default(""),
  skills: z.array(z.string()).optional().default([]),
  experience: z.array(z.record(z.any())).optional().default([]),
  education: z.array(z.record(z.any())).optional().default([]),
  project: z.array(z.record(z.any())).optional().default([]),
  template: z.string().optional().default("classic"),
  accent_color: z.string().optional().default("#3B82F6"),
  public: z.boolean().optional().default(false),
  text_overrides: z
    .object({
      elements: z.record(z.record(z.any())).optional().default({}),
      sections: z.record(z.record(z.any())).optional().default({}),
    })
    .optional()
    .default({ elements: {}, sections: {} }),
});
