import { Briefcase, Plus, Sparkles, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { IExperience } from "../models";

const ExperienceForm = ({
  data,
  onChange,
}: {
  data: IExperience[];
  onChange: (data: IExperience[]) => void;
}) => {
  const { t } = useTranslation();

  const addExperience = () => {
    const newExperience = {
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current: false,
    };
    onChange([...data, newExperience]);
  };

  const removeExperience = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateExperience = (index: number, field: string, value: string | boolean) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            {t("form.experience.title")}
          </h3>
          <p className="text-sm text-gray-500">{t("form.experience.subtitle")}</p>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          onClick={addExperience}
        >
          <Plus className="size-4" />
          {t("form.experience.add")}
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{t("form.experience.emptyTitle")}</p>
          <p className="text-sm">{t("form.experience.emptySubtitle")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((experience, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <h4>{t("form.experience.cardTitle", { index: index + 1 })}</h4>
                <button onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-700 transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={t("form.experience.company")}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300"
                  value={experience.company || ""}
                  onChange={(e) => updateExperience(index, "company", e.target.value)}
                />

                <input
                  type="text"
                  placeholder={t("form.experience.position")}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300"
                  value={experience.position || ""}
                  onChange={(e) => updateExperience(index, "position", e.target.value)}
                />

                <input
                  type="month"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300"
                  value={experience.start_date ? experience.start_date.toString().slice(0, 7) : ""}
                  onChange={(e) => updateExperience(index, "start_date", e.target.value)}
                />

                <input
                  type="month"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 disabled:bg-gray-100"
                  value={experience.end_date ? experience.end_date.toString().slice(0, 7) : ""}
                  onChange={(e) => updateExperience(index, "end_date", e.target.value)}
                  disabled={experience.is_current}
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={experience.is_current || false}
                  onChange={(e) => updateExperience(index, "is_current", e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{t("form.experience.current")}</span>
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">{t("form.experience.description")}</label>
                  <button className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50">
                    <Sparkles className="w-3 h-3" />
                    {t("form.experience.enhance")}
                  </button>
                </div>
                <textarea
                  value={experience.description || ""}
                  onChange={(e) => updateExperience(index, "description", e.target.value)}
                  rows={4}
                  className="w-full text-sm px-3 py-2 rounded-lg resize-none border border-gray-300"
                  placeholder={t("form.experience.placeholder")}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceForm;
