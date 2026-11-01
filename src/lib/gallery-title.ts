/**
 * Gallery Title, Alt Text, and Image Optimization Utilities
 *
 * Enforces privacy, data hygiene, and clean presentation for public photo pages:
 * 1. Raw device filenames, screenshot titles, camera timestamps, or URLs are NEVER
 *    presented to devotees.
 * 2. If a title looks like a filename/URL, fallback cleanly to event title,
 *    and ultimately to "Photograph from Shri Vinayaka Temple".
 * 3. Cloudinary URLs are optimized with f_auto, q_auto, and appropriate bounding widths.
 */

export const FALLBACK_PHOTO_ALT = "Photograph from Shri Vinayaka Temple";

/**
 * Checks whether a given string resembles a raw camera filename, screenshot,
 * URL, path, or machine timestamp.
 */
export function isFilenameLike(str: string | null | undefined): boolean {
  if (!str) return true;
  const trimmed = str.trim();
  if (!trimmed) return true;

  // 1. Contains common image extensions (.jpg, .jpeg, .png, .webp, .avif, .gif, .bmp, .heic)
  if (/\.(jpe?g|png|webp|gif|avif|bmp|tiff|heic|svg)($|\s|[?#])/i.test(trimmed)) {
    return true;
  }

  // 2. Starts with common device/camera prefixes (IMG_, DSC, PXL, WhatsApp Image, Screenshot)
  if (/^(IMG[_ -]|DSC[_ -]|PXL[_ -]|WhatsApp(\s+Image)?|Screenshot)/i.test(trimmed)) {
    return true;
  }

  // 3. Contains path separator or URL scheme (/ or http)
  if (trimmed.includes("/") || /https?:/i.test(trimmed)) {
    return true;
  }

  // 4. Mostly digits / machine timestamps (e.g. "20261030_105203", "2026 10 30 at 20.24.47")
  // If digits comprise 50% or more of all non-whitespace characters
  const nonSpace = trimmed.replace(/\s+/g, "");
  const digits = (nonSpace.match(/\d/g) || []).length;
  if (nonSpace.length > 0 && digits / nonSpace.length >= 0.5) {
    return true;
  }

  return false;
}

export interface PhotoTitleSource {
  title?: string | null;
  caption?: string | null;
  eventTitle?: string | null;
}

/**
 * Returns a human-friendly display title for the lightbox or photo view.
 * If the photo's title is filename-like, falls back to the event title.
 * Returns null if no human title is available.
 */
export function getPublicPhotoTitle(photo: PhotoTitleSource): string | null {
  if (photo.title && !isFilenameLike(photo.title)) {
    return photo.title.trim();
  }
  if (photo.eventTitle && !isFilenameLike(photo.eventTitle)) {
    return photo.eventTitle.trim();
  }
  return null;
}

/**
 * Returns clean accessible alt text / aria-label for an image.
 * Priority: Human Caption -> Human Title -> Human Event Title -> Standard Fallback.
 */
export function getPublicPhotoAlt(
  photo: PhotoTitleSource,
  fallback = FALLBACK_PHOTO_ALT
): string {
  if (photo.caption && !isFilenameLike(photo.caption)) {
    return photo.caption.trim();
  }
  const title = getPublicPhotoTitle(photo);
  if (title) {
    return title;
  }
  return fallback;
}

/**
 * Returns a clean caption for display, or null if empty or filename-like.
 */
export function getPublicPhotoCaption(photo: { caption?: string | null }): string | null {
  if (photo.caption && !isFilenameLike(photo.caption)) {
    return photo.caption.trim();
  }
  return null;
}

/**
 * Injects Cloudinary on-the-fly transformations (f_auto, q_auto, w_<width>, c_limit)
 * into a Cloudinary delivery URL. Returns non-Cloudinary or local paths unchanged.
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options?: { width?: number; height?: number; crop?: string; quality?: string }
): string {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
    return url;
  }

  const width = options?.width;
  const height = options?.height;
  const crop = options?.crop || "limit";
  const quality = options?.quality || "auto";

  const transforms: string[] = ["f_auto", `q_${quality}`];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop && (width || height)) transforms.push(`c_${crop}`);

  const transformStr = transforms.join(",");

  const uploadMarker = "/image/upload/";
  const uploadIndex = url.indexOf(uploadMarker);
  if (uploadIndex === -1) return url;

  const prefix = url.slice(0, uploadIndex + uploadMarker.length);
  let remainder = url.slice(uploadIndex + uploadMarker.length);

  // Strip existing transformation segment if present
  const firstSlashIndex = remainder.indexOf("/");
  if (firstSlashIndex !== -1) {
    const firstSegment = remainder.slice(0, firstSlashIndex);
    if (
      !/^v\d+$/.test(firstSegment) &&
      (firstSegment.includes(",") || firstSegment.includes("_") || firstSegment.includes("="))
    ) {
      remainder = remainder.slice(firstSlashIndex + 1);
    }
  }

  return `${prefix}${transformStr}/${remainder}`;
}
