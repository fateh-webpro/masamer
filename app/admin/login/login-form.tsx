"use client";

import { useActionState } from "react";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginAction, type LoginFormState } from "./actions";

const initialState: LoginFormState = {};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="bg-white p-8 rounded-3xl border border-sand-200/90 shadow-xl shadow-slate-900/5">
      {state?.error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-2">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              dir="ltr"
              placeholder="admin@masamer.sa"
              className="w-full pr-10 pl-4 py-2.5 bg-sand-50/50 rounded-xl border border-sand-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/40 focus:border-secondary-500 transition-colors"
            />
          </div>
          {state?.fieldErrors?.email && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-800 mb-2">
            كلمة المرور
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              dir="ltr"
              placeholder="••••••••"
              className="w-full pr-10 pl-4 py-2.5 bg-sand-50/50 rounded-xl border border-sand-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/40 focus:border-secondary-500 transition-colors"
            />
          </div>
          {state?.fieldErrors?.password && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="w-full justify-center font-bold text-base mt-2 shadow-md shadow-primary-950/10"
        >
          {isPending ? "جاري التحقق والدخول..." : "تسجيل الدخول"}
        </Button>
      </form>
    </div>
  );
}
