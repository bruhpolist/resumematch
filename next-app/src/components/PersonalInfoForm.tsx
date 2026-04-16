import {
  BriefcaseBusiness,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { IPersonalInfo } from "../models";

type PersonalTextField = Exclude<keyof IPersonalInfo, "image">;

const PersonalInfoForm = ({
  data,
  onChange,
  removeBackground,
  setRemoveBackgroud,
}: {
  data: IPersonalInfo;
  onChange: (data: IPersonalInfo) => void;
  removeBackground: boolean;
  setRemoveBackgroud: Dispatch<SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();

  const handleChange = (field: keyof IPersonalInfo, value: string | File) => {
    onChange({ ...data, [field]: value });
  };

  const fields: {
    key: PersonalTextField;
    labelKey: string;
    icon: typeof User;
    type: string;
    required?: boolean;
  }[] = [
    { key: "full_name", labelKey: "form.personal.fullName", icon: User, type: "text", required: true },
    { key: "email", labelKey: "form.personal.email", icon: Mail, type: "email", required: true },
    { key: "phone", labelKey: "form.personal.phone", icon: Phone, type: "tel" },
    { key: "location", labelKey: "form.personal.location", icon: MapPin, type: "text" },
    { key: "profession", labelKey: "form.personal.profession", icon: BriefcaseBusiness, type: "text" },
    { key: "linkedin", labelKey: "form.personal.linkedin", icon: Linkedin, type: "url" },
    { key: "website", labelKey: "form.personal.website", icon: Globe, type: "url" },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{t("form.personal.title")}</h3>
      <p className="text-sm text-gray-600">{t("form.personal.subtitle")}</p>
      <div className="flex items-center gap-2">
        <label>
          {data.image ? (
            <img
              src={typeof data.image === "string" ? data.image : URL.createObjectURL(data.image)}
              alt="user-image"
              className="w-16 h-16 rounded-full object-cover mt-5 ring ring-slate-300 hover:opacity-80"
            />
          ) : (
            <div className="inline-flex items-center gap-2 mt-5 text-slate-600 hover:text-slate-700 cursor-pointer">
              <User className="size-10 p-2.5 border rounded-full" />
              {t("form.personal.uploadImage")}
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg, image/png"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                handleChange("image", selectedFile);
              }
            }}
          />
        </label>
        {typeof data.image === "object" && (
          <div className="flex flex-col gap-1 pl-4 text-sm">
            <p>{t("form.personal.removeBg")}</p>
            <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
              <input
                type="checkbox"
                className="sr-only peer"
                onChange={() => setRemoveBackgroud((prev: boolean) => !prev)}
                checked={removeBackground}
              />
              <div className="w-9 h-5 bg-slate-300 rounded-full peer perr-checked:bg-green-600 transition-colors duration-200"></div>
              <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
            </label>
          </div>
        )}
      </div>
      {fields.map((field) => {
        const Icon = field.icon;
        const label = t(field.labelKey);
        return (
          <div className="space-y-1 mt-5" key={field.key}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Icon className="size-4" />
              {label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={data[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              placeholder={t("form.personal.placeholder", { label: label.toLowerCase() })}
              required={field.required}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PersonalInfoForm;
