import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

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
  previousFilePath?: string | null;
}

const DEFAULT_ALLOWED_MIMES = ["image/png", "image/webp", "image/jpeg", "image/x-icon", "image/vnd.microsoft.icon"];
const DEFAULT_ALLOWED_EXTS = [".png", ".webp", ".jpg", ".jpeg", ".ico"];
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export const PORTFOLIO_ALLOWED_MIMES = ["image/png", "image/webp", "image/jpeg"];
export const PORTFOLIO_ALLOWED_EXTS = [".png", ".webp", ".jpg", ".jpeg"];
export const PORTFOLIO_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export const SERVICE_ALLOWED_MIMES = ["image/png", "image/webp", "image/jpeg"];
export const SERVICE_ALLOWED_EXTS = [".png", ".webp", ".jpg", ".jpeg"];
export const SERVICE_MAX_SIZE = 5 * 1024 * 1024;

/**
 * Safely delete an uploaded file from disk if it exists inside public/uploads/{subDir}
 */
export async function deleteUploadedFile(
  filePath: string | null | undefined,
  subDirectory: string = "portfolio"
): Promise<boolean> {
  if (!filePath || !filePath.startsWith(`/uploads/${subDirectory}/`)) {
    return false;
  }

  try {
    const filename = path.basename(filePath);
    // Path traversal check: ensure filename doesn't contain path separators
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return false;
    }
    const fullPath = path.join(process.cwd(), "public", "uploads", subDirectory, filename);
    await fs.unlink(fullPath);
    return true;
  } catch {
    // Silently return false if file does not exist or deletion fails
    return false;
  }
}

/**
 * Clean and secure upload handler for local file storage in public/uploads/
 * Can easily be swapped with S3 / Cloudinary storage in production.
 */
export async function saveUploadedFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { success: false, error: "الملف المرفوع فارغ أو غير صالح" };
  }

  const allowedMimes = options.allowedMimeTypes || DEFAULT_ALLOWED_MIMES;
  const allowedExts = options.allowedExtensions || DEFAULT_ALLOWED_EXTS;
  const maxSize = options.maxSizeBytes || DEFAULT_MAX_SIZE;
  const prefix = options.prefix || "file";
  const subDir = options.subDirectory || "site";

  // 1. Size Validation
  if (file.size > maxSize) {
    const sizeInMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      success: false,
      error: `حجم الملف يتجاوز الحد الأقصى المسموح به (${sizeInMB} ميجابايت)`,
    };
  }

  // 2. MIME Type Validation
  if (!allowedMimes.includes(file.type)) {
    return {
      success: false,
      error: "نوع الملف غير مدعوم. يرجى رفع صورة بصيغة (PNG, WEBP, ICO)",
    };
  }

  // 3. Extension Validation
  const rawExt = path.extname(file.name).toLowerCase();
  const ext = rawExt || (file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".ico");
  if (!allowedExts.includes(ext)) {
    return {
      success: false,
      error: `امتداد الملف (${ext}) غير مسموح به`,
    };
  }

  try {
    // 4. Prepare target directory in public/uploads/${subDir}
    const uploadsBaseDir = path.join(process.cwd(), "public", "uploads", subDir);
    await fs.mkdir(uploadsBaseDir, { recursive: true });

    // 5. Generate secure unique filename
    const randomSuffix = crypto.randomBytes(6).toString("hex");
    const safeFilename = `${prefix}-${Date.now()}-${randomSuffix}${ext}`;
    const destinationPath = path.join(uploadsBaseDir, safeFilename);

    // 6. Write file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${subDir}/${safeFilename}`;

    // 7. Delete previous file if provided and located within our uploads directory
    if (options.previousFilePath && options.previousFilePath.startsWith(`/uploads/${subDir}/`)) {
      try {
        const oldFilename = path.basename(options.previousFilePath);
        const oldFullPath = path.join(uploadsBaseDir, oldFilename);
        await fs.unlink(oldFullPath);
      } catch {
        // Silently ignore if previous file doesn't exist
      }
    }

    return {
      success: true,
      filePath: publicUrl,
    };
  } catch (error) {
    console.error("File upload error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء حفظ الملف على الخادم",
    };
  }
}
