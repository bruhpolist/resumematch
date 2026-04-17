"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Crown,
  Eye,
  FilePenLineIcon,
  LayoutTemplate,
  PencilIcon,
  PlusIcon,
  Sparkles,
  TrashIcon,
  UploadCloud,
  UploadCloudIcon,
  WalletCards,
  XIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { IResume } from "../models";
import { useAppContext } from "../contexts/AppContext";
import ScrollReveal from "../components/ScrollReveal";
import { apiFetch } from "../lib/api";
import { extractPdfText } from "../lib/extractPdfText";
import { createResume, deleteResume, listResumes } from "../lib/resumeStorage";
import { templateCatalog } from "../lib/templateCatalog";

const accentPairs = [
  ["#0f766e", "#5eead4"],
  ["#0f172a", "#38bdf8"],
  ["#7c2d12", "#fb923c"],
  ["#312e81", "#818cf8"],
  ["#14532d", "#4ade80"],
];

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, billing, canAccessPremiumTemplates, hasActiveSubscription } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTemplateId = searchParams?.get("template") ?? "classic";
  const requestedTemplate =
    templateCatalog.find((item) => item.id === requestedTemplateId) ?? templateCatalog[0];

  const [allResumes, setAllResumes] = useState<IResume[]>([]);
  const [showCreateResume, setShowCreateResume] = useState(searchParams?.get("create") === "1");
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState<File>();
  const [selectedTemplateId, setSelectedTemplateId] = useState(requestedTemplate.id);
  const [isImportingResume, setIsImportingResume] = useState(false);

  const loadAllResumes = async () => {
    const resumes = await listResumes();
    setAllResumes(resumes);
  };

  useEffect(() => {
    void loadAllResumes();
  }, []);

  useEffect(() => {
    setShowCreateResume(searchParams?.get("create") === "1");
    setSelectedTemplateId(requestedTemplate.id);
  }, [requestedTemplate.id, searchParams]);

  const sortedResumes = [...allResumes].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
  const latestResume = sortedResumes[0];
  const publicResumes = allResumes.filter((item) => item.public).length;
  const premiumTemplateCount = sortedResumes.filter((item) => item.template !== "classic").length;

  const createDraftResume = async (event: FormEvent) => {
    event.preventDefault();

    const now = new Date().toISOString();
    const selectedTemplate =
      templateCatalog.find((item) => item.id === selectedTemplateId) ?? templateCatalog[0];
    const created = await createResume({
      _id: crypto.randomUUID(),
      title,
      userId: user?.id || "",
      personal_info: {
        full_name: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        website: "",
        profession: "",
        image: "",
      },
      professional_summary: "",
      experience: [],
      education: [],
      skills: [],
      project: [],
      template: selectedTemplate.id,
      accent_color: selectedTemplate.accentColor,
      public: false,
      createdAt: now,
      updatedAt: now,
      text_overrides: {
        elements: {},
        sections: {},
      },
    });

    setShowCreateResume(false);
    setTitle("");
    await loadAllResumes();
    router.push(`/app/builder/${created._id}`);
  };

  const uploadResume = async (event: FormEvent) => {
    event.preventDefault();
    if (!resume) return;

    try {
      setIsImportingResume(true);
      const now = new Date().toISOString();
      const resumeText = await extractPdfText(resume);
      const imported = await apiFetch<{
        importedResume: {
          title: string;
          personal_info: IResume["personal_info"];
          professional_summary: string;
          experience: IResume["experience"];
          education: IResume["education"];
          skills: IResume["skills"];
          project: IResume["project"];
        };
      }>("/api/resume-import", {
        method: "POST",
        body: JSON.stringify({ resumeText }),
      });

      const importedResume = imported.importedResume;
      const created = await createResume({
        _id: crypto.randomUUID(),
        title:
          title.trim() ||
          importedResume.title ||
          `${importedResume.personal_info.full_name || "Imported"} Resume`,
        userId: user?.id || "",
        personal_info: {
          ...importedResume.personal_info,
          image: "",
        },
        professional_summary: importedResume.professional_summary,
        experience: importedResume.experience,
        education: importedResume.education,
        skills: importedResume.skills,
        project: importedResume.project,
        template: "classic",
        accent_color: "#0ea5e9",
        public: false,
        createdAt: now,
        updatedAt: now,
        text_overrides: {
          elements: {},
          sections: {},
        },
      });

      setShowUploadResume(false);
      setTitle("");
      setResume(undefined);
      await loadAllResumes();
      router.push(`/app/builder/${created._id}`);
    } finally {
      setIsImportingResume(false);
    }
  };

  const closeCreateModal = () => {
    setShowCreateResume(false);
    setTitle("");
    setSelectedTemplateId("classic");
  };

  const closeUploadModal = () => {
    setShowUploadResume(false);
    setTitle("");
    setResume(undefined);
  };

  return (
    <div className="min-h-[calc(100vh-77px)] bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8fafc_28%,_#f8fafc_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <ScrollReveal className="w-full" delay={0}>
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_30px_100px_-40px_rgba(15,23,42,0.45)]">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_60%),radial-gradient(circle_at_bottom_right,_rgba(251,146,60,0.16),_transparent_56%)] lg:block" />
          <div className="relative grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-700">
                <Sparkles className="size-4" />
                {t("dashboard.badge")}
              </p>
              <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                {t("dashboard.heroTitle", { name: user?.name || t("nav.dashboard") })}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {t("dashboard.heroSubtitle")}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowCreateResume(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <PlusIcon className="size-4" />
                  {t("dashboard.create")}
                </button>
                <button
                  onClick={() => setShowUploadResume(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <UploadCloudIcon className="size-4" />
                  {t("dashboard.upload")}
                </button>
                <button
                  onClick={() => router.push("/app/templates")}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                >
                  <Crown className="size-4" />
                  {t("dashboard.exploreTemplates")}
                </button>
                <button
                  onClick={() => router.push("/app/process")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <Sparkles className="size-4" />
                  {t("dashboard.watchProcess")}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white">
                <p className="text-sm text-slate-300">{t("dashboard.currentPlan")}</p>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl font-semibold">{t(`subscription.${billing.plan}`)}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {hasActiveSubscription
                        ? t("dashboard.planActive")
                        : t("dashboard.planFreeHint")}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                    {billing.isUnlimited
                      ? t("subscription.unlimited")
                      : `${billing.tokenCount || 0} ${t("nav.credits").toLowerCase()}`}
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-orange-50 p-6">
                <p className="text-sm text-slate-500">{t("dashboard.quickStats")}</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-slate-900">
                  <div>
                    <p className="text-2xl font-semibold">{allResumes.length}</p>
                    <p className="mt-1 text-xs text-slate-500">{t("dashboard.statResumes")}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{publicResumes}</p>
                    <p className="mt-1 text-xs text-slate-500">{t("dashboard.statPublic")}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{premiumTemplateCount}</p>
                    <p className="mt-1 text-xs text-slate-500">{t("dashboard.statPremium")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </ScrollReveal>

        <ScrollReveal className="w-full" delay={80}>
        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: FilePenLineIcon,
              title: t("dashboard.cardCreateTitle"),
              description: t("dashboard.cardCreateBody"),
              action: t("dashboard.create"),
              onClick: () => setShowCreateResume(true),
              tone: "from-sky-500 to-cyan-500",
            },
            {
              icon: UploadCloudIcon,
              title: t("dashboard.cardUploadTitle"),
              description: t("dashboard.cardUploadBody"),
              action: t("dashboard.upload"),
              onClick: () => setShowUploadResume(true),
              tone: "from-orange-500 to-amber-400",
            },
            {
              icon: LayoutTemplate,
              title: t("dashboard.cardTemplatesTitle"),
              description: canAccessPremiumTemplates
                ? t("dashboard.cardTemplatesBodyUnlocked")
                : t("dashboard.cardTemplatesBodyLocked"),
              action: t("dashboard.openTemplates"),
              onClick: () => router.push("/app/templates"),
              tone: "from-violet-500 to-indigo-500",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={item.onClick}
                className="group rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className={`inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white`}>
                  <Icon className="size-5" />
                </span>
                <p className="mt-5 text-lg font-semibold text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  {item.action}
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </section>
        </ScrollReveal>

        {latestResume && (
          <ScrollReveal className="w-full" delay={120}>
          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white">
              <p className="text-sm text-sky-300">{t("dashboard.continueLabel")}</p>
              <h2 className="mt-3 text-3xl font-semibold">{latestResume.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                {latestResume.personal_info.profession ||
                  latestResume.personal_info.full_name ||
                  t("dashboard.continueFallback")}
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {t("dashboard.updated")} {new Date(latestResume.updatedAt).toLocaleDateString()}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {latestResume.public ? t("builder.public") : t("builder.private")}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {latestResume.template}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push(`/app/builder/${latestResume._id}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                >
                  <PencilIcon className="size-4" />
                  {t("dashboard.continueAction")}
                </button>
                <button
                  onClick={() => router.push(`/view/${latestResume._id}`)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
                >
                  <Eye className="size-4" />
                  {t("dashboard.previewResume")}
                </button>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-7">
              <p className="text-sm text-slate-500">{t("dashboard.accountSnapshot")}</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">{t("dashboard.creditsLabel")}</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-950">
                        {billing.isUnlimited ? t("subscription.unlimited") : billing.tokenCount || 0}
                      </p>
                    </div>
                    <WalletCards className="size-6 text-slate-400" />
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{t("dashboard.templatesLabel")}</p>
                  <p className="mt-1 text-base font-semibold text-slate-950">
                    {canAccessPremiumTemplates
                      ? t("dashboard.templatesUnlocked")
                      : t("dashboard.templatesLocked")}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{t("dashboard.nextBestActionTitle")}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {allResumes.length > 1
                      ? t("dashboard.nextBestActionExisting")
                      : t("dashboard.nextBestActionNew")}
                  </p>
                </div>
              </div>
            </div>
          </section>
          </ScrollReveal>
        )}

        <ScrollReveal className="w-full" delay={160}>
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-sky-700">{t("dashboard.libraryLabel")}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{t("dashboard.libraryTitle")}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t("dashboard.librarySubtitle")}
              </p>
            </div>
            <button
              onClick={() => setShowCreateResume(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <PlusIcon className="size-4" />
              {t("dashboard.newDraft")}
            </button>
          </div>

          {sortedResumes.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-white shadow-sm">
                <FilePenLineIcon className="size-7 text-slate-500" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">{t("dashboard.emptyTitle")}</h3>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
                {t("dashboard.emptySubtitle")}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setShowCreateResume(true)}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {t("dashboard.create")}
                </button>
                <button
                  onClick={() => setShowUploadResume(true)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  {t("dashboard.upload")}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sortedResumes.map((resumeItem, index) => {
                const [baseColor, glowColor] = accentPairs[index % accentPairs.length];
                return (
                  <div
                    key={resumeItem._id}
                    className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-28 opacity-90"
                      style={{
                        background: `linear-gradient(135deg, ${baseColor} 0%, ${glowColor} 100%)`,
                      }}
                    />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/90 shadow-sm">
                          <FilePenLineIcon className="size-5" style={{ color: baseColor }} />
                        </span>
                        <div className="flex items-center gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                          <button
                            onClick={() => router.push(`/app/builder/${resumeItem._id}`)}
                            className="inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
                            aria-label="Edit"
                          >
                            <PencilIcon className="size-4" />
                          </button>
                          <button
                            onClick={async () => {
                              await deleteResume(resumeItem._id);
                              await loadAllResumes();
                            }}
                            className="inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
                            aria-label="Delete"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-16">
                        <p className="text-lg font-semibold text-slate-950">{resumeItem.title}</p>
                        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                          {resumeItem.personal_info.profession ||
                            resumeItem.personal_info.full_name ||
                            t("dashboard.resumeFallback")}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                          {resumeItem.template}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                          {resumeItem.public ? t("builder.public") : t("builder.private")}
                        </span>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                        <p className="text-xs text-slate-500">
                          {t("dashboard.updated")} {new Date(resumeItem.updatedAt).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => router.push(`/app/builder/${resumeItem._id}`)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950"
                        >
                          {t("dashboard.openResume")}
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        </ScrollReveal>
      </div>

      {showCreateResume && (
        <form
          onSubmit={createDraftResume}
          onClick={closeCreateModal}
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-sm"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="animate-modal-in relative w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl"
          >
            <button
              type="button"
              onClick={closeCreateModal}
              className="absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <XIcon className="size-4" />
            </button>
            <div className="inline-flex size-14 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
              <PlusIcon className="size-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-slate-950">{t("dashboard.modalCreateTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("dashboard.modalCreateSubtitle")}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              <LayoutTemplate className="size-4 text-slate-500" />
              <span className="text-slate-500">Template:</span>
              <span className="font-semibold text-slate-900">
                {templateCatalog.find((item) => item.id === selectedTemplateId)?.name ?? "Classic"}
              </span>
            </div>
            <input
              onChange={(event) => setTitle(event.target.value)}
              value={title}
              type="text"
              placeholder={t("dashboard.titlePlaceholder")}
              className="mt-6 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              required
            />
            <button className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              {t("dashboard.create")}
            </button>
          </div>
        </form>
      )}

      {showUploadResume && (
        <form
          onSubmit={uploadResume}
          onClick={closeUploadModal}
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-sm"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="animate-modal-in relative w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl"
          >
            <button
              type="button"
              onClick={closeUploadModal}
              className="absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <XIcon className="size-4" />
            </button>
            <div className="inline-flex size-14 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
              <UploadCloud className="size-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-slate-950">{t("dashboard.modalUploadTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("dashboard.modalUploadSubtitle")}</p>

            <input
              onChange={(event) => setTitle(event.target.value)}
              value={title}
              type="text"
              placeholder={t("dashboard.titlePlaceholder")}
              className="mt-6 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
              required
            />

            <label
              htmlFor="resume-input"
              className="mt-4 block cursor-pointer rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-amber-400 hover:bg-amber-50/60"
            >
              {resume ? (
                <div>
                  <p className="text-sm font-medium text-slate-900">{resume.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{t("dashboard.fileSelected")}</p>
                </div>
              ) : (
                <div>
                  <UploadCloud className="mx-auto size-12 text-slate-400" />
                  <p className="mt-4 text-sm font-medium text-slate-900">{t("dashboard.selectFile")}</p>
                  <p className="mt-1 text-xs text-slate-500">{t("dashboard.dropzoneHint")}</p>
                </div>
              )}
            </label>
            <input
              type="file"
              id="resume-input"
              accept=".pdf"
              hidden
              onChange={(event: ChangeEvent<HTMLInputElement>) => setResume(event.target.files?.[0])}
            />

            <button
              disabled={isImportingResume}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isImportingResume ? "Импортируем резюме..." : t("dashboard.upload")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Dashboard;
