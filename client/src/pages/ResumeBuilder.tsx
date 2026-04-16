import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type {
  IEducation,
  IExperience,
  IPersonalInfo,
  IProject,
  ResumeData,
} from "../models/index";
import {
  ArrowLeftIcon,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FileText,
  FolderIcon,
  GraduationCap,
  Share2Icon,
  Sparkles,
  User,
  X,
} from "lucide-react";
import PersonalInfoForm from "../components/PersonalInfoForm";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import ColorPicker from "../components/ColorPicker";
import ProfessionalSummaryForm from "../components/ProfessionalSummaryForm";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import ProjectForm from "../components/ProjectForm";
import SkillsForm from "../components/SkillsForm";
import { getResumeValidationWarnings } from "../lib/resumeAnalysis";
import { downloadResumePdf } from "../lib/downloadResumePdf";
import { getResumeById, saveResume } from "../lib/resumeStorage";
import { useAppContext } from "../contexts/AppContext";

const createEmptyResume = (id: string, userId = ""): ResumeData => ({
  _id: id,
  title: "Untitled Resume",
  userId,
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
  template: "classic",
  accent_color: "#3B82F6",
  text_overrides: {
    elements: {},
    sections: {},
  },
  public: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const ResumeBuilder = () => {
  const { t } = useTranslation();
  const { canAccessPremiumTemplates, user } = useAppContext();
  const navigate = useNavigate();
  const { resumeId } = useParams();
  const resolvedResumeId = resumeId ?? "res123";
  const [resumeData, setResumeData] = useState<ResumeData>(
    createEmptyResume(resolvedResumeId, user?.id || "")
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ];

  const activeSection = sections[activeSectionIndex];

  const loadExistingResume = useCallback(async () => {
    const resume = await getResumeById(resolvedResumeId);
    if (resume) {
      setResumeData(resume);
      document.title = resume.title;
      return;
    }
    const emptyResume = createEmptyResume(resolvedResumeId, user?.id || "");
    setResumeData(emptyResume);
    document.title = emptyResume.title;
  }, [resolvedResumeId, user?.id]);

  useEffect(() => {
    loadExistingResume();
  }, [loadExistingResume]);

  useEffect(() => {
    const premiumTemplates = [
      "executive",
      "corporate",
      "elegant",
      "sidebar-pro",
      "compact-pro",
      "golden-arc",
      "aqua-orbit",
      "soft-taupe",
      "teal-stripe",
      "navy-beam",
      "futuristic-neon",
    ];
    if (
      !canAccessPremiumTemplates &&
      premiumTemplates.includes(resumeData.template)
    ) {
      setResumeData((prev) => ({ ...prev, template: "classic" }));
    }
  }, [resumeData.template, canAccessPremiumTemplates]);

  const changeResumeVisibility = () => {
    setResumeData((prev) => ({ ...prev, public: !prev.public }));
  };

  const handleShare = () => {
    const frontendUrl = window.location.href.split("/app/")[0];
    const resumeUrl = frontendUrl + "/view/" + resumeId;

    if (navigator.share) {
      navigator.share({ url: resumeUrl, text: "My Resume" });
    } else {
      alert("Share feature not available in your browser");
    }
  };

  const downloadResume = async () => {
    try {
      setIsDownloading(true);
      const fileName =
        (resumeData.personal_info.full_name || "resume")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "resume";
      await downloadResumePdf(fileName);
    } catch (error) {
      console.error("Failed to export resume", error);
      alert(t("builder.downloadError"));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveChanges = async () => {
    const updatedResume: ResumeData = {
      ...resumeData,
      _id: resolvedResumeId,
      updatedAt: new Date().toISOString(),
      createdAt: resumeData.createdAt || new Date().toISOString(),
      title:
        resumeData.title ||
        `${resumeData.personal_info.full_name || "Untitled"} Resume`,
    };
    const savedResume = await saveResume(resolvedResumeId, updatedResume);
    setResumeData(savedResume);
    setSaveMessage(t("builder.saved"));
    window.setTimeout(() => setSaveMessage(""), 2500);
  };

  const handleAnalyzeResume = async () => {
    const warnings = getResumeValidationWarnings(resumeData);
    if (warnings.length > 0) {
      setValidationWarnings(warnings);
      return;
    }
    setValidationWarnings([]);
    await handleSaveChanges();
    navigate(`/app/builder/${resolvedResumeId}/analysis`);
  };

  return (
    <div>
      <div className="max-w-7xl max-auto px-4 py-6">
        <Link
          to="/app"
          className="inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all"
        >
          <ArrowLeftIcon className="size-4" /> {t("builder.back")}
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="relative lg:col-span-5 rounded-lg overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1">
              <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200" />
              <hr
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-500"
                style={{
                  width: `${(activeSectionIndex * 100) / (sections.length - 1)}%`,
                }}
              />

              <div className="flex justify-between items-center mb-6 border-b border-gray-300 py-1">
                <div className="flex items-center gap-2">
                  <TemplateSelector
                    selectedTemplate={resumeData.template}
                    onChange={(template: string) =>
                      setResumeData((prev) => ({ ...prev, template }))
                    }
                  />
                  <ColorPicker
                    selectedColor={resumeData.accent_color}
                    onChange={(color) =>
                      setResumeData((prev) => ({
                        ...prev,
                        accent_color: color,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center">
                  {activeSectionIndex !== 0 && (
                    <button
                      onClick={() =>
                        setActiveSectionIndex((prevIndex) => Math.max(prevIndex - 1, 0))
                      }
                      className="flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                      disabled={activeSectionIndex === 0}
                    >
                      <ChevronLeft className="size-4" /> {t("common.previous")}
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setActiveSectionIndex((prevIndex) =>
                        Math.min(prevIndex + 1, sections.length - 1)
                      )
                    }
                    className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${
                      activeSectionIndex === sections.length - 1 && "opacity-50"
                    }`}
                    disabled={activeSectionIndex === sections.length - 1}
                  >
                    {t("common.next")} <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {activeSection.id === "personal" && (
                  <PersonalInfoForm
                    data={resumeData.personal_info}
                    onChange={(data: IPersonalInfo) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personal_info: data,
                      }))
                    }
                    removeBackground={removeBackground}
                    setRemoveBackgroud={setRemoveBackground}
                  />
                )}
                {activeSection.id === "summary" && (
                  <ProfessionalSummaryForm
                    data={resumeData.professional_summary}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        professional_summary: data,
                      }))
                    }
                  />
                )}
                {activeSection.id === "experience" && (
                  <ExperienceForm
                    data={resumeData.experience}
                    onChange={(data: IExperience[]) =>
                      setResumeData((prev) => ({
                        ...prev,
                        experience: data,
                      }))
                    }
                  />
                )}
                {activeSection.id === "education" && (
                  <EducationForm
                    data={resumeData.education}
                    onChange={(data: IEducation[]) =>
                      setResumeData((prev) => ({
                        ...prev,
                        education: data,
                      }))
                    }
                  />
                )}
                {activeSection.id === "projects" && (
                  <ProjectForm
                    data={resumeData.project}
                    onChange={(data: IProject[]) =>
                      setResumeData((prev) => ({
                        ...prev,
                        project: data,
                      }))
                    }
                  />
                )}
                {activeSection.id === "skills" && (
                  <SkillsForm
                    data={resumeData.skills}
                    onChange={(data: string[]) =>
                      setResumeData((prev) => ({
                        ...prev,
                        skills: data,
                      }))
                    }
                  />
                )}
              </div>

              <button
                onClick={handleSaveChanges}
                className="bg-gradient-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm"
              >
                {t("builder.save")}
              </button>
              <button
                onClick={handleAnalyzeResume}
                className="ml-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-md px-6 py-2 mt-6 text-sm font-medium hover:opacity-95 transition-all"
              >
                {t("builder.analyze")}
              </button>

              {!!saveMessage && <p className="text-sm text-green-700 mt-3">{saveMessage}</p>}

              {validationWarnings.length > 0 && (
                <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-900">{t("builder.validationIntro")}</p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-amber-800">
                    {validationWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 max-lg:mt-6">
            <div className="relative w-full">
              <div className="absolute bottom-3 left-0 right-0 flex flex-wrap items-center justify-end gap-2">
                {resumeData.public && (
                  <button
                    onClick={handleShare}
                    className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors"
                  >
                    <Share2Icon className="size-4" /> {t("builder.share")}
                  </button>
                )}
                <button
                  onClick={changeResumeVisibility}
                  className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 ring-purple-300 rounded-lg hover:ring transition-colors"
                >
                  {resumeData.public ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                  {resumeData.public ? t("builder.public") : t("builder.private")}
                </button>
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-2 px-6 py-2 text-xs bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 rounded-lg ring-slate-300 hover:ring transition-colors"
                >
                  <EyeIcon className="size-4" /> {t("builder.preview")}
                </button>
                <button
                  onClick={downloadResume}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-6 py-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <DownloadIcon className="size-4" /> {isDownloading ? t("builder.preparingPdf") : t("builder.download")}
                </button>
                <button
                  onClick={handleAnalyzeResume}
                  className="flex items-center gap-2 px-6 py-2 text-xs font-semibold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-lg hover:opacity-95 transition-colors"
                >
                  <Sparkles className="size-4" /> {t("builder.analyze")}
                </button>
              </div>
            </div>
            <ResumePreview
              data={resumeData}
              template={resumeData.template}
              accentColor={resumeData.accent_color}
              editable
              onTextOverridesChange={(text_overrides) =>
                setResumeData((prev) => ({
                  ...prev,
                  text_overrides,
                }))
              }
            />
          </div>
        </div>
      </div>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{t("builder.previewTitle")}</p>
                <p className="text-xs text-slate-500">{t("builder.previewHint")}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadResume}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <DownloadIcon className="size-4" />
                  {isDownloading ? t("builder.preparingPdf") : t("builder.downloadPdf")}
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <X className="size-4" />
                  {t("common.close")}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-100 p-6">
              <div className="mx-auto max-w-4xl">
                <ResumePreview
                  data={resumeData}
                  template={resumeData.template}
                  accentColor={resumeData.accent_color}
                  previewId="resume-preview-modal"
                  classes=" shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;


