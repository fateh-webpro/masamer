import type { Metadata } from "next";
import { cleanSeoTitle, getSeoPageSetting } from "@/lib/services/seo-page-setting-dal";
import { getSiteSettings } from "@/lib/services/site-setting-dal";

const ORIGIN = "https://masamersa.com";

interface ManagedMetadataOptions {
  pageKey: string;
  canonicalPath: string;
  fallbackTitle: string;
  fallbackDescription: string;
  image?: string | null;
}

export async function getManagedPageMetadata({
  pageKey,
  canonicalPath,
  fallbackTitle,
  fallbackDescription,
  image,
}: ManagedMetadataOptions): Promise<Metadata> {
  const [managed, settings] = await Promise.all([getSeoPageSetting(pageKey), getSiteSettings()]);
  const title = cleanSeoTitle(managed?.seoTitle?.trim() || fallbackTitle);
  const description = managed?.seoDescription?.trim() || fallbackDescription;
  const canonical = `${ORIGIN}${canonicalPath === "/" ? "" : canonicalPath}`;
  const socialImage = image || settings.seoImagePath;
  const images = socialImage ? [{ url: socialImage }] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, images },
    twitter: { card: "summary_large_image", title, description, images: socialImage ? [socialImage] : undefined },
  };
}
