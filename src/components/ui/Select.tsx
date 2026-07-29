"use client";

import { useId, type SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  /** Rendered as a disabled, unselectable first option -- e.g. "Select a track". */
  placeholder?: string;
}

export function Select({
  label,
  options,
  error,
  hint,
  placeholder,
  required,
  className = "",
  ...props
}: SelectProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        defaultValue={placeholder ? "" : undefined}
        className={`min-h-[44px] rounded-lg border px-3.5 text-[15px] text-text
          bg-surface shadow-xs transition-colors
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-focus
          ${error ? "border-danger" : "border-black/12 hover:border-black/20"} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
