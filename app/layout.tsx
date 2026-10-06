import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/services/site-setting-dal";

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const title = settings.seoTitle || settings.siteName || siteConfig.title;
  const description = settings.seoDescription || settings.shortDescription || siteConfig.description;
  const favicon = settings.faviconPath || "/favicon.ico";
  const ogImage = settings.seoImagePath || "/og-image.jpg";

  return {
    metadataBase: new URL("https://masamer.sa"),
    title: {
      default: title,
      template: `%s | ${settings.siteName || siteConfig.name}`,
    },
    description,
    icons: {
      icon: favicon,
      apple: favicon,
    },
    authors: [{ name: settings.siteName || "مسامر" }],
    creator: settings.siteName || "مسامر",
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: "https://masamer.sa",
      title,
      description,
      siteName: settings.siteName || siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: settings.siteName || siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#1F294A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={arabicFont.variable}>
      <body className="min-h-screen bg-(--background) text-(--text-main) antialiased selection:bg-(--secondary) selection:text-white">
        {children}
      </body>
    </html>
  );
}
