const fileUrlCache = new WeakMap<File, string>();

export const resolveImageSrc = (image: unknown): string | null => {
  if (!image) return null;
  if (typeof image === "string") return image;

  if (image instanceof File) {
    const cached = fileUrlCache.get(image);
    if (cached) return cached;

    const url = URL.createObjectURL(image);
    fileUrlCache.set(image, url);
    return url;
  }

  return null;
};
