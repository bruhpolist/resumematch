import { jsPDF } from "jspdf";
import { toCanvas } from "html-to-image";

const BREAK_SELECTOR =
  "section, article, header, footer, aside, main, h1, h2, h3, h4, h5, h6, p, li, ul, ol, blockquote, [data-section-id]";

const waitForImages = async (element: HTMLElement) => {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }

          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        })
    )
  );
};

const getBreakpoints = (
  element: HTMLElement,
  canvasHeight: number,
  pageHeightPx: number
) => {
  const rootRect = element.getBoundingClientRect();
  const domHeight = Math.max(element.scrollHeight, rootRect.height, 1);
  const scale = canvasHeight / domHeight;

  const candidates = Array.from(
    element.querySelectorAll<HTMLElement>(BREAK_SELECTOR)
  )
    .map((node) => {
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      const isVisible =
        rect.height > 8 &&
        rect.width > 8 &&
        style.display !== "inline" &&
        style.visibility !== "hidden";

      if (!isVisible) return null;

      const top = Math.max(0, rect.top - rootRect.top);
      const bottom = Math.max(0, rect.bottom - rootRect.top);

      return {
        topPx: Math.round(top * scale),
        bottomPx: Math.round(bottom * scale),
        heightPx: Math.round(rect.height * scale),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.bottomPx - b.bottomPx);

  const breakpoints: number[] = [];
  let cursor = 0;
  const toleranceAbove = Math.round(pageHeightPx * 0.18);
  const toleranceBelow = Math.round(pageHeightPx * 0.1);
  const minSliceHeight = Math.round(pageHeightPx * 0.62);

  while (cursor + pageHeightPx < canvasHeight) {
    const target = cursor + pageHeightPx;
    const lowerBound = cursor + minSliceHeight;

    const safeAbove = candidates
      .filter((candidate) => candidate.bottomPx <= target && candidate.bottomPx >= target - toleranceAbove)
      .pop();

    const safeBelow = candidates.find(
      (candidate) =>
        candidate.topPx >= target &&
        candidate.topPx <= target + toleranceBelow &&
        candidate.topPx >= lowerBound
    );

    let breakpoint =
      safeAbove?.bottomPx ??
      safeBelow?.topPx ??
      target;

    breakpoint = Math.max(lowerBound, breakpoint);

    if (breakpoints.length > 0 && breakpoint <= breakpoints[breakpoints.length - 1]) {
      breakpoint = target;
    }

    breakpoints.push(breakpoint);
    cursor = breakpoint;
  }

  return breakpoints;
};

export const downloadResumePdf = async (fileName: string) => {
  const element = document.getElementById("resume-preview") as HTMLElement | null;
  if (!element) {
    throw new Error("Resume preview not found");
  }

  await waitForImages(element);

  const pixelRatio = Math.max(2, Math.min(window.devicePixelRatio || 1, 3));
  const canvas = await toCanvas(element, {
    cacheBust: true,
    pixelRatio,
    backgroundColor: "#ffffff",
    skipFonts: false,
    imagePlaceholder:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="100%" height="100%" fill="#e5e7eb"/></svg>'
      ),
    style: {
      margin: "0",
      transform: "none",
    },
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter",
    compress: true,
  });

  const pdfWidth = 8.5;
  const pdfHeight = 11;
  const pageHeightPx = Math.floor(canvas.width * (pdfHeight / pdfWidth));
  const breakpoints = getBreakpoints(element, canvas.height, pageHeightPx);
  const slices = [0, ...breakpoints, canvas.height];

  for (let pageIndex = 0; pageIndex < slices.length - 1; pageIndex += 1) {
    if (pageIndex > 0) {
      pdf.addPage("letter", "portrait");
    }

    const startY = slices[pageIndex];
    const endY = slices[pageIndex + 1];
    const sliceHeight = Math.max(1, endY - startY);

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    const context = pageCanvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas context unavailable");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(
      canvas,
      0,
      startY,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight
    );

    const pageDataUrl = pageCanvas.toDataURL("image/png");
    const renderedHeight = (sliceHeight / canvas.width) * pdfWidth;
    pdf.addImage(
      pageDataUrl,
      "PNG",
      0,
      0,
      pdfWidth,
      renderedHeight,
      undefined,
      "FAST"
    );
  }

  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
};
