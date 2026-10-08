import assert from "node:assert/strict";
import { File as NodeFile } from "node:buffer";
import test from "node:test";
import {
  deleteUploadedFile,
  detectImageType,
  extractCloudinaryPublicId,
  isLegacyUploadPath,
  saveUploadedFile,
} from "@/lib/upload/storage";
import type {
  CloudinaryUploadInput,
  CloudinaryUploadOutput,
  ImageStorageClient,
} from "@/lib/upload/cloudinary";

const CLOUD_NAME = "masamer-test";
process.env.CLOUDINARY_CLOUD_NAME = CLOUD_NAME;

const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const icoBytes = Buffer.from([0x00, 0x00, 0x01, 0x00, 0x01, 0x00]);

function pngFile(name = "image.png") {
  return new NodeFile([pngBytes], name, { type: "image/png" }) as unknown as File;
}

function testFile(bytes: Buffer, name: string, type: string) {
  return new NodeFile([bytes], name, { type }) as unknown as File;
}

class MockStorageClient implements ImageStorageClient {
  uploads: CloudinaryUploadInput[] = [];
  destroyed: string[] = [];
  uploadError: Error | null = null;
  destroyError: Error | null = null;
  outputFactory: ((input: CloudinaryUploadInput) => CloudinaryUploadOutput) | null = null;

  async upload(_buffer: Buffer, input: CloudinaryUploadInput): Promise<CloudinaryUploadOutput> {
    this.uploads.push(input);
    if (this.uploadError) throw this.uploadError;
    if (this.outputFactory) return this.outputFactory(input);
    const publicId = `${input.folder}/${input.publicId}`;
    return {
      secureUrl: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v123/${publicId}.png`,
      publicId,
      resourceType: "image",
      format: "png",
      bytes: pngBytes.length,
    };
  }

  async destroy(publicId: string): Promise<string> {
    this.destroyed.push(publicId);
    if (this.destroyError) throw this.destroyError;
    return "ok";
  }
}

test("detects supported image signatures and rejects arbitrary bytes", () => {
  assert.equal(detectImageType(pngBytes)?.mime, "image/png");
  assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0x00]))?.mime, "image/jpeg");
  assert.equal(detectImageType(Buffer.from("not-an-image")), null);
});

test("uploads a valid image under the restricted masamer folder", async () => {
  const client = new MockStorageClient();
  const result = await saveUploadedFile(pngFile(), { subDirectory: "services", prefix: "service-cover" }, client);

  assert.equal(result.success, true);
  assert.match(result.filePath ?? "", /^https:\/\/res\.cloudinary\.com\/masamer-test\/image\/upload\/v123\/masamer\/services\/service-cover-[a-f0-9]{12}\.png$/);
  assert.equal(client.uploads[0]?.folder, "masamer/services");
  assert.equal(client.uploads[0]?.allowedFormats[0], "png");
});

test("keeps ICO favicon support with signature validation", async () => {
  const client = new MockStorageClient();
  client.outputFactory = (input) => {
    const publicId = `${input.folder}/${input.publicId}`;
    return {
      secureUrl: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v123/${publicId}.ico`,
      publicId,
      resourceType: "image",
      format: "ico",
      bytes: icoBytes.length,
    };
  };

  const result = await saveUploadedFile(
    testFile(icoBytes, "favicon.ico", "image/x-icon"),
    {
      subDirectory: "site",
      prefix: "favicon",
      allowedMimeTypes: ["image/x-icon", "image/vnd.microsoft.icon"],
      allowedExtensions: [".ico"],
    },
    client
  );

  assert.equal(result.success, true);
  assert.equal(client.uploads[0]?.allowedFormats[0], "ico");
  assert.match(result.filePath ?? "", /\.ico$/);
});

