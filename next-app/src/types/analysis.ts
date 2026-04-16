export type FeedbackTipType = "good" | "improve";

export interface FeedbackTip {
  type: FeedbackTipType;
  tip: string;
  explanation?: string;
}

export interface FeedbackCategory {
  score: number;
  tips: FeedbackTip[];
}

export interface ResumeFeedback {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  errorsAndGaps: string[];
  improvedPhrasings: {
    original: string;
    improved: string;
    reason: string;
  }[];
  ATS: {
    score: number;
    tips: FeedbackTip[];
  };
  toneAndStyle: FeedbackCategory;
  content: FeedbackCategory;
  structure: FeedbackCategory;
  skills: FeedbackCategory;
}

export interface AnalyzeResumeRequest {
  resumeData: unknown;
  jobDescription?: string;
}
