import {
  FilePenLineIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadCloud,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { IResume } from "../models";
import { useLocation, useNavigate } from "react-router-dom";
import { createResume, deleteResume, listResumes } from "../lib/resumeStorage";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../contexts/AppContext";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const colors = ["#0f766e", "#0ea5e9", "#ea580c", "#0891b2", "#16a34a"];

  const [allResumes, setAllResumes] = useState<IResume[]>([]);
  const location = useLocation();
  const shouldOpenCreate = new URLSearchParams(location.search).get("create") === "1";
  const [showCreateResume, setShowCreateResume] = useState(shouldOpenCreate);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState<File>();

  const navigate = useNavigate();

  const loadAllResumes = async () => {
    const resumes = await listResumes();
    setAllResumes(resumes);
  };

  const createDraftResume = async (e: FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString();
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

    setShowCreateResume(false);
    setTitle("");
    await loadAllResumes();
    navigate(`/app/builder/${created._id}`);
  };

  const uploadResume = async (e: FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString();
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
      professional_summary: resume ? `Uploaded file: ${resume.name}` : "",
      experience: [],
      education: [],
      skills: [],
      project: [],
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
    navigate(`/app/builder/${created._id}`);
  };

  useEffect(() => {
    let isMounted = true;

    listResumes().then((resumes) => {
      if (isMounted) {
        setAllResumes(resumes);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-2xl font-medium mb-6 bg-gradient-to-r from-slate-700 to-cyan-700 bg-clip-text text-transparent sm:hidden">
          {t("dashboard.hello", { name: user?.name || "" })}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateResume(true)}
            className="w-full bg-white sm:max-w-40 h-48 flex flex-col items-center justify-center rounded-xl gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-cyan-500 hover:shadow-lg transition-all duration-300"
          >
            <PlusIcon className="size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-cyan-500 to-sky-600 text-white rounded-full" />
            <p className="text-sm transition-all duration-300 ">{t("dashboard.create")}</p>
          </button>

          <button
            onClick={() => setShowUploadResume(true)}
            className="w-full bg-white sm:max-w-40 h-48 flex flex-col items-center justify-center rounded-xl gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-amber-500 hover:shadow-lg transition-all duration-300"
          >
            <UploadCloudIcon className="size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full" />
            <p className="text-sm transition-all duration-300 ">{t("dashboard.upload")}</p>
          </button>
        </div>

        <hr className="border-slate-300 my-6 sm:w-[345px]" />

        <div className="grid grid-cols-2 sm:flex flex-wrap gap-4">
          {allResumes.map((resumeItem, index) => {
            const baseColor = colors[index % colors.length];
            return (
              <div
                key={resumeItem._id}
                className="relative w-full sm:max-w-40 h-48 flex flex-col items-center justify-center rounded-xl gap-2 border group hover:shadow-lg transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${baseColor}15, ${baseColor}45)`,
                  borderColor: `${baseColor}40`,
                }}
              >
                <button
                  onClick={() => navigate(`/app/builder/${resumeItem._id}`)}
                  className="absolute inset-0"
                  aria-label={resumeItem.title}
                />
                <FilePenLineIcon
                  className="size-7 group-hover:scale-105 transition-all"
                  style={{ color: baseColor }}
                />
                <p
                  className="text-sm group-hover:scale-105 transition-all px-2 text-center"
                  style={{ color: baseColor }}
                >
                  {resumeItem.title}
                </p>
                <p
                  className="absolute bottom-1 text-[11px] group-hover:text-slate-500 transition-all duration-300 px-2 text-center"
                  style={{ color: `${baseColor}90` }}
                >
                  {t("dashboard.updated")} {new Date(resumeItem.updatedAt).toLocaleDateString()}
                </p>
                <div className="absolute top-1 right-1 group-hover:flex items-center hidden z-10">
                  <button
                    onClick={async () => {
                      await deleteResume(resumeItem._id);
                      await loadAllResumes();
                    }}
                    className="size-7 p-1.5 hover:bg-white/40 rounded text-slate-700 transition-colors"
                    aria-label="Delete"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/app/builder/${resumeItem._id}`)}
                    className="size-7 p-1.5 hover:bg-white/40 rounded text-slate-700 transition-colors"
                    aria-label="Edit"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {showCreateResume && (
          <form
            onSubmit={createDraftResume}
            onClick={() => setShowCreateResume(false)}
            className="fixed inset-0 bg-black/70 bg-opacity-50 z-10 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6"
            >
              <h2 className="text-xl font-bold mb-4">{t("dashboard.create")}</h2>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder={t("dashboard.titlePlaceholder")}
                className="w-full px-4 py-2 mb-4 border rounded-lg focus:border-cyan-600"
                required
              />
              <button className="w-full bg-cyan-600 text-white rounded py-2 hover:bg-cyan-700 transition-colors">
                {t("dashboard.create")}
              </button>
              <XIcon
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => {
                  setShowCreateResume(false);
                  setTitle("");
                }}
              />
            </div>
          </form>
        )}

        {showUploadResume && (
          <form
            onSubmit={uploadResume}
            onClick={() => setShowUploadResume(false)}
            className="fixed inset-0 bg-black/70 bg-opacity-50 z-10 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6"
            >
              <h2 className="text-xl font-bold mb-4">{t("dashboard.upload")}</h2>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder={t("dashboard.titlePlaceholder")}
                className="w-full px-4 py-2 mb-4 border rounded-lg focus:border-cyan-600"
                required
              />
              <div>
                <label className="block text-sm text-slate-700" htmlFor="resume-input">
                  {t("dashboard.selectFile")}
                  <div
                    className="flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-cyan-500 hover:text-cyan-700 cursor-pointer transition-colors"
                  >
                    {resume ? (
                      <p className="text-cyan-700">{resume.name}</p>
                    ) : (
                      <>
                        <UploadCloud className="size-14 stroke-1" />
                        <p>{t("dashboard.upload")}</p>
                      </>
                    )}
                  </div>
                </label>
                <input
                  type="file"
                  id="resume-input"
                  accept=".pdf"
                  hidden
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setResume(e.target.files?.[0])}
                />
              </div>
              <button className="w-full py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors">
                {t("dashboard.upload")}
              </button>
              <XIcon
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => {
                  setShowUploadResume(false);
                  setTitle("");
                }}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
