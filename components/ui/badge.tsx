import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
  {
    variants: {
      variant: {
        default:
          "border-(--secondary)/25 bg-(--secondary)/10 text-(--secondary)",
        primary:
          "border-(--primary)/20 bg-(--primary)/5 text-(--primary)",
        outline:
          "border-(--border-color) bg-white/70 text-(--text-muted) backdrop-blur-xs",
        surface:
          "border-(--border-color) bg-white text-(--text-main) shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
