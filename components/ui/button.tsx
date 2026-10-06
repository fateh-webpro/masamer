import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--secondary)",
  {
    variants: {
      variant: {
        default:
          "bg-(--primary) text-white hover:bg-(--primary-dark) shadow-sm active:scale-[0.98]",
        primary:
          "bg-(--primary) text-white hover:bg-(--primary-dark) shadow-sm active:scale-[0.98]",
        secondary:
          "bg-(--secondary) text-white hover:bg-(--secondary-light) shadow-sm active:scale-[0.98]",
        outline:
          "border border-(--border-color) bg-transparent text-(--text-main) hover:bg-black/5 active:scale-[0.98]",
        ghost:
          "bg-transparent text-(--text-main) hover:bg-black/5 active:scale-[0.98]",
        accentOutline:
          "border border-(--secondary) text-(--secondary) hover:bg-(--secondary)/10 active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-md px-3.5 text-xs",
        lg: "h-12 rounded-xl px-7 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
