import { v2 as cloudinary } from "cloudinary";

export interface CloudinaryUploadInput {
  folder: string;
  publicId: string;
  allowedFormats: string[];
}

export interface CloudinaryUploadOutput {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
}

export interface ImageStorageClient {
  upload(buffer: Buffer, input: CloudinaryUploadInput): Promise<CloudinaryUploadOutput>;
  destroy(publicId: string): Promise<string>;
}

function requireCloudinaryEnv(name: "CLOUDINARY_CLOUD_NAME" | "CLOUDINARY_API_KEY" | "CLOUDINARY_API_SECRET") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getCloudinaryCloudName(): string {
  return requireCloudinaryEnv("CLOUDINARY_CLOUD_NAME");
}

export function createCloudinaryClient(): ImageStorageClient {
  const cloudName = getCloudinaryCloudName();
  const apiKey = requireCloudinaryEnv("CLOUDINARY_API_KEY");
  const apiSecret = requireCloudinaryEnv("CLOUDINARY_API_SECRET");

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

  return {
    upload(buffer, input) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: input.folder,
            public_id: input.publicId,
            overwrite: false,
            unique_filename: false,
            allowed_formats: input.allowedFormats,
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error("Cloudinary returned no upload result"));
              return;
            }
            resolve({
              secureUrl: result.secure_url,
              publicId: result.public_id,
              resourceType: result.resource_type,
              format: result.format,
              bytes: result.bytes,
            });
          }
        );
        stream.end(buffer);
      });
    },
    async destroy(publicId) {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
      return result.result;
    },
  };
}
