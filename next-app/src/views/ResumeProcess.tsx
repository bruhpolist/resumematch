"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Crown, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/contexts/AppContext";
import { resumeProcessSteps } from "@/lib/demoResume";
import { templateCatalog } from "@/lib/templateCatalog";

function ProcessPreview({
  stepId,
}: {
  stepId: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_22px_55px_-34px_rgba(15,23,42,0.36)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_80px_-42px_rgba(15,23,42,0.42)] sm:p-4">
      <iframe
        src={`/preview-demo?step=${encodeURIComponent(stepId)}`}
        title={`Resume step preview ${stepId}`}
        className="h-[720px] w-full overflow-hidden rounded-[22px] border border-slate-200 bg-white sm:h-[860px] lg:h-[980px]"
      />
    </div>
  );
}

export default function ResumeProcess() {
  const { t } = useTranslation();
  const { canAccessPremiumTemplates } = useAppContext();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<HTMLElement[]>([]);
  const textRefs = useRef<HTMLDivElement[]>([]);
  const previewRefs = useRef<HTMLDivElement[]>([]);

  const premiumTemplate = templateCatalog.find((item) => item.id === "executive");

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
          }
        );
      }

      cardRefs.current.forEach((card, index) => {
        const textBlock = textRefs.current[index];
        const previewBlock = previewRefs.current[index];
        if (!card || !textBlock || !previewBlock) return;

        gsap.set(card, { autoAlpha: 0, y: 54 });
        gsap.set(textBlock, { autoAlpha: 0, x: -88 });
        gsap.set(previewBlock, { autoAlpha: 0, x: 88 });

        const timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "bottom 65%",
            toggleActions: "play none none reverse",
          },
        });

        timeline
          .to(card, { autoAlpha: 1, y: 0, duration: 0.65 })
          .to(textBlock, { autoAlpha: 1, x: 0, duration: 0.9 }, 0.08)
          .to(previewBlock, { autoAlpha: 1, x: 0, duration: 1.05 }, 0.14);
      });

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 86%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-[calc(100vh-77px)] bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_22%,_#fff8ef_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section
          ref={heroRef}
          className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white px-6 py-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] sm:px-8 lg:px-10"
        >
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
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  {t("process.backToTemplates")}
                </Link>
                <Link
                  href={canAccessPremiumTemplates ? "/app?create=1&template=executive" : "/app/subscription"}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-26px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
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

        <section className="relative pl-0 lg:pl-28">
          <div className="absolute bottom-0 left-[2.25rem] top-0 hidden w-px bg-[linear-gradient(180deg,_rgba(14,165,233,0.15),_rgba(14,165,233,0.45),_rgba(249,115,22,0.18))] lg:block" />
          <div className="grid gap-8">
            {resumeProcessSteps.map((item, index) => (
                <article
                  key={item.id}
                  ref={(node) => {
                    if (node) cardRefs.current[index] = node;
                  }}
                  className="relative rounded-[34px] border border-slate-200 bg-white shadow-[0_26px_80px_-48px_rgba(15,23,42,0.35)]"
                >
                  <div className="absolute -left-[5.3rem] top-12 hidden lg:flex">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-[0_22px_40px_-24px_rgba(15,23,42,0.45)]">
                      {item.step}
                      <span className="absolute left-14 top-1/2 h-px w-8 -translate-y-1/2 bg-sky-300" />
                    </div>
                  </div>

                  <div className="grid gap-0 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                    <div
                      ref={(node) => {
                        if (node) textRefs.current[index] = node;
                      }}
                      className="border-b border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 sm:p-8 xl:border-b-0 xl:border-r"
                    >
                      <div className="flex items-start gap-4 lg:hidden">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15">
                          {item.step}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-sky-700">{t("process.stepLabel", { number: index + 1 })}</p>
                          <h2 className="mt-1 text-2xl font-semibold leading-tight text-slate-950">{item.title}</h2>
                        </div>
                      </div>

                      <div className="hidden lg:block">
                        <p className="text-sm font-medium text-sky-700">{t("process.stepLabel", { number: index + 1 })}</p>
                        <h2 className="mt-1 text-3xl font-semibold leading-tight text-slate-950">{item.title}</h2>
                      </div>

                      <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                        {item.description}
                      </p>

                      <div className="mt-6 grid gap-3">
                        {item.points.map((point) => (
                          <div
                            key={point}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 transition-all duration-300 hover:border-sky-200 hover:bg-sky-50/40"
                          >
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  <div
                      ref={(node) => {
                        if (node) previewRefs.current[index] = node;
                      }}
                      className="bg-[linear-gradient(180deg,_#eef4ff_0%,_#ffffff_100%)] p-4 sm:p-5 lg:p-6"
                    >
                      <ProcessPreview
                        stepId={item.id}
                      />
                    </div>
                  </div>
                </article>
            ))}
          </div>
        </section>

        <section
          ref={ctaRef}
          className="rounded-[32px] border border-slate-200 bg-slate-950 px-6 py-7 text-white sm:px-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-sky-300">{t("process.ctaEyebrow")}</p>
              <h2 className="mt-2 text-2xl font-semibold">{t("process.ctaTitle")}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{t("process.ctaSubtitle")}</p>
            </div>
            <Link
              href={canAccessPremiumTemplates ? "/app?create=1&template=executive" : "/app/subscription"}
              className="inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
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
