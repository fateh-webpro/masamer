import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWhatsAppUrl(phone: string, text?: string): string {
  if (!phone) return "https://wa.me/966539691477";
  const digits = phone.replace(/\D/g, "");
  let formatted = digits;
  if (formatted.startsWith("00966")) {
    formatted = formatted.slice(2);
  } else if (formatted.startsWith("0")) {
    formatted = "966" + formatted.slice(1);
  } else if (!formatted.startsWith("966") && formatted.length === 9) {
    formatted = "966" + formatted;
  }
  const baseUrl = `https://wa.me/${formatted}`;
  if (text) {
    return `${baseUrl}?text=${encodeURIComponent(text)}`;
  }
  return baseUrl;
}
