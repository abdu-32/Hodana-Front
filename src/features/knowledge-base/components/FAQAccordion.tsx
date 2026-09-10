"use client";

import React, { useState } from "react";
import { KBFAQ, KBCategory } from "../api/kb-api";
import {
  BASIC_FAQ_CATEGORY_SLUGS,
  TECHNICAL_FAQ_CATEGORY_SLUGS,
} from "../data/faq-data";
import { ChevronDown, Check, Link2, ThumbsUp, ThumbsDown, HelpCircle, Code2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface FAQAccordionProps {
  faqs: KBFAQ[];
  categoriesMap: Map<string, KBCategory>;
  searchQuery: string;
  selectedCategorySlug?: string | null;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  faqs,
  categoriesMap,
  searchQuery,
}) => {
  const t = useTranslations("KnowledgeBase");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopyLink = (e: React.MouseEvent, faqId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#faq-${faqId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(faqId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (e: React.MouseEvent, faqId: string) => {
    e.stopPropagation();
    setFeedbackGiven((prev) => new Set(prev).add(faqId));
  };

  // Helper to parse inline markdown syntax (**bold**, *italic*, `code`) to unbold text and eliminate raw asterisks
  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={index} className="font-normal text-text-muted">
            {part.slice(2, -2)}
          </span>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-[#e8f3f0] text-[#0f6b5c] font-mono text-xs font-semibold border border-[#d6e7e1]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Helper to render formatted text lines with full left/right text justification
  const renderFormattedAnswer = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Bullet list items
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-text-muted my-1 leading-relaxed text-justify">
            {renderInlineMarkdown(trimmed.substring(2))}
          </li>
        );
      }
      // Numbered list items
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-text-muted my-1 leading-relaxed text-justify">
            {renderInlineMarkdown(trimmed.replace(/^\d+\.\s/, ""))}
          </li>
        );
      }

      return (
        <p key={idx} className="text-text-muted leading-relaxed my-1.5 text-justify">
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    });
  };

  // Helper to render individual FAQ card item
  const renderFaqCard = (faq: KBFAQ) => {
    const isOpen = openIds.has(faq.id);
    const category = categoriesMap.get(faq.categoryId);
    const hasFeedback = feedbackGiven.has(faq.id);

    return (
      <div
        key={faq.id}
        id={`faq-${faq.id}`}
        className={`rounded-xl border transition-all duration-200 overflow-hidden ${
          isOpen
            ? "bg-surface border-primary/40 shadow-md ring-1 ring-primary/20"
            : "bg-surface border-black/10 hover:border-black/20 shadow-xs hover:shadow-sm"
        }`}
      >
        {/* Header / Question Row */}
        <div className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 rounded-xl">
          <button
            type="button"
            onClick={() => toggleOpen(faq.id)}
            className="flex-1 text-left space-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg group"
            aria-expanded={isOpen}
            aria-controls={`faq-answer-${faq.id}`}
          >
            {category && (
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                {category.name}
              </span>
            )}
            <h3 className="text-base sm:text-lg font-semibold text-text pr-2 leading-snug group-hover:text-primary transition-colors">
              {faq.question}
            </h3>
          </button>

          <div className="flex items-center gap-2 pt-1 shrink-0">
            <button
              type="button"
              onClick={(e) => handleCopyLink(e, faq.id)}
              title="Copy direct link"
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
            >
              {copiedId === faq.id ? (
                <Check className="w-4 h-4 text-primary font-bold" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => toggleOpen(faq.id)}
              className={`p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-transform duration-200 ${
                isOpen ? "rotate-180 text-primary" : ""
              }`}
              aria-label={isOpen ? "Collapse FAQ" : "Expand FAQ"}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Answer Content */}
        {isOpen && (
          <div
            id={`faq-answer-${faq.id}`}
            className="px-4 pb-5 pt-3 sm:px-5 border-t border-black/8 text-sm sm:text-base text-text-muted bg-surface-alt/40 animate-in fade-in slide-in-from-top-1 duration-200"
            role="region"
          >
            <div className="text-text-muted">
              {renderFormattedAnswer(faq.answer)}
            </div>

            {/* Helpful feedback section */}
            <div className="mt-6 pt-4 border-t border-black/8 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
              <span>{t("wasThisHelpful")}</span>
              {hasFeedback ? (
                <span className="text-primary font-medium">
                  {t("thankYouFeedback")}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleFeedback(e, faq.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface border border-black/10 hover:bg-primary/10 hover:border-primary/20 hover:text-primary text-text transition-colors font-medium"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Yes</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleFeedback(e, faq.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface border border-black/10 hover:bg-primary/10 hover:border-primary/20 hover:text-primary text-text transition-colors font-medium"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>No</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // When browsing without a search query, render full category sections for smooth scrolling
  if (!searchQuery) {
    const allCategoriesList = Array.from(categoriesMap.values());

    const getCategoryBySlug = (slug: string): KBCategory | undefined => {
      return (
        allCategoriesList.find((c) => c.slug === slug) ||
        allCategoriesList.find((c) => c.id === slug)
      );
    };

    // Build ordered list of Basic Categories
    const orderedBasicCategories = BASIC_FAQ_CATEGORY_SLUGS.map((slug) =>
      getCategoryBySlug(slug)
    ).filter((c): c is KBCategory => c !== undefined);

    // Build ordered list of Technical Categories
    const orderedTechnicalCategories = TECHNICAL_FAQ_CATEGORY_SLUGS.map((slug) =>
      getCategoryBySlug(slug)
    ).filter((c): c is KBCategory => c !== undefined);

    // Fallback for any categories returned by DB/API that might not be in pre-configured lists
    const configuredSlugsSet = new Set([
      ...BASIC_FAQ_CATEGORY_SLUGS,
      ...TECHNICAL_FAQ_CATEGORY_SLUGS,
    ]);
    const extraCategories = allCategoriesList.filter(
      (c) => !configuredSlugsSet.has(c.slug) && !configuredSlugsSet.has(c.id)
    );

    return (
      <div className="space-y-12">
        {/* Section 1: Basic FAQ */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#d6e7e1]">
            <HelpCircle className="w-5.5 h-5.5 text-[#0f6b5c]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#122622]">
              Basic FAQ
            </h2>
          </div>

          <div className="space-y-8">
            {orderedBasicCategories.map((category) => {
              const categoryFaqs = faqs.filter((f) => f.categoryId === category.id);
              if (categoryFaqs.length === 0) return null;

              return (
                <div
                  key={category.id}
                  id={`category-${category.slug}`}
                  className="space-y-3 scroll-mt-36 sm:scroll-mt-40 transition-all duration-300"
                >
                  {/* Category Title Displayed Above Group of Questions */}
                  <h3 className="text-base sm:text-lg font-bold text-[#0f6b5c] flex items-center gap-2 pt-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0f6b5c] shrink-0" />
                    <span>{category.name}</span>
                  </h3>
                  <div className="space-y-3">
                    {categoryFaqs.map(renderFaqCard)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: FAQ for the Technically Inclined (Advanced Technical FAQ) */}
        {orderedTechnicalCategories.some(
          (cat) => faqs.filter((f) => f.categoryId === cat.id).length > 0
        ) && (
          <section className="space-y-6 pt-4">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#d6e7e1]">
              <Code2 className="w-5.5 h-5.5 text-[#0f6b5c]" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#122622]">
                FAQ for the Technically Inclined (Advanced Technical FAQ)
              </h2>
            </div>

            <div className="space-y-8">
              {orderedTechnicalCategories.map((category) => {
                const categoryFaqs = faqs.filter((f) => f.categoryId === category.id);
                if (categoryFaqs.length === 0) return null;

                return (
                  <div
                    key={category.id}
                    id={`category-${category.slug}`}
                    className="space-y-3 scroll-mt-36 sm:scroll-mt-40 transition-all duration-300"
                  >
                    {/* Category Title Displayed Above Group of Questions */}
                    <h3 className="text-base sm:text-lg font-bold text-[#0f6b5c] flex items-center gap-2 pt-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0f6b5c] shrink-0" />
                      <span>{category.name}</span>
                    </h3>
                    <div className="space-y-3">
                      {categoryFaqs.map(renderFaqCard)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Extra Categories Fallback */}
        {extraCategories.length > 0 &&
          extraCategories.some(
            (cat) => faqs.filter((f) => f.categoryId === cat.id).length > 0
          ) && (
            <section className="space-y-6 pt-4">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#d6e7e1]">
                <HelpCircle className="w-5.5 h-5.5 text-[#0f6b5c]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#122622]">
                  Additional FAQs
                </h2>
              </div>
              <div className="space-y-8">
                {extraCategories.map((category) => {
                  const categoryFaqs = faqs.filter((f) => f.categoryId === category.id);
                  if (categoryFaqs.length === 0) return null;

                  return (
                    <div
                      key={category.id}
                      id={`category-${category.slug}`}
                      className="space-y-3 scroll-mt-36 sm:scroll-mt-40 transition-all duration-300"
                    >
                      <h3 className="text-base sm:text-lg font-bold text-[#0f6b5c] flex items-center gap-2 pt-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0f6b5c] shrink-0" />
                        <span>{category.name}</span>
                      </h3>
                      <div className="space-y-3">
                        {categoryFaqs.map(renderFaqCard)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
      </div>
    );
  }

  // Active search query rendering
  return <div className="space-y-3">{faqs.map(renderFaqCard)}</div>;
};
