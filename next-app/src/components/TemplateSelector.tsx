"use client";

import { Check, Crown, Layout } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";
import { templateCatalog } from "@/lib/templateCatalog";

export default function TemplateSelector({
  selectedTemplate,
  onChange,
}: {
  selectedTemplate: string;
  onChange: (templateId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { canAccessPremiumTemplates } = useAppContext();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 text-sm text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 ring-blue-300 hover:ring transition-all px-3 py-2 rounded-lg"
      >
        <Layout size={14} /> <span className="max-sm:hidden">Template</span>
      </button>
      {isOpen && (
        <div className="absolute top-full w-xs p-3 mt-2 space-y-3 z-20 bg-white rounded-md border border-gray-200 shadow-sm max-h-[70vh] overflow-auto">
          {templateCatalog.map((template) => {
            const locked = template.premium && !canAccessPremiumTemplates;
            return (
              <div
                key={template.id}
                onClick={() => {
                  if (locked) {
                    router.push("/app/subscription");
                    return;
                  }
                  onChange(template.id);
                  setIsOpen(false);
                }}
                className={`relative p-3 border rounded-md transition-all ${
                  locked
                    ? "border-amber-300 bg-amber-50 cursor-pointer"
                    : selectedTemplate === template.id
                      ? "border-blue-400 bg-blue-100 cursor-pointer"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-100 cursor-pointer"
                }`}
              >
                {selectedTemplate === template.id && !locked && (
                  <div className="absolute top-2 right-2">
                    <div className="size-5 bg-blue-400 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    {template.name}
                    {template.premium && <Crown className="size-4 text-amber-500" />}
                  </h4>
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-500 italic">
                    {template.preview}
                  </div>
                  {locked && <p className="text-xs text-amber-700 font-medium mt-1">Unlock in Subscription</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
