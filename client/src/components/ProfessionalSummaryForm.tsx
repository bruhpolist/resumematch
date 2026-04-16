import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProfessionalSummaryForm = ({
  data,
  onChange,
}: {
  data: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            {t("form.summary.title")}
          </h3>
          <p className="text-sm text-gray-500">{t("form.summary.subtitle")}</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50">
          <Sparkles className="size-4" />
          {t("form.summary.ai")}
        </button>
      </div>

      <div className="mt-6">
        <textarea
          value={data || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={7}
          className="w-full p-3 px-4 mt-2 border text-sm border-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
          placeholder={t("form.summary.placeholder")}
        />
        <p className="text-xs text-gray-500 max-w-4/5 mx-auto text-center">
          {t("form.summary.tip")}
        </p>
      </div>
    </div>
  );
};

export default ProfessionalSummaryForm;
