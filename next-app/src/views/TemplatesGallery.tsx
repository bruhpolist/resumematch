"use client";

import Link from "next/link";
import { Crown, Eye, Filter, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ResumePreview from "@/components/ResumePreview";
import { useAppContext } from "@/contexts/AppContext";
import { getTemplateDemoResume } from "@/lib/demoResume";
import { templateCatalog } from "@/lib/templateCatalog";

type FilterMode = "all" | "free" | "premium";

const filterOptions: FilterMode[] = ["all", "free", "premium"];

export default function TemplatesGallery() {
  const { t } = useTranslation();
  const { canAccessPremiumTemplates } = useAppContext();
  const [filter, setFilter] = useState<FilterMode>("all");

  const visibleTemplates = useMemo(() => {
    if (filter === "free") return templateCatalog.filter((item) => !item.premium);
    if (filter === "premium") return templateCatalog.filter((item) => item.premium);
    return templateCatalog;
  }, [filter]);

  return (
    <div className="min-h-[calc(100vh-77px)] bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_30%,_#fff7ed_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.7)] sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.24),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.24),_transparent_30%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-sky-200">
                <Sparkles className="size-4" />
                {t("templates.badge")}
              </p>
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
                {t("templates.title")}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {t("templates.subtitle")}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/app/process"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  <Eye className="size-4" />
                  {t("templates.watchProcess")}
                </Link>
                <Link
                  href={canAccessPremiumTemplates ? "/app?create=1" : "/app/subscription"}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Crown className="size-4" />
                  {canAccessPremiumTemplates ? t("templates.startBuilder") : t("templates.unlockPremium")}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">{t("templates.statTotal")}</p>
                <p className="mt-3 text-3xl font-semibold">{templateCatalog.length}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">{t("templates.statPremium")}</p>
                <p className="mt-3 text-3xl font-semibold">
                  {templateCatalog.filter((item) => item.premium).length}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">{t("templates.statStatus")}</p>
                <p className="mt-3 text-lg font-semibold">
                  {canAccessPremiumTemplates ? t("templates.statusUnlocked") : t("templates.statusPreview")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-900">{t("templates.filterTitle")}</p>
            <p className="mt-1 text-sm text-slate-500">{t("templates.filterSubtitle")}</p>
          </div>

          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
            <span className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
              <Filter className="size-4" />
              {t("templates.filterLabel")}
            </span>
            {filterOptions.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === item ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white"
                }`}
              >
                {t(`templates.filter.${item}`)}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {visibleTemplates.map((template) => {
            const previewResume = getTemplateDemoResume(template.id);
            const locked = template.premium && !canAccessPremiumTemplates;

            return (
              <article
                key={template.id}
                className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_22px_60px_-40px_rgba(15,23,42,0.35)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
                  <div className="max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-950">{template.name}</h2>
                      {template.premium ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                          <Crown className="size-3.5" />
                          {t("templates.premiumBadge")}
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {t("templates.freeBadge")}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{template.preview}</p>
                  </div>

                  <Link
                    href={locked ? "/app/subscription" : `/app?create=1&template=${encodeURIComponent(template.id)}`}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      locked
                        ? "bg-amber-50 text-amber-900 hover:bg-amber-100"
                        : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    {locked ? t("templates.unlockPremium") : t("templates.useTemplate")}
                  </Link>
                </div>

                <div className="bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-5 sm:px-5">
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-inner">
                    <div className="h-[380px] overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 sm:h-[420px]">
                      <div className="w-[896px] origin-top-left scale-[0.33] sm:scale-[0.36]">
                        <ResumePreview
                          data={previewResume}
                          template={template.id}
                          accentColor={template.accentColor}
                          previewId={`template-preview-${template.id}`}
                          classes=" w-[896px] shadow-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
