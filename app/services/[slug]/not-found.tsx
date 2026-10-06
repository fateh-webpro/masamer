import Link from "next/link";
import { Coffee, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServiceNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-sand-50/50 px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-sand-100 text-secondary-600 flex items-center justify-center mx-auto mb-6">
          <Coffee className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-primary-950 mb-3">
          الخدمة المطلوبة غير متوفرة
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
          عذراً، لم نتمكن من العثور على الخدمة التي تبحث عنها، أو ربما تم تغيير الرابط الخاص بها.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="primary">
            <Link href="/services" className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              <span>استعراض كافة الخدمات</span>
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">الصفحة الرئيسية</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
