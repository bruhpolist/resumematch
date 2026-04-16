import type { ResumeData } from "../models";

const normalize = (value: string | undefined | null): string =>
  (value ?? "").trim();

export const getResumeValidationWarnings = (resume: ResumeData): string[] => {
  const warnings: string[] = [];

  if (!normalize(resume.personal_info.full_name)) {
    warnings.push("Укажите ФИО в разделе Personal Info.");
  }
  if (!normalize(resume.personal_info.email)) {
    warnings.push("Добавьте email, чтобы резюме выглядело завершенным.");
  }
  if (!normalize(resume.professional_summary)) {
    warnings.push("Добавьте Professional Summary.");
  }
  if (resume.experience.length === 0 && resume.project.length === 0) {
    warnings.push("Добавьте хотя бы Experience или Project.");
  }
  if (resume.skills.length === 0) {
    warnings.push("Добавьте ключевые навыки в Skills.");
  }

  return warnings;
};

export const resumeToAnalysisText = (resume: ResumeData): string => {
  const experiences = resume.experience
    .map(
      (item) =>
        `- ${item.position} @ ${item.company} (${item.start_date} - ${
          item.is_current ? "Present" : item.end_date
        }): ${item.description}`
    )
    .join("\n");

  const education = resume.education
    .map(
      (item) =>
        `- ${item.degree} ${item.field ? `(${item.field})` : ""} at ${
          item.institution
        }, graduation: ${item.graduation_date}, gpa: ${item.gpa || "n/a"}`
    )
    .join("\n");

  const projects = resume.project
    .map((item) => `- ${item.name} (${item.type}): ${item.description}`)
    .join("\n");

  return [
    `Name: ${resume.personal_info.full_name}`,
    `Profession: ${resume.personal_info.profession}`,
    `Email: ${resume.personal_info.email}`,
    `Phone: ${resume.personal_info.phone}`,
    `Location: ${resume.personal_info.location}`,
    `LinkedIn: ${resume.personal_info.linkedin}`,
    `Website: ${resume.personal_info.website}`,
    "",
    "Summary:",
    resume.professional_summary || "n/a",
    "",
    "Skills:",
    resume.skills.join(", ") || "n/a",
    "",
    "Experience:",
    experiences || "n/a",
    "",
    "Education:",
    education || "n/a",
    "",
    "Projects:",
    projects || "n/a",
  ].join("\n");
};

