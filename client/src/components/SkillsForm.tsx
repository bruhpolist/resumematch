import { Plus, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

const SkillsForm = ({
  data,
  onChange,
}: {
  data: string[];
  onChange: (data: string[]) => void;
}) => {
  const { t } = useTranslation();
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !data.includes(newSkill.trim())) {
      onChange([...data, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (indexToRem: number) => {
    onChange(data.filter((_, index) => index !== indexToRem));
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">{t("form.skills.title")}</h3>
        <p>{t("form.skills.subtitle")}</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t("form.skills.placeholder")}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
          onChange={(e) => setNewSkill(e.target.value)}
          value={newSkill}
          onKeyDown={handleKeyPress}
        />
        <button
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="size-4" /> {t("form.skills.add")}
        </button>
      </div>
      {data.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.map((skill, index) => (
            <span key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {skill}
              <button
                onClick={() => removeSkill(index)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div>
          <Sparkles className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-center text-gray-500">{t("form.skills.emptyTitle")}</p>
          <p className="text-sm text-center">{t("form.skills.emptySubtitle")}</p>
        </div>
      )}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>{t("form.skills.tip")}</strong> {t("form.skills.tipText")}
        </p>
      </div>
    </div>
  );
};

export default SkillsForm;
