"use client";

import Link from "next/link";
import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import ResumePreview from "@/components/ResumePreview";
import { useAppContext } from "@/contexts/AppContext";
import { resumeProcessSteps } from "@/lib/demoResume";
import { templateCatalog } from "@/lib/templateCatalog";

export default function ResumeProcess() {
  const { t } = useTranslation();
  const { canAccessPremiumTemplates } = useAppContext();

  const premiumTemplate = templateCatalog.find((item) => item.id === "executive");

  return (
    <div className="min-h-[calc(100vh-77px)] bg-[linear-gradient(180deg,_#eff6ff_0%,_#ffffff_36%,_#fff7ed_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white px-6 py-8 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.35)] sm:px-8 lg:px-10">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(29,78,216,0.18),_transparent_48%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.16),_transparent_44%)] lg:block" />
          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-700">
                <Sparkles className="size-4" />
                {t("process.badge")}
              </p>
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                {t("process.title")}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
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
                  href={canAccessPremiumTemplates ? "/app?create=1" : "/app/subscription"}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Crown className="size-4" />
                  {canAccessPremiumTemplates ? t("process.startPremium") : t("process.unlockPremium")}
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-6 text-white">
              <p className="text-sm text-slate-300">{t("process.featuredTemplate")}</p>
              <p className="mt-3 text-3xl font-semibold">{premiumTemplate?.name ?? "Executive"}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {t("process.featuredSubtitle")}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-400">{t("process.metricSteps")}</p>
                  <p className="mt-2 text-2xl font-semibold">{resumeProcessSteps.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-400">{t("process.metricGoal")}</p>
                  <p className="mt-2 text-lg font-semibold">{t("process.metricGoalValue")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6">
          {resumeProcessSteps.map((item, index) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]"
            >
              <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="border-b border-slate-100 bg-[linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] p-6 lg:border-b-0 lg:border-r lg:p-8">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-sky-700">{t("process.stepLabel", { number: index + 1 })}</p>
                      <h2 className="text-2xl font-semibold text-slate-950">{item.title}</h2>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                    {item.description}
                  </p>

                  <div className="mt-6 grid gap-3">
                    {item.points.map((point) => (
                      <div
                        key={point}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[linear-gradient(180deg,_#eef2ff_0%,_#ffffff_100%)] p-4 sm:p-5 lg:p-6">
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4">
                    <div className="h-[380px] overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 sm:h-[420px]">
                      <div className="w-[896px] origin-top-left scale-[0.33] sm:scale-[0.36]">
                        <ResumePreview
                          data={item.resume}
                          template={item.resume.template}
                          accentColor={item.resume.accent_color}
                          previewId={`process-preview-${item.id}`}
                          classes=" w-[896px] shadow-none"
                        />
                      </div>
                    </div>
                  </div>
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
              href={canAccessPremiumTemplates ? "/app?create=1" : "/app/subscription"}
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
