"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ResumePreview from "../components/ResumePreview";
import AnalysisReport from "../components/analysis/AnalysisReport";
import { getResumeValidationWarnings, resumeToAnalysisText } from "../lib/resumeAnalysis";
import { getResumeById } from "../lib/resumeStorage";
import type { ResumeData } from "../models";
import type { ResumeFeedback } from "../types/analysis";
import { useAppContext } from "../contexts/AppContext";

type AnalyzeState = "idle" | "loading" | "success" | "error";

export default function ResumeAnalysis() {
  const { t } = useTranslation();
  const params = useParams<{ resumeId?: string }>();
  const resumeId = params.resumeId;
  const router = useRouter();
  const { canViewFullAnalysis, hasActiveSubscription, refreshSession } = useAppContext();
  const [jobDescription, setJobDescription] = useState("");
  const [analyzeState, setAnalyzeState] = useState<AnalyzeState>("idle");
  const [analysis, setAnalysis] = useState<ResumeFeedback | null>(null);
  const [errorText, setErrorText] = useState("");
  const [fullAccessForLastRun, setFullAccessForLastRun] = useState(false);

  const [resume, setResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) {
        setResume(null);
        return;
      }
      const currentResume = await getResumeById(resumeId);
      setResume(currentResume);
    };
    loadResume();
  }, [resumeId]);

  const warnings = useMemo(
    () => (resume ? getResumeValidationWarnings(resume) : []),
    [resume]
  );

  const visibleAnalysis = useMemo(() => {
    if (!analysis) return null;
    if (fullAccessForLastRun) return analysis;

    const keepPortion = (items: string[]) => items.slice(0, Math.max(1, Math.ceil(items.length * 0.2)));
    const keepTips = <T,>(tips: T[]) => tips.slice(0, Math.max(1, Math.ceil(tips.length * 0.2)));

    return {
      ...analysis,
      strengths: keepPortion(analysis.strengths),
      weaknesses: keepPortion(analysis.weaknesses),
      recommendations: keepPortion(analysis.recommendations),
      errorsAndGaps: keepPortion(analysis.errorsAndGaps),
      improvedPhrasings: keepTips(analysis.improvedPhrasings),
      ATS: { ...analysis.ATS, tips: keepTips(analysis.ATS.tips) },
      toneAndStyle: { ...analysis.toneAndStyle, tips: keepTips(analysis.toneAndStyle.tips) },
      content: { ...analysis.content, tips: keepTips(analysis.content.tips) },
      structure: { ...analysis.structure, tips: keepTips(analysis.structure.tips) },
      skills: { ...analysis.skills, tips: keepTips(analysis.skills.tips) },
    };
  }, [analysis, fullAccessForLastRun]);

  const handleAnalyze = async () => {
    if (!resume) return;

    if (warnings.length > 0) {
      setAnalyzeState("error");
      setErrorText("Resume is incomplete. Please fill required sections in Builder.");
      return;
    }

    setAnalyzeState("loading");
    setErrorText("");
    const hasFullAccessNow = canViewFullAnalysis;
    setFullAccessForLastRun(hasFullAccessNow);

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: resume,
          resumeText: resumeToAnalysisText(resume),
          jobDescription: jobDescription.trim() || undefined,
          fullReport: hasFullAccessNow,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as {
        feedback?: ResumeFeedback;
        error?: string;
      };

      if (!data.feedback) {
        throw new Error(data.error || "Empty analysis response");
      }

      if (hasFullAccessNow) {
        await refreshSession();
      }
      setAnalysis(data.feedback);
      setAnalyzeState("success");
    } catch (error) {
      setAnalyzeState("error");
      setAnalysis(null);
      setErrorText(
        error instanceof Error
          ? error.message
          : "Failed to run analysis. Try again."
      );
    }
  };

  if (!resume) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-slate-700">Resume not found.</p>
        <Link className="text-blue-600 mt-2 inline-block" href="/app">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <main className="!pt-0 bg-[url('/images/bg-small.svg')] bg-cover bg-fixed">
      <nav className="flex flex-row justify-between items-center p-4 border-b border-gray-200 bg-white/90 backdrop-blur">
        <button
          onClick={() => router.push(`/app/builder/${resume._id}`)}
          className="flex flex-row items-center gap-2 border border-gray-200 rounded-lg p-2 shadow-sm text-sm font-semibold text-gray-800"
        >
          <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
          <span>{t("analysis.back")}</span>
        </button>

        <div className="flex items-center gap-2">
          <input
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            className="w-[320px] max-sm:w-[170px] p-2.5 border border-gray-300 rounded-xl text-sm"
            placeholder="Job description (optional)"
          />
          <button
            onClick={handleAnalyze}
            disabled={analyzeState === "loading"}
            className="primary-button !w-auto px-4 py-2 text-sm disabled:opacity-50"
          >
            {analyzeState === "loading" ? t("analysis.analyzing") : t("analysis.analyze")}
          </button>
        </div>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="flex flex-col gap-8 w-1/2 px-8 max-lg:w-full py-6 bg-[url('/images/bg-small.svg')] bg-cover h-screen sticky top-0 items-center justify-center">
          <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] w-full overflow-auto">
            <ResumePreview
              data={resume}
              template={resume.template}
              accentColor={resume.accent_color}
              classes=" rounded-2xl bg-white"
            />
          </div>
        </section>

        <section className="flex flex-col gap-8 w-1/2 px-8 max-lg:w-full py-6 bg-white">
          <h2 className="text-4xl !text-black font-bold">{t("analysis.title")}</h2>

          {warnings.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
              <p className="font-semibold">Before analysis, fill:</p>
              <ul className="list-disc pl-5 mt-2">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {analyzeState === "error" && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
              {errorText}
              <button
                onClick={handleAnalyze}
                className="ml-3 border border-red-300 bg-white px-3 py-1 rounded-md text-sm"
              >
                {t("analysis.retry")}
              </button>
            </div>
          )}

          {analyzeState === "idle" && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-600">
              Click Analyze to render full ATS-style report with detailed sections.
            </div>
          )}

          {analysis && !fullAccessForLastRun && (
            <div className="rounded-xl border border-indigo-300 bg-indigo-50 p-4 text-indigo-900">
              <p className="font-semibold">{t("analysis.lockedTitle")}</p>
              <p className="text-sm mt-1">
                {hasActiveSubscription ? t("analysis.noCredits") : t("analysis.lockedDesc")}
              </p>
              <p className="text-xs mt-1">{t("analysis.previewLabel")}: 20%</p>
              <button
                onClick={() => router.push("/app/subscription")}
                className="mt-3 rounded-md border border-indigo-300 bg-white px-3 py-1 text-sm"
              >
                {t("nav.subscription")}
              </button>
            </div>
          )}

          {visibleAnalysis ? (
            <AnalysisReport feedback={visibleAnalysis} />
          ) : (
            analyzeState === "loading" && (
              <img src="/images/resume-scan-2.gif" className="w-full" alt="loading" />
            )
          )}
        </section>
      </div>
    </main>
  );
}
