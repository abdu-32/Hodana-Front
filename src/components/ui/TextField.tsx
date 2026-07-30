"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

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
  disabled,
  ...props
}: TextFieldProps) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const inputType =
  props.type === "password"
    ? showPassword
      ? "text"
      : "password"
    : props.type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`w-full min-h-11 rounded-lg border pl-3.5 ${ props.type === "password" ? "pr-11" : "pr-3.5" } text-[15px] text-text
            bg-surface shadow-xs transition-colors placeholder:text-text-muted/70
            focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-alt
            disabled:text-text-muted disabled:shadow-none
            ${error ? "border-danger" : "border-black/12 hover:border-black/20"} ${className}`}
          {...props}
          type={inputType}
        />
        {props.type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-text-muted transition-colors hover:text-text"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1 text-sm text-danger" role="alert">
          <span aria-hidden="true">•</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
