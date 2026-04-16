import type { IEducation } from "../models";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const EducationForm = ({
  data,
  onChange,
}: {
  data: IEducation[];
  onChange: (data: IEducation[]) => void;
}) => {
  const { t } = useTranslation();

  const addEducation = () => {
    const newEducation = {
      institution: "",
      degree: "",
      field: "",
      graduation_date: "",
      gpa: "",
    };
    onChange([...data, newEducation]);
  };

  const removeEducation = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateEducation = (index: number, field: string, value: string | boolean) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">{t("form.education.title")}</h3>
          <p className="text-sm text-gray-500">{t("form.education.subtitle")}</p>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          onClick={addEducation}
        >
          <Plus className="size-4" />
          {t("form.education.add")}
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{t("form.education.emptyTitle")}</p>
          <p className="text-sm">{t("form.education.emptySubtitle")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((education, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <h4>{t("form.education.cardTitle", { index: index + 1 })}</h4>
                <button onClick={() => removeEducation(index)} className="text-red-500 hover:text-red-700 transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={t("form.education.institution")}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300"
                  value={education.institution || ""}
                  onChange={(e) => updateEducation(index, "institution", e.target.value)}
                />

                <input
                  type="text"
                  placeholder={t("form.education.degree")}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300"
                  value={education.degree || ""}
                  onChange={(e) => updateEducation(index, "degree", e.target.value)}
                />

                <input
                  type="text"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300"
                  value={education.field || ""}
                  onChange={(e) => updateEducation(index, "field", e.target.value)}
                  placeholder={t("form.education.field")}
                />

                <input
                  type="month"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300"
                  value={education.graduation_date ? education.graduation_date.toString().slice(0, 7) : ""}
                  onChange={(e) => updateEducation(index, "graduation_date", e.target.value)}
                />
              </div>

              <input
                type="text"
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 w-full"
                value={education.gpa || ""}
                onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                placeholder={t("form.education.gpa")}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationForm;
