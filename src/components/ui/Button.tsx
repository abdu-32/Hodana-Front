"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow active:bg-primary-hover",
  secondary:
    "bg-surface text-text border border-black/10 shadow-sm hover:bg-surface-alt hover:border-black/15",
  danger: "bg-danger text-white shadow-sm hover:brightness-95",
};

const SIZE_CLASSES: Record<Size, string> = {
  // 44x44px minimum tap target (NFR-ACC-002 / Doc 06 Sec 3.4), regardless
  // of label length or language (Doc 06 Sec 9 -- no fixed pixel widths).
  sm: "min-h-[36px] px-3.5 text-sm gap-1.5",
  md: "min-h-[44px] px-4.5 text-[15px] gap-2",
};

/**
 * Doc 06 Sec 7: feature-agnostic primitive, used by every feature module.
 * Focus ring uses --color-focus (Sec 3.2), independent of --color-primary,
 * per NFR-ACC-002.
 */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium tracking-tight
        transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-focus
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
