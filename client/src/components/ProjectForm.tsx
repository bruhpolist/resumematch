import type { IProject } from "../models";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProjectForm = ({
  data,
  onChange,
}: {
  data: IProject[];
  onChange: (data: IProject[]) => void;
}) => {
  const { t } = useTranslation();

  const addProject = () => {
    const newProject = {
      name: "",
      type: "",
      description: "",
    };
    onChange([...data, newProject]);
  };

  const removeProject = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateProject = (index: number, field: string, value: string | boolean) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">{t("form.projects.title")}</h3>
          <p className="text-sm text-gray-500">{t("form.projects.subtitle")}</p>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          onClick={addProject}
        >
          <Plus className="size-4" />
          {t("form.projects.add")}
        </button>
      </div>

      <div className="space-y-4 mt-6">
        {data.map((project, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <h4>{t("form.projects.cardTitle", { index: index + 1 })}</h4>
              <button onClick={() => removeProject(index)} className="text-red-500 hover:text-red-700 transition-colors">
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="grid gap-3">
              <input
                type="text"
                placeholder={t("form.projects.name")}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300"
                value={project.name || ""}
                onChange={(e) => updateProject(index, "name", e.target.value)}
              />

              <input
                type="text"
                placeholder={t("form.projects.type")}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300"
                value={project.type || ""}
                onChange={(e) => updateProject(index, "type", e.target.value)}
              />

              <textarea
                rows={4}
                placeholder={t("form.projects.description")}
                className="w-full px-3 py-2 text-sm rounded-lg resize-none border border-gray-300"
                value={project.description || ""}
                onChange={(e) => updateProject(index, "description", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectForm;
