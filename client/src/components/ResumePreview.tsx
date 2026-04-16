import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Minus, Palette, Plus, RotateCcw, Type, X } from "lucide-react";
import MinimalImageTemplate from "./templates/MinimalImageTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import ClassicTemplate from "./templates/ClassicTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import type {
  IResume,
  IResumeTextOverrides,
  ITextElementOverride,
  ITextSectionOverride,
} from "../models";
import ExecutiveTemplate from "./templates/ExecutiveTemplate";
import CorporateTemplate from "./templates/CorporateTemplate";
import ElegantTemplate from "./templates/ElegantTemplate";
import SidebarProTemplate from "./templates/SidebarProTemplate";
import CompactProTemplate from "./templates/CompactProTemplate";
import GoldenArcTemplate from "./templates/GoldenArcTemplate";
import AquaOrbitTemplate from "./templates/AquaOrbitTemplate";
import SoftTaupeTemplate from "./templates/SoftTaupeTemplate";
import TealStripeTemplate from "./templates/TealStripeTemplate";
import NavyBeamTemplate from "./templates/NavyBeamTemplate";
import FuturisticNeonTemplate from "./templates/FuturisticNeonTemplate";

type ScopeMode = "element" | "section";

const DEFAULT_OVERRIDES: IResumeTextOverrides = {
  elements: {},
  sections: {},
};

const EDITABLE_TAGS = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "P",
  "SPAN",
  "LI",
  "DIV",
  "SMALL",
  "STRONG",
  "EM",
]);

const getNodePath = (root: HTMLElement, node: HTMLElement) => {
  const parts: number[] = [];
  let current: HTMLElement | null = node;

  while (current && current !== root) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) break;
    const index = Array.from(parent.children).indexOf(current);
    parts.unshift(index);
    current = parent;
  }

  return parts.join("-");
};

const getEffectiveTextTransform = (
  elementOverride?: ITextElementOverride,
  sectionOverride?: ITextSectionOverride
) => elementOverride?.textTransform ?? sectionOverride?.textTransform ?? "none";

const getInitialOverrides = (overrides?: IResumeTextOverrides) =>
  overrides ?? DEFAULT_OVERRIDES;

