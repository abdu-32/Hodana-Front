"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus, Sparkles } from "lucide-react";

interface TechStackTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const COMMON_SUGGESTIONS = [
  "Python",
  "FastAPI",
  "React",
  "Next.js",
  "Node.js",
  "PyTorch",
  "TensorFlow",
  "TypeScript",
  "PostgreSQL",
  "TailwindCSS",
  "Docker",
  "Flutter",
  "Solidity",
  "MongoDB",
  "Redis",
];

export function TechStackTagInput({
  tags,
  onChange,
  placeholder = "Type technology and press Enter...",
}: TechStackTagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (!tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const unselectedSuggestions = COMMON_SUGGESTIONS.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Tags Display & Input Container */}
      <div className="flex min-h-[46px] w-full flex-wrap items-center gap-2 rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] p-2 focus-within:border-[#0f6b5c] focus-within:ring-2 focus-within:ring-[#e8f3f0] transition-all">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1 text-xs font-bold text-[#0f6b5c] border border-[#d6e7e1] shadow-xs group"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-gray-400 hover:text-[#c4211c] transition-colors cursor-pointer rounded-full p-0.5"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)}
          placeholder={tags.length === 0 ? placeholder : "Add more tags..."}
          className="flex-1 min-w-[120px] xs:min-w-[160px] bg-transparent px-2 py-1 text-xs font-medium text-[#122622] outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Suggested Quick Add Pills */}
      {unselectedSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#57685f]">
          <span className="flex items-center gap-1 font-semibold text-gray-400">
            <Sparkles className="h-3 w-3 text-[#c68a00]" />
            Quick Add:
          </span>
          {unselectedSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="inline-flex items-center gap-1 rounded-lg bg-gray-100/80 hover:bg-[#e8f3f0] hover:text-[#0f6b5c] px-2 py-0.5 text-[11px] font-medium text-[#57685f] transition-colors cursor-pointer"
            >
              <Plus className="h-2.5 w-2.5" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
