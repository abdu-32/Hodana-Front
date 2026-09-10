"use client";

import React, { useEffect, useRef } from "react";
import { Search, X, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

interface KBHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

export const KBHeader: React.FC<KBHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
}) => {
  const t = useTranslations("KnowledgeBase");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="relative bg-[#f3f6f4] pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#d6e7e1] bg-hub-pattern">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e8f3f0] border border-[#d6e7e1] text-[#0f6b5c] text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
          <BookOpen className="w-4 h-4 text-[#0f6b5c]" />
          <span>Documentation & FAQ</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#122622] mb-4 font-display">
          {t("title")}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#57685f] max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          {t("subtitle")}
        </p>

        {/* Search Box Container */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-md rounded-2xl overflow-hidden border border-[#d6e7e1] bg-white text-[#122622] focus-within:border-[#0f6b5c] focus-within:ring-2 focus-within:ring-[#0f6b5c]/20 transition-all duration-200">
            <div className="pl-4 text-[#0f6b5c]">
              <Search className="w-5 h-5" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full py-4 pl-3.5 pr-20 bg-transparent text-[#122622] placeholder:text-[#57685f]/70 text-sm sm:text-base font-medium focus:outline-none"
              aria-label={t("title")}
            />

            <div className="absolute right-3 flex items-center gap-2">
              {searchQuery ? (
                <button
                  onClick={onClearSearch}
                  className="p-1.5 rounded-lg text-[#57685f] hover:text-[#122622] hover:bg-[#e8f3f0] transition-colors"
                  title={t("clearSearch")}
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#0f6b5c] bg-[#e8f3f0] border border-[#d6e7e1] rounded-md">
                  /
                </kbd>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