const ResumePreview = ({
  data,
  template,
  accentColor,
  classes = "",
  previewId = "resume-preview",
  editable = false,
  onTextOverridesChange,
}: {
  data: IResume;
  template: string;
  accentColor: string;
  classes?: string;
  previewId?: string;
  editable?: boolean;
  onTextOverridesChange?: (overrides: IResumeTextOverrides) => void;
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("root");
  const [scopeMode, setScopeMode] = useState<ScopeMode>("element");
  const textOverrides = data.text_overrides ?? DEFAULT_OVERRIDES;

  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return <ModernTemplate data={data} accentColor={accentColor} />;
      case "minimal":
        return <MinimalTemplate data={data} accentColor={accentColor} />;
      case "minimal-image":
        return <MinimalImageTemplate data={data} accentColor={accentColor} />;
      case "executive":
        return <ExecutiveTemplate data={data} accentColor={accentColor} />;
      case "corporate":
        return <CorporateTemplate data={data} accentColor={accentColor} />;
      case "elegant":
        return <ElegantTemplate data={data} accentColor={accentColor} />;
      case "sidebar-pro":
        return <SidebarProTemplate data={data} accentColor={accentColor} />;
      case "compact-pro":
        return <CompactProTemplate data={data} accentColor={accentColor} />;
      case "golden-arc":
        return <GoldenArcTemplate data={data} accentColor={accentColor} />;
      case "aqua-orbit":
        return <AquaOrbitTemplate data={data} accentColor={accentColor} />;
      case "soft-taupe":
        return <SoftTaupeTemplate data={data} accentColor={accentColor} />;
      case "teal-stripe":
        return <TealStripeTemplate data={data} accentColor={accentColor} />;
      case "navy-beam":
        return <NavyBeamTemplate data={data} accentColor={accentColor} />;
      case "futuristic-neon":
        return <FuturisticNeonTemplate data={data} accentColor={accentColor} />;
      default:
        return <ClassicTemplate data={data} accentColor={accentColor} />;
    }
  };

  const updateOverrides = (next: IResumeTextOverrides) => {
    onTextOverridesChange?.(next);
  };

  const currentElementOverride = selectedElementId
    ? textOverrides.elements[selectedElementId]
    : undefined;
  const currentSectionOverride = textOverrides.sections[selectedSectionId];

  const currentFontOffset = useMemo(() => {
    if (scopeMode === "section") return currentSectionOverride?.fontSizeOffset ?? 0;
    return currentElementOverride?.fontSizeOffset ?? 0;
  }, [scopeMode, currentElementOverride?.fontSizeOffset, currentSectionOverride?.fontSizeOffset]);

  const currentColor = scopeMode === "section"
    ? currentSectionOverride?.color ?? "#111827"
    : currentElementOverride?.color ?? "#111827";

  const currentTransform = scopeMode === "section"
    ? currentSectionOverride?.textTransform ?? "none"
    : currentElementOverride?.textTransform ?? "none";

  useEffect(() => {
    const root = wrapperRef.current?.querySelector<HTMLElement>(`#${previewId}`);
    if (!root) return;

    const sectionElements = Array.from(
      root.querySelectorAll<HTMLElement>("section, aside, main, header, footer, article")
    );

    sectionElements.forEach((section) => {
      section.dataset.sectionId = getNodePath(root, section) || "root";
    });

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent || !node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const editableElements = new Set<HTMLElement>();

    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      const parent = textNode.parentElement;
      if (!parent) continue;
      if (!EDITABLE_TAGS.has(parent.tagName)) continue;
      if (["BUTTON", "INPUT", "TEXTAREA", "STYLE", "SCRIPT", "SVG"].includes(parent.tagName)) continue;
      editableElements.add(parent);
    }

    editableElements.forEach((element) => {
      const editableId = getNodePath(root, element);
      if (!editableId) return;

      const nearestSection = element.closest<HTMLElement>("[data-section-id]");
      element.dataset.editableId = editableId;
      element.dataset.sectionId = nearestSection?.dataset.sectionId ?? "root";
      if (!element.dataset.baseFontSize) {
        element.dataset.baseFontSize = window.getComputedStyle(element).fontSize;
      }

      const sectionOverride = textOverrides.sections[element.dataset.sectionId];
      const elementOverride = textOverrides.elements[editableId];

      const baseFontSize = Number.parseFloat(element.dataset.baseFontSize ?? "16");
      const fontOffset =
        (sectionOverride?.fontSizeOffset ?? 0) + (elementOverride?.fontSizeOffset ?? 0);
      element.style.fontSize = `${Math.max(10, baseFontSize + fontOffset)}px`;
      element.style.color = elementOverride?.color ?? sectionOverride?.color ?? "";
      element.style.textTransform = getEffectiveTextTransform(
        elementOverride,
        sectionOverride
      );
      element.style.wordBreak = "keep-all";
      element.style.overflowWrap = "normal";
      element.style.hyphens = "none";
      element.style.whiteSpace = "pre-wrap";
      element.style.cursor = editable ? "text" : "";

      if (editable && selectedElementId === editableId) {
        element.style.outline = "2px dashed #3b82f6";
        element.style.outlineOffset = "3px";
      } else {
        element.style.outline = "";
        element.style.outlineOffset = "";
      }
    });
  }, [data, editable, previewId, selectedElementId, textOverrides]);

  const handlePreviewClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!editable) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-text-editor-toolbar='true']")) return;
    const editableElement = target.closest<HTMLElement>("[data-editable-id]");
    if (!editableElement) {
      setSelectedElementId(null);
      setSelectedSectionId("root");
      return;
    }

    const editableId = editableElement.dataset.editableId;
    if (!editableId) return;

    setSelectedElementId(editableId);
    setSelectedSectionId(editableElement.dataset.sectionId ?? "root");
  };

  const patchElementOverride = (patch: Partial<ITextElementOverride>) => {
    if (!selectedElementId) return;
    const current = textOverrides.elements[selectedElementId] ?? {};
    updateOverrides({
      ...getInitialOverrides(textOverrides),
      elements: {
        ...textOverrides.elements,
        [selectedElementId]: {
          ...current,
          ...patch,
        },
      },
      sections: {
        ...textOverrides.sections,
      },
    });
  };

  const patchSectionOverride = (patch: Partial<ITextSectionOverride>) => {
    const current = textOverrides.sections[selectedSectionId] ?? {};
    updateOverrides({
      ...getInitialOverrides(textOverrides),
      elements: {
        ...textOverrides.elements,
      },
      sections: {
        ...textOverrides.sections,
        [selectedSectionId]: {
          ...current,
          ...patch,
        },
      },
    });
  };

  const handleFontSizeDelta = (delta: number) => {
    if (scopeMode === "section") {
      patchSectionOverride({
        fontSizeOffset: (textOverrides.sections[selectedSectionId]?.fontSizeOffset ?? 0) + delta,
      });
      return;
    }
    patchElementOverride({
      fontSizeOffset: (currentElementOverride?.fontSizeOffset ?? 0) + delta,
    });
  };

  const handleTransformChange = (value: "none" | "uppercase" | "capitalize") => {
    if (scopeMode === "section") {
      patchSectionOverride({ textTransform: value });
      return;
    }
    patchElementOverride({ textTransform: value });
  };

  const handleColorChange = (value: string) => {
    if (scopeMode === "section") {
      patchSectionOverride({ color: value });
      return;
    }
    patchElementOverride({ color: value });
  };

  const resetCurrentScope = () => {
    if (scopeMode === "section") {
      const nextSections = { ...textOverrides.sections };
      delete nextSections[selectedSectionId];
      updateOverrides({
        elements: { ...textOverrides.elements },
        sections: nextSections,
      });
      return;
    }

    if (!selectedElementId) return;
    const nextElements = { ...textOverrides.elements };
    delete nextElements[selectedElementId];
    updateOverrides({
      elements: nextElements,
      sections: { ...textOverrides.sections },
    });
  };

  const closeToolbar = () => {
    setSelectedElementId(null);
    setSelectedSectionId("root");
  };

  useEffect(() => {
    if (!editable || !selectedElementId) return;

    const handleGlobalPointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-text-editor-toolbar='true']")) return;

      const previewRoot = wrapperRef.current?.querySelector<HTMLElement>(`#${previewId}`);
      if (!previewRoot) return;

      if (!previewRoot.contains(target)) {
        closeToolbar();
        return;
      }

      const clickedEditable = target.closest<HTMLElement>("[data-editable-id]");
      if (clickedEditable) return;

      closeToolbar();
    };

    document.addEventListener("pointerdown", handleGlobalPointerDown);
    return () => document.removeEventListener("pointerdown", handleGlobalPointerDown);
  }, [editable, previewId, selectedElementId]);

  return (
    <div className="w-full bg-gray-100">
      <div
        ref={wrapperRef}
        onClick={handlePreviewClick}
        className={editable ? "relative" : ""}
      >
        <div
          id={previewId}
          className={
            "border border-gray-200 print:shadow-none print:border-none bg-white" +
            classes
          }
        >
          {renderTemplate()}
        </div>

        {editable && selectedElementId && (
          <div
            data-text-editor-toolbar="true"
            onClick={(event) => event.stopPropagation()}
            className="fixed bottom-6 right-6 z-[70] w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-end">
              <button
                onClick={closeToolbar}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                aria-label="Hide text editor"
                title="Hide"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600">
                <button
                  onClick={() => setScopeMode("element")}
                  className={`rounded-lg px-3 py-1.5 ${
                    scopeMode === "element" ? "bg-white text-slate-900 shadow-sm" : ""
                  }`}
                >
                  Current text
                </button>
                <button
                  onClick={() => setScopeMode("section")}
                  className={`rounded-lg px-3 py-1.5 ${
                    scopeMode === "section" ? "bg-white text-slate-900 shadow-sm" : ""
                  }`}
                >
                  Whole section
                </button>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <Type className="size-4" />
                <button onClick={() => handleFontSizeDelta(-1)} className="rounded-md p-1 hover:bg-slate-100">
                  <Minus className="size-4" />
                </button>
                <span>{currentFontOffset >= 0 ? `+${currentFontOffset}` : currentFontOffset}px</span>
                <button onClick={() => handleFontSizeDelta(1)} className="rounded-md p-1 hover:bg-slate-100">
                  <Plus className="size-4" />
                </button>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <Type className="size-4" />
                <select
                  value={currentTransform}
                  onChange={(e) =>
                    handleTransformChange(
                      e.target.value as "none" | "uppercase" | "capitalize"
                    )
                  }
                  className="bg-transparent outline-none"
                >
                  <option value="none">Normal</option>
                  <option value="uppercase">UPPERCASE</option>
                  <option value="capitalize">Capitalize</option>
                </select>
              </div>

              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <Palette className="size-4" />
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border-none bg-transparent p-0"
                />
              </label>

              <button
                onClick={resetCurrentScope}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="size-4" />
                Reset
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Long words now stay whole and do not split across lines letter by letter.
            </p>
          </div>
        )}
      </div>

      <style>
        {`
          @page {
            size: letter;
            margin: 0;
          }
          @media print {
            html,
            body {
              width: 8.5in;
              height: 11in;
              overflow: hidden;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: white;
            }
            body * {
              visibility: hidden;
            }
            #${previewId},
            #${previewId} * {
              visibility: visible;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #${previewId} {
              position: absolute;
              left: 0;
              top: 0;
              width: 8.5in;
              min-height: 11in;
              height: 11in;
              margin: 0;
              padding: 0;
              box-shadow: none !important;
              border: none !important;
              overflow: hidden !important;
              background: white !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ResumePreview;
