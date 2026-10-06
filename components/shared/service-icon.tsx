import React from "react";
import {
  Coffee,
  Flame,
  Sparkles,
  ShieldCheck,
  Utensils,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Star,
  Crown,
  HeartHandshake,
  LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Coffee,
  Flame,
  Sparkles,
  ShieldCheck,
  Utensils,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Star,
  Crown,
  HeartHandshake,
};

interface ServiceIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function ServiceIcon({ name, className = "w-6 h-6", size }: ServiceIconProps) {
  const IconComponent = SERVICE_ICONS[name] || Coffee;
  return <IconComponent className={className} size={size} />;
}
