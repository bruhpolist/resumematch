import { Check, Crown, Layout } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";

const templates = [
  { id: "classic", name: "Classic", preview: "A clean, traditional resume format.", premium: false },
  { id: "modern", name: "Modern", preview: "Sleek design with strategic use of color.", premium: false },
  { id: "minimal-image", name: "Minimal Image", preview: "Minimal design with profile image.", premium: false },
  { id: "minimal", name: "Minimal", preview: "Ultra-clean design that focuses on content.", premium: false },
  { id: "executive", name: "Executive", preview: "Poster layout with left information rail, circular photo, pill headers, and bold skill bars.", premium: true },
  { id: "corporate", name: "Corporate", preview: "Magazine-inspired layout with giant circles, centered portrait, and airy editorial sections.", premium: true },
  { id: "elegant", name: "Elegant", preview: "Minimal gray editorial board with strong header band, timeline, and achievement blocks.", premium: true },
  { id: "sidebar-pro", name: "Sidebar Pro", preview: "Dark poster card with glowing circular frame, stacked panels, and neon-style skill chart.", premium: true },
  { id: "compact-pro", name: "Compact Pro", preview: "Soft infographic resume with central axis, rounded gradient labels, and node-based sections.", premium: true },
  { id: "golden-arc", name: "Golden Arc", preview: "Golden left rail with rounded portrait crop, pill headers, and editorial experience blocks.", premium: true },
  { id: "aqua-orbit", name: "Aqua Orbit", preview: "Aqua poster with floating circles, deep side panel, portrait card, and structured two-column body.", premium: true },
  { id: "soft-taupe", name: "Soft Taupe", preview: "Taupe minimal resume board with circular CV badge, mono lines, soft dividers, and calm hierarchy.", premium: true },
  { id: "teal-stripe", name: "Teal Stripe", preview: "Dark teal sidebar with angled top motif, compact data modules, and crisp right-column sections.", premium: true },
  { id: "navy-beam", name: "Navy Beam", preview: "Navy hero header with diagonal beams, giant circular portrait, contact rail, and timeline body.", premium: true },
  { id: "futuristic-neon", name: "Futuristic Neon", preview: "Cyberpunk-inspired neon HUD layout with glowing panels, sci-fi overlays, matrix cards, and rich futuristic elements.", premium: true },
];

export default function TemplateSelector({
  selectedTemplate,
  onChange,
}: {
  selectedTemplate: string;
  onChange: (templateId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
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
          {templates.map((template) => {
            const locked = template.premium && !canAccessPremiumTemplates;
            return (
              <div
                key={template.id}
                onClick={() => {
                  if (locked) {
                    navigate("/app/subscription");
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
