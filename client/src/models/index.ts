export interface IPersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  profession: string;
  image: string | File;
}
export interface IExperience {
  company: string;
  position: string;
  start_date: Date | string;
  end_date: Date | string;
  description: string;
  is_current: boolean;
  // _id: string;
}
export interface IEducation {
  institution: string;
  degree: string;
  field: string;
  graduation_date: Date | string;
  gpa: string;
  // _id: string;
}
export interface IProject {
  name: string;
  type: string;
  description: string;
  // _id: string;
}
export interface ITextElementOverride {
  text?: string;
  fontSizeOffset?: number;
  color?: string;
  textTransform?: "none" | "uppercase" | "capitalize";
}
export interface ITextSectionOverride {
  fontSizeOffset?: number;
  color?: string;
  textTransform?: "none" | "uppercase" | "capitalize";
}
export interface IResumeTextOverrides {
  elements: Record<string, ITextElementOverride>;
  sections: Record<string, ITextSectionOverride>;
}
export interface IResume {
  personal_info: IPersonalInfo;
  _id: string;
  userId: string;
  title: string;
  public: boolean;
  professional_summary: string;
  skills: string[];
  experience: IExperience[];
  education: IEducation[];
  template: string;
  accent_color: string;
  project: IProject[];
  text_overrides?: IResumeTextOverrides;
  // ... other properties
  updatedAt: string;
  createdAt: string;
}

export type ResumeData = IResume;
