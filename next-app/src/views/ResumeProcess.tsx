"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Crown, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import ResumePreview from "@/components/ResumePreview";
import { useAppContext } from "@/contexts/AppContext";
import { resumeProcessSteps } from "@/lib/demoResume";
import { templateCatalog } from "@/lib/templateCatalog";

function ProcessPreview({
  previewId,
  template,
  accentColor,
  resume,
}: {
  previewId: string;
  template: string;
  accentColor: string;
  resume: (typeof resumeProcessSteps)[number]["resume"];
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)] sm:p-4">
      <div className="relative h-[320px] overflow-hidden rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,_#e2e8f0_0%,_#f8fafc_55%,_#ffffff_100%)] sm:h-[380px] lg:h-[430px]">
        <div className="absolute inset-x-0 top-0 h-14 bg-[linear-gradient(90deg,_rgba(15,23,42,0.06),_rgba(14,165,233,0.12),_rgba(249,115,22,0.08))]" />
        <div className="absolute left-1/2 top-4 w-[896px] -translate-x-1/2 origin-top scale-[0.24] sm:top-5 sm:scale-[0.29] lg:scale-[0.34]">
          <ResumePreview
            data={resume}
            template={template}
            accentColor={accentColor}
            previewId={previewId}
            classes=" w-[896px] shadow-none"
          />
        </div>
      </div>
    </div>
  );
}

export default function ResumeProcess() {
  const { t } = useTranslation();
  const { canAccessPremiumTemplates } = useAppContext();

  const premiumTemplate = templateCatalog.find((item) => item.id === "executive");

  return (
    <div className="min-h-[calc(100vh-77px)] bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_24%,_#fff8ef_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white px-6 py-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] sm:px-8 lg:px-10">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_50%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.12),_transparent_44%)] lg:block" />
          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-700">
                <Sparkles className="size-4" />
                {t("process.badge")}
              </p>
              <h1 className="mt-5 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                {t("process.title")}
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {t("process.subtitle")}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/app/templates"
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  {t("process.backToTemplates")}
                </Link>
                <Link
                  href={canAccessPremiumTemplates ? "/app?create=1&template=executive" : "/app/subscription"}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Crown className="size-4" />
                  {canAccessPremiumTemplates ? t("process.startPremium") : t("process.unlockPremium")}
                </Link>
              </div>
            </div>

            <div className="grid gap-3 rounded-[30px] border border-slate-200 bg-slate-950 p-5 text-white">
              <div>
                <p className="text-sm text-slate-300">{t("process.featuredTemplate")}</p>
                <p className="mt-2 text-3xl font-semibold">{premiumTemplate?.name ?? "Executive"}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{t("process.featuredSubtitle")}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">{t("process.metricSteps")}</p>
                  <p className="mt-2 text-2xl font-semibold">{resumeProcessSteps.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">{t("process.metricGoal")}</p>
                  <p className="mt-2 text-lg font-semibold">{t("process.metricGoalValue")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5">
          {resumeProcessSteps.map((item, index) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.3)]"
            >
              <div className="grid gap-0 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <div className="border-b border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 sm:p-8 xl:border-b-0 xl:border-r">
                  <div className="flex flex-wrap items-start gap-4">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15">
                      {item.step}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-sky-700">{t("process.stepLabel", { number: index + 1 })}</p>
                      <h2 className="mt-1 text-2xl font-semibold leading-tight text-slate-950">
                        {item.title}
                      </h2>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                    {item.description}
                  </p>

                  <div className="mt-6 grid gap-3">
                    {item.points.map((point) => (
                      <div
                        key={point}
                        className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700"
                      >
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[linear-gradient(180deg,_#eef4ff_0%,_#ffffff_100%)] p-4 sm:p-5 lg:p-6">
                  <ProcessPreview
                    previewId={`process-preview-${item.id}`}
                    template={item.resume.template}
                    accentColor={item.resume.accent_color}
                    resume={item.resume}
                  />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-slate-950 px-6 py-7 text-white sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-sky-300">{t("process.ctaEyebrow")}</p>
              <h2 className="mt-2 text-2xl font-semibold">{t("process.ctaTitle")}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{t("process.ctaSubtitle")}</p>
            </div>
            <Link
              href={canAccessPremiumTemplates ? "/app?create=1&template=executive" : "/app/subscription"}
              className="inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              {canAccessPremiumTemplates ? t("process.ctaAction") : t("process.unlockPremium")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
