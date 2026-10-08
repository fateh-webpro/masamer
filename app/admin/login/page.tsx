import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { AdminLoginForm } from "./login-form";
import { isRuntimeUploadPath } from "@/lib/utils";

export default async function AdminLoginPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-sand-50/70 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center" aria-label={`${settings.siteName} - الصفحة الرئيسية`}>
            {settings.logoPath ? (
              <Image
                src={settings.logoPath}
                alt={settings.siteName}
                width={180}
                height={56}
                unoptimized={isRuntimeUploadPath(settings.logoPath)}
                className="h-12 w-auto object-contain sm:h-14"
                priority
              />
            ) : (
              <span className="text-2xl font-bold tracking-tight text-[#1F294A]">مسامر</span>
            )}
            <span className="mt-3 text-sm font-semibold text-[#1F294A]">لوحة التحكم والإدارة</span>
          </Link>
        </div>

        <AdminLoginForm />

        {/* Back to site link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>العودة إلى الموقع الرئيسي</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
