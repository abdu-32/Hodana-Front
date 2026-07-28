"use client";

import { useId, type InputHTMLAttributes } from "react";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
}

/**
 * Doc 06 Sec 7 / NFR-USE-003: the single shared form-field component --
 * every feature module's form uses this rather than implementing its own
 * inline error display, so error styling/placement never drifts between
 * screens.
 */
export function TextField({
  label,
  error,
  hint,
  required,
  className = "",
  ...props
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`min-h-[44px] rounded-md border px-3 text-base text-text
          bg-surface focus-visible:outline focus-visible:outline-2
          focus-visible:outline-offset-2 focus-visible:outline-focus
          ${error ? "border-danger" : "border-text-muted/40"} ${className}`}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}