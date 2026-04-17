"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ResumePreview from "@/components/ResumePreview";
import { getTemplateDemoResume, resumeProcessSteps } from "@/lib/demoResume";

export default function PreviewDemoClient() {
  const searchParams = useSearchParams();
  const stepId = searchParams.get("step");
  const templateId = searchParams.get("template") ?? "classic";

  const previewData = useMemo(() => {
    if (stepId) {
      const matchedStep = resumeProcessSteps.find((item) => item.id === stepId);
      if (matchedStep) {
        return {
          data: matchedStep.resume,
          template: matchedStep.resume.template,
          accentColor: matchedStep.resume.accent_color,
        };
      }
    }

    const resume = getTemplateDemoResume(templateId);
    return {
      data: resume,
      template: resume.template,
      accentColor: resume.accent_color,
    };
  }, [stepId, templateId]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#e2e8f0_0%,_#f8fafc_40%,_#ffffff_100%)] p-4 sm:p-6">
      <div className="mx-auto max-w-[980px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_28px_80px_-50px_rgba(15,23,42,0.35)] sm:p-6">
        <ResumePreview
          data={previewData.data}
          template={previewData.template}
          accentColor={previewData.accentColor}
          previewId={`demo-preview-${stepId || templateId}`}
          classes=" w-full shadow-none"
        />
      </div>
    </div>
  );
}
