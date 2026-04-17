"use client";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

let workerConfigured = false;

const ensureWorker = () => {
  if (workerConfigured) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  workerConfigured = true;
};

export const extractPdfText = async (file: File): Promise<string> => {
  ensureWorker();

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean)
      .join(" ");

    if (pageText.trim()) {
      pages.push(pageText.trim());
    }
  }

  return pages.join("\n\n").trim();
};
