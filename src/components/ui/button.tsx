import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "gold" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none tap-target-min",
          {
            "bg-temple-kumkum text-white hover:bg-temple-kumkumHover shadow-sm":
              variant === "default",
            "bg-temple-gold text-temple-charcoal hover:bg-temple-goldLight font-semibold":
              variant === "gold",
            "border border-temple-gold/50 bg-transparent text-temple-charcoal hover:bg-temple-gold/10":
              variant === "outline",
            "bg-temple-sandstone text-temple-charcoal hover:bg-temple-sandstone/80":
              variant === "secondary",
            "hover:bg-temple-gold/10 hover:text-temple-charcoal":
              variant === "ghost",
            "text-temple-kumkum underline-offset-4 hover:underline":
              variant === "link",
          },
          {
            "h-11 px-5 py-2": size === "default",
            "h-9 rounded-md px-3 text-xs": size === "sm",
            "h-12 rounded-md px-8 text-base": size === "lg",
            "h-11 w-11": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
