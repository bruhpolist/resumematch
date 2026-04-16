import type { ResumeData } from "../models";
import { apiFetch } from "./api";

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

const normalizeResumeForApi = async (resume: ResumeData): Promise<ResumeData> => {
  const image = resume.personal_info?.image;
  let normalizedImage = "";

  if (typeof image === "string") {
    normalizedImage = image;
  } else if (image instanceof File) {
    normalizedImage = await fileToDataUrl(image);
  }

  return {
    ...resume,
    personal_info: {
      ...resume.personal_info,
      image: normalizedImage,
    },
  };
};

export const listResumes = async (): Promise<ResumeData[]> => {
  const response = await apiFetch<{ resumes: ResumeData[] }>("/api/resumes", {
    method: "GET",
  });

  return response.resumes;
};

export const getResumeById = async (resumeId: string): Promise<ResumeData | null> => {
  try {
    const response = await apiFetch<{ resume: ResumeData }>(`/api/resumes/${resumeId}`, {
      method: "GET",
    });
    return response.resume;
  } catch {
    return null;
  }
};

export const createResume = async (resume: ResumeData): Promise<ResumeData> => {
  const normalizedResume = await normalizeResumeForApi(resume);
  const response = await apiFetch<{ resume: ResumeData }>("/api/resumes", {
    method: "POST",
    body: JSON.stringify({ resume: normalizedResume }),
  });

  return response.resume;
};

export const saveResume = async (resumeId: string, resume: ResumeData): Promise<ResumeData> => {
  const normalizedResume = await normalizeResumeForApi(resume);
  const response = await apiFetch<{ resume: ResumeData }>(`/api/resumes/${resumeId}`, {
    method: "PUT",
    body: JSON.stringify({ resume: normalizedResume }),
  });

  return response.resume;
};

export const deleteResume = async (resumeId: string): Promise<void> => {
  await apiFetch<void>(`/api/resumes/${resumeId}`, {
    method: "DELETE",
  });
};
