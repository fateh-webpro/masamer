import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  createCloudinaryClient,
  getCloudinaryCloudName,
  type ImageStorageClient,
} from "@/lib/upload/cloudinary";

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export interface UploadOptions {
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  maxSizeBytes?: number;
  prefix?: string;
  subDirectory?: string;
  /** @deprecated Delete old assets in the action only after the DB commit succeeds. */
  previousFilePath?: string | null;
}

interface DetectedImage {
  mime: string;
  extension: ".png" | ".webp" | ".jpg" | ".ico";
  cloudinaryFormat: "png" | "webp" | "jpg" | "ico";
}

const DEFAULT_ALLOWED_MIMES = ["image/png", "image/webp", "image/jpeg", "image/x-icon", "image/vnd.microsoft.icon"];
const DEFAULT_ALLOWED_EXTS = [".png", ".webp", ".jpg", ".jpeg", ".ico"];
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;
const MAX_STORED_URL_LENGTH = 255;
const CLOUDINARY_ROOT_FOLDER = "masamer";
const ALLOWED_SUBDIRECTORIES = new Set(["site", "site-backgrounds", "services", "portfolio"]);

export const PORTFOLIO_ALLOWED_MIMES = ["image/png", "image/webp", "image/jpeg"];
export const PORTFOLIO_ALLOWED_EXTS = [".png", ".webp", ".jpg", ".jpeg"];
export const PORTFOLIO_MAX_SIZE = 5 * 1024 * 1024;

export const SERVICE_ALLOWED_MIMES = ["image/png", "image/webp", "image/jpeg"];
export const SERVICE_ALLOWED_EXTS = [".png", ".webp", ".jpg", ".jpeg"];
export const SERVICE_MAX_SIZE = 5 * 1024 * 1024;

export function detectImageType(buffer: Buffer): DetectedImage | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: "image/png", extension: ".png", cloudinaryFormat: "png" };
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", extension: ".jpg", cloudinaryFormat: "jpg" };
  }
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return { mime: "image/webp", extension: ".webp", cloudinaryFormat: "webp" };
  }
  if (buffer.length >= 4 && buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) {
    return { mime: "image/x-icon", extension: ".ico", cloudinaryFormat: "ico" };
  }
  return null;
}

function isMimeCompatible(detected: DetectedImage, declaredMime: string): boolean {
  if (detected.extension === ".ico") {
    return declaredMime === "image/x-icon" || declaredMime === "image/vnd.microsoft.icon";
  }
  return detected.mime === declaredMime;
}

function isExtensionCompatible(detected: DetectedImage, extension: string): boolean {
  return detected.extension === ".jpg"
    ? extension === ".jpg" || extension === ".jpeg"
    : detected.extension === extension;
}

function safePrefix(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return normalized.slice(0, 32) || "image";
}

export function isLegacyUploadPath(filePath: string, subDirectory: string): boolean {
  if (!ALLOWED_SUBDIRECTORIES.has(subDirectory) || !filePath.startsWith(`/uploads/${subDirectory}/`)) return false;
  const filename = filePath.slice(`/uploads/${subDirectory}/`.length);
  return filename.length > 0 && filename === path.basename(filename) && !filename.includes("..");
}

export function extractCloudinaryPublicId(filePath: string, subDirectory: string, cloudName: string): string | null {
  if (!ALLOWED_SUBDIRECTORIES.has(subDirectory)) return null;
  try {
    const url = new URL(filePath);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || url.search || url.hash) return null;
    const prefix = `/${encodeURIComponent(cloudName)}/image/upload/`;
    if (!url.pathname.startsWith(prefix)) return null;
    const remainder = url.pathname.slice(prefix.length);
    const match = remainder.match(/^v\d+\/(masamer\/(site|site-backgrounds|services|portfolio)\/[a-z0-9-]+)\.(png|jpe?g|webp|ico)$/i);
    if (!match || match[2] !== subDirectory) return null;
    return match[1];
  } catch {
    return null;
  }
}

async function safelyDestroyNewAsset(client: ImageStorageClient, publicId: string): Promise<void> {
  try {
    await client.destroy(publicId);
  } catch {
    console.error("Cloudinary cleanup failed after upload validation");
  }
}