test("rejects MIME, extension, magic-byte, and size mismatches before upload", async () => {
  const client = new MockStorageClient();
  const wrongMime = testFile(pngBytes, "image.png", "image/jpeg");
  const wrongExtension = testFile(pngBytes, "image.jpg", "image/png");

  assert.equal((await saveUploadedFile(wrongMime, {}, client)).success, false);
  assert.equal((await saveUploadedFile(wrongExtension, {}, client)).success, false);
  assert.equal((await saveUploadedFile(testFile(Buffer.from("bad"), "image.png", "image/png"), {}, client)).success, false);
  assert.equal((await saveUploadedFile(pngFile(), { maxSizeBytes: 4 }, client)).success, false);
  assert.equal(client.uploads.length, 0);
});

test("returns a safe error when the Cloudinary upload fails", async (context) => {
  const client = new MockStorageClient();
  client.uploadError = new Error("simulated upload failure");
  context.mock.method(console, "error", () => undefined);
  const result = await saveUploadedFile(pngFile(), {}, client);
  assert.equal(result.success, false);
  assert.equal(result.filePath, undefined);
});

test("deletes a newly uploaded asset when its URL exceeds the DB limit", async () => {
  const client = new MockStorageClient();
  const previousCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const longCloudName = `masamer-${"a".repeat(220)}`;
  process.env.CLOUDINARY_CLOUD_NAME = longCloudName;
  client.outputFactory = (input) => {
    const publicId = `${input.folder}/${input.publicId}`;
    return {
      secureUrl: `https://res.cloudinary.com/${longCloudName}/image/upload/v123/${publicId}.png`,
      publicId,
      resourceType: "image",
      format: "png",
      bytes: pngBytes.length,
    };
  };

  const result = await saveUploadedFile(pngFile(), {}, client);
  process.env.CLOUDINARY_CLOUD_NAME = previousCloudName;
  assert.equal(result.success, false);
  assert.equal(client.destroyed.length, 1);
});

test("extracts only original Cloudinary URLs from the configured account and masamer folders", () => {
  const valid = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v123/masamer/site/logo-abc123.png`;
  assert.equal(extractCloudinaryPublicId(valid, "site", CLOUD_NAME), "masamer/site/logo-abc123");
  assert.equal(extractCloudinaryPublicId(valid, "services", CLOUD_NAME), null);
  assert.equal(extractCloudinaryPublicId(valid.replace(CLOUD_NAME, "another-cloud"), "site", CLOUD_NAME), null);
  assert.equal(extractCloudinaryPublicId(`https://example.com/image/upload/v123/masamer/site/logo-abc123.png`, "site", CLOUD_NAME), null);
  assert.equal(extractCloudinaryPublicId(`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill/v123/masamer/site/logo-abc123.png`, "site", CLOUD_NAME), null);
});

test("rejects external deletion and deletes only an approved Cloudinary asset", async () => {
  const client = new MockStorageClient();
  assert.equal(await deleteUploadedFile("https://example.com/image.png", "site", client), false);
  assert.equal(client.destroyed.length, 0);

  const valid = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v123/masamer/site/logo-abc123.png`;
  assert.equal(await deleteUploadedFile(valid, "site", client), true);
  assert.deepEqual(client.destroyed, ["masamer/site/logo-abc123"]);
});

test("reports Cloudinary deletion failure without throwing", async (context) => {
  const client = new MockStorageClient();
  client.destroyError = new Error("simulated deletion failure");
  context.mock.method(console, "error", () => undefined);
  const valid = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v123/masamer/site/logo-abc123.png`;

  assert.equal(await deleteUploadedFile(valid, "site", client), false);
  assert.deepEqual(client.destroyed, ["masamer/site/logo-abc123"]);
});

test("continues to recognize only safe legacy upload paths", () => {
  assert.equal(isLegacyUploadPath("/uploads/services/image.jpg", "services"), true);
  assert.equal(isLegacyUploadPath("/uploads/services/../site/image.jpg", "services"), false);
  assert.equal(isLegacyUploadPath("/uploads/portfolio/image.jpg", "services"), false);
});
