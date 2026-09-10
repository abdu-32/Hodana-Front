"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  fetchKBCategories,
  fetchKBFAQs,
  KBCategory,
  KBFAQ,
} from "@/features/knowledge-base/api/kb-api";
import { KBHeader } from "@/features/knowledge-base/components/KBHeader";
import { KBAssistantBanner } from "@/features/knowledge-base/components/KBAssistantBanner";
import { KBCategoryFilter } from "@/features/knowledge-base/components/KBCategoryFilter";
import { FAQAccordion } from "@/features/knowledge-base/components/FAQAccordion";
import { KBSkeleton } from "@/features/knowledge-base/components/KBSkeleton";
import {
  AISupportChatModal,
  AIHumanSupportEscalationContext,
} from "@/features/knowledge-base/components/AISupportChatModal";
import { HumanSupportModal } from "@/features/knowledge-base/components/HumanSupportModal";
import { MyTicketsModal } from "@/features/knowledge-base/components/MyTicketsModal";
import { SupportTicket } from "@/features/knowledge-base/api/human-support-api";

export default function HelpCenterPage() {
  const t = useTranslations("KnowledgeBase");

  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [faqs, setFaqs] = useState<KBFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  // Modal states
  const [isHumanSupportOpen, setIsHumanSupportOpen] = useState(false);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);
  const [escalationContext, setEscalationContext] = useState<AIHumanSupportEscalationContext | null>(null);

  // Load categories and initial FAQs
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [cats, faqsResponse] = await Promise.all([
          fetchKBCategories(),
          fetchKBFAQs({ limit: 100 }),
        ]);
        if (isMounted) {
          setCategories(cats);
          setFaqs(faqsResponse.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load knowledge base data:", err);
          setError("Failed to load knowledge base items.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Map for fast category lookup in FAQAccordion
  const categoriesMap = useMemo(() => {
    const map = new Map<string, KBCategory>();
    for (const cat of categories) {
      map.set(cat.id, cat);
      map.set(cat.slug, cat);
    }
    return map;
  }, [categories]);

  // Handle open AI chat modal via custom event
  const handleOpenAiAssistant = () => {
    window.dispatchEvent(new CustomEvent("open-ai-support-assistant"));
  };

  const handleOpenHumanSupport = (context?: AIHumanSupportEscalationContext) => {
    if (context) {
      setEscalationContext(context);
    } else {
      setEscalationContext(null);
    }
    setIsHumanSupportOpen(true);
  };

  const handleTicketCreated = (_ticket: SupportTicket) => {
    setIsHumanSupportOpen(false);
    setIsMyTicketsOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#f3f6f4]">
      {/* Header Search Section */}
      <KBHeader
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        onClearSearch={() => setSearchQuery("")}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Support Assistant & Ticket Shortcuts Banner */}
        <KBAssistantBanner
          onOpenAiAssistant={handleOpenAiAssistant}
          onOpenHumanSupport={() => handleOpenHumanSupport()}
          onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        />

        {/* Category Horizontal Filter Bar */}
        {categories.length > 0 && (
          <div className="mb-8">
            <KBCategoryFilter
              categories={categories}
              selectedCategorySlug={selectedCategorySlug}
              onSelectCategory={(slug) => setSelectedCategorySlug(slug)}
              totalFaqsCount={faqs.length}
            />
          </div>
        )}

        {/* FAQ Accordion List / Loading / Empty States */}
        {loading ? (
          <KBSkeleton count={6} />
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-red-200 p-8 shadow-xs">
            <p className="text-red-700 font-semibold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#0f6b5c] text-white rounded-xl font-bold text-sm hover:bg-[#0b3c33] transition-colors"
              type="button"
            >
              Retry
            </button>
          </div>
        ) : (
          <FAQAccordion
            faqs={faqs}
            categoriesMap={categoriesMap}
            searchQuery={searchQuery}
            selectedCategorySlug={selectedCategorySlug}
          />
        )}
      </div>

      {/* Modals */}
      <AISupportChatModal
        onOpenHumanSupport={(ctx) => handleOpenHumanSupport(ctx)}
      />

      <HumanSupportModal
        isOpen={isHumanSupportOpen}
        onClose={() => setIsHumanSupportOpen(false)}
        onTicketCreated={handleTicketCreated}
        initialSubject={escalationContext?.subject || ""}
        initialDescription={escalationContext?.description || ""}
        initialOtherDetails={escalationContext?.otherDetails || ""}
      />

      <MyTicketsModal
        isOpen={isMyTicketsOpen}
        onClose={() => setIsMyTicketsOpen(false)}
        onOpenNewTicketModal={() => {
          setIsMyTicketsOpen(false);
          handleOpenHumanSupport();
        }}
      />
    </main>
  );
}