export async function deleteUploadedFile(
  filePath: string | null | undefined,
  subDirectory: string = "portfolio",
  storageClient?: ImageStorageClient
): Promise<boolean> {
  if (!filePath || !ALLOWED_SUBDIRECTORIES.has(subDirectory)) return false;

  if (isLegacyUploadPath(filePath, subDirectory)) {
    try {
      const filename = path.basename(filePath);
      const fullPath = path.join(process.cwd(), "public", "uploads", subDirectory, filename);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  let cloudName: string;
  try {
    cloudName = getCloudinaryCloudName();
  } catch {
    return false;
  }

  const publicId = extractCloudinaryPublicId(filePath, subDirectory, cloudName);
  if (!publicId) return false;

  try {
    const result = await (storageClient ?? createCloudinaryClient()).destroy(publicId);
    if (result === "ok" || result === "not found") return true;
    console.error("Cloudinary asset deletion was not completed", { result, subDirectory });
    return false;
  } catch {
    console.error("Cloudinary asset deletion failed", {
      subDirectory,
    });
    return false;
  }
}

export async function saveUploadedFile(
  file: File,
  options: UploadOptions = {},
  storageClient?: ImageStorageClient
): Promise<UploadResult> {
  if (!file || file.size === 0) return { success: false, error: "الملف المرفوع فارغ أو غير صالح" };

  const allowedMimes = options.allowedMimeTypes || DEFAULT_ALLOWED_MIMES;
  const allowedExts = options.allowedExtensions || DEFAULT_ALLOWED_EXTS;
  const maxSize = options.maxSizeBytes || DEFAULT_MAX_SIZE;
  const prefix = safePrefix(options.prefix || "image");
  const subDirectory = options.subDirectory || "site";

  if (!ALLOWED_SUBDIRECTORIES.has(subDirectory)) return { success: false, error: "مسار تخزين الصورة غير مسموح به" };
  if (file.size > maxSize) {
    const sizeInMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { success: false, error: `حجم الملف يتجاوز الحد الأقصى المسموح به (${sizeInMB} ميجابايت)` };
  }

  const declaredExtension = path.extname(file.name).toLowerCase();
  if (!allowedMimes.includes(file.type)) return { success: false, error: "نوع الملف غير مدعوم. يرجى رفع صورة بالصيغة المسموحة" };
  if (!allowedExts.includes(declaredExtension)) {
    return { success: false, error: `امتداد الملف (${declaredExtension || "غير موجود"}) غير مسموح به` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buffer);
  if (!detected || !isMimeCompatible(detected, file.type) || !isExtensionCompatible(detected, declaredExtension)) {
    return { success: false, error: "محتوى الملف لا يطابق نوع الصورة أو امتدادها" };
  }

  const folder = `${CLOUDINARY_ROOT_FOLDER}/${subDirectory}`;
  const publicId = `${prefix}-${crypto.randomBytes(6).toString("hex")}`;

  try {
    const client = storageClient ?? createCloudinaryClient();
    const cloudName = getCloudinaryCloudName();
    const result = await client.upload(buffer, { folder, publicId, allowedFormats: [detected.cloudinaryFormat] });
    const expectedPublicId = `${folder}/${publicId}`;
    const normalizedFormat = result.format.toLowerCase() === "jpeg" ? "jpg" : result.format.toLowerCase();
    if (
      result.resourceType !== "image" ||
      result.publicId !== expectedPublicId ||
      normalizedFormat !== detected.cloudinaryFormat ||
      result.bytes <= 0 ||
      result.bytes > maxSize ||
      extractCloudinaryPublicId(result.secureUrl, subDirectory, cloudName) !== expectedPublicId
    ) {
      await safelyDestroyNewAsset(client, result.publicId || expectedPublicId);
      return { success: false, error: "استجابة تخزين الصورة غير صالحة" };
    }
    if (result.secureUrl.length > MAX_STORED_URL_LENGTH) {
      await safelyDestroyNewAsset(client, result.publicId);
      return { success: false, error: "رابط الصورة الناتج أطول من الحد المدعوم في قاعدة البيانات" };
    }
    return { success: true, filePath: result.secureUrl };
  } catch {
    console.error("Cloudinary image upload failed");
    return { success: false, error: "حدث خطأ أثناء رفع الصورة إلى التخزين الدائم" };
  }
}
