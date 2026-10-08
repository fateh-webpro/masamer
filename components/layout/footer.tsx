import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerLinks } from "@/config/navigation";
import { formatWhatsAppUrl, isRuntimeUploadPath } from "@/lib/utils";
import type { SiteSettingsData } from "@/lib/services/site-setting-dal";
import { SocialIcon, type SocialPlatform } from "@/components/shared/social-icon";
import { RequestModalTrigger } from "@/components/request/request-modal-provider";

interface FooterProps {
  settings?: SiteSettingsData;
}

export function Footer({ settings }: FooterProps) {
  const siteName = settings?.siteName || siteConfig.name;
  const footerDesc = settings?.footerDescription || siteConfig.description;
  const siteAddress = settings?.address || siteConfig.contact.location;
  const sitePhone = settings?.phone || siteConfig.contact.phone;
  const siteEmail = settings?.email || siteConfig.contact.email;
  const copyright = settings?.copyrightText || "مسامر لخدمات الضيافة. جميع الحقوق محفوظة.";
  const logoPath = settings?.logoDarkPath || settings?.logoPath;

  const whatsappUrl = formatWhatsAppUrl(
    settings?.whatsapp || settings?.phone || "0539691477",
    "مرحباً مسامر، أود الاستفسار وطلب خدمة ضيافة."
  );

  const socialLinks: { title: string; href?: string | null; platform: SocialPlatform }[] = [
    { title: "فيسبوك", href: settings?.facebookUrl, platform: "facebook" },
    { title: "تويتر", href: settings?.xUrl, platform: "twitter" },
    { title: "إنستغرام", href: settings?.instagramUrl, platform: "instagram" },
    { title: "سناب شات", href: settings?.snapchatUrl, platform: "snapchat" },
  ];

  return (
    <footer className="bg-(--primary-dark) text-white border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-12 pb-8 sm:pt-14 sm:pb-10 md:pt-16 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                {logoPath ? (
                  <div className="relative h-10 w-auto flex items-center">
                    <Image
                      src={logoPath}
                      alt={siteName}
                      width={140}
                      height={40}
                      unoptimized={isRuntimeUploadPath(logoPath)}
                      className="h-10 w-auto object-contain brightness-110"
                    />
                  </div>
                ) : (
                  <span className="text-2xl font-bold tracking-tight text-white">مسامر</span>
                )}
              </Link>

              <p className="text-sm text-white/70 leading-relaxed max-w-sm">
                {footerDesc}
              </p>

              {/* Social Links */}
              <div className="mt-6 flex flex-wrap items-center gap-3" aria-label="روابط الشبكات الاجتماعية">
                {socialLinks.map((social) => social.href ? (
                  <a
                    key={social.title}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-[color,background-color,border-color] duration-250 hover:border-[#C2704B]/50 hover:bg-white/10 hover:text-[#C2704B] active:text-[#C2704B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2704B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151C34] focus-visible:text-[#C2704B]"
                    aria-label={social.title}
                  >
                    <SocialIcon platform={social.platform} className="h-5 w-5 transition-[color,transform] duration-250 group-hover:scale-110 group-hover:text-[#C2704B] group-active:scale-[0.97] group-active:text-[#C2704B] group-focus-visible:scale-110 group-focus-visible:text-[#C2704B] motion-reduce:transform-none motion-reduce:transition-none" />
                  </a>
                ) : (
                  <span
                    key={social.title}
                    className="group flex h-11 w-11 cursor-default items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/40 transition-[color,background-color,border-color] duration-250 hover:border-[#C2704B]/40 hover:bg-white/10 hover:text-[#C2704B]"
                    aria-label={`${social.title} — الرابط غير متوفر`}
                  >
                    <SocialIcon platform={social.platform} className="h-5 w-5 transition-[color,transform] duration-250 group-hover:scale-110 group-hover:text-[#C2704B] motion-reduce:transform-none motion-reduce:transition-none" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Services Col */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-4 text-(--secondary-light)">
              خدمات الضيافة
            </h3>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.services.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>{link.title}</span>
                  </Link>
                </li>
              ))}
              <li>
                <RequestModalTrigger className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5">اطلب الخدمة</RequestModalTrigger>
              </li>
            </ul>
          </div>

          {/* Company Links Col */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-4 text-(--secondary-light)">
              عن المنصة
            </h3>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-4 text-(--secondary-light)">
              تواصل معنا
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-(--secondary) shrink-0 mt-0.5" />
                <span>{siteAddress}</span>
              </li>
              <li>
                <a
                  href={`tel:${sitePhone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 text-(--secondary) shrink-0" />
                  <span dir="ltr">{sitePhone}</span>
                </a>
              </li>
              {siteEmail && (
                <li>
                  <a
                    href={`mailto:${siteEmail}`}
                    className="flex items-center gap-2.5 hover:text-white transition-colors"
                  >
                    <Mail className="h-4 w-4 text-(--secondary) shrink-0" />
                    <span>{siteEmail}</span>
                  </a>
                </li>
              )}
              <li className="pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-(--secondary-light) hover:text-white transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>محادثة فورية عبر واتساب</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="#privacy" className="hover:text-white transition-colors">
              سياسة الخصوصية
            </Link>
            <span>•</span>
            <Link href="#terms" className="hover:text-white transition-colors">
              شروط الاستخدام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
