"use client";

import React, { useRef, useEffect } from "react";
import { KBCategory } from "../api/kb-api";
import { Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface KBCategoryFilterProps {
  categories: KBCategory[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  totalFaqsCount?: number;
}

export const KBCategoryFilter: React.FC<KBCategoryFilterProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
}) => {
  const t = useTranslations("KnowledgeBase");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active category button into view inside horizontal track
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeBtn = scrollContainerRef.current.querySelector<HTMLElement>(
      '[aria-pressed="true"]'
    );
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedCategorySlug]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      aria-label="FAQ Categories Navigation"
      className="w-full border-b border-[#d6e7e1] bg-white/95 backdrop-blur-md sticky top-20 z-30 shadow-xs py-2.5"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative flex items-center gap-2">
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scroll("left")}
          className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8f3f0] text-[#0f6b5c] hover:bg-[#d6e7e1] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f6b5c] shadow-xs cursor-pointer z-20"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container with Edge Masks */}
        <div className="relative flex-1 overflow-hidden">
          {/* Edge Gradient Overlay Masks */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-r from-white via-white/80 to-transparent z-10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-l from-white via-white/80 to-transparent z-10"
            aria-hidden="true"
          />

          {/* Scroll Track with Edge Clearance Padding */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 pl-8 sm:pl-10 lg:pl-12 pr-8 sm:pr-10 lg:pr-12"
          >
            {/* All Categories Button (First Item) */}
            <button
              onClick={() => onSelectCategory(null)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f6b5c] cursor-pointer ${
                selectedCategorySlug === null
                  ? "bg-[#0f6b5c] text-white shadow-sm"
                  : "bg-[#e8f3f0] text-[#57685f] hover:text-[#122622] hover:bg-[#d6e7e1] border border-[#d6e7e1]"
              }`}
              type="button"
              aria-pressed={selectedCategorySlug === null}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t("allCategories")}</span>
            </button>

            {/* Category Buttons */}
            {categories.map((category) => {
              const isSelected = selectedCategorySlug === category.slug;
              return (
                <button
                  key={category.id}
                  onClick={() => onSelectCategory(category.slug)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f6b5c] cursor-pointer ${
                    isSelected
                      ? "bg-[#0f6b5c] text-white shadow-sm"
                      : "bg-[#e8f3f0] text-[#57685f] hover:text-[#122622] hover:bg-[#d6e7e1] border border-[#d6e7e1]"
                  }`}
                  type="button"
                  aria-pressed={isSelected}
                >
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => scroll("right")}
          className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8f3f0] text-[#0f6b5c] hover:bg-[#d6e7e1] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f6b5c] shadow-xs cursor-pointer z-20"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
