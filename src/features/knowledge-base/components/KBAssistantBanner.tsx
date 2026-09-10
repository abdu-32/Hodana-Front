"use client";

import React from "react";
import { Bot, Sparkles, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface KBAssistantBannerProps {
  onOpenAiAssistant?: () => void;
  onOpenHumanSupport?: () => void;
  onOpenMyTickets?: () => void;
}

export const KBAssistantBanner: React.FC<KBAssistantBannerProps> = ({
  onOpenAiAssistant,
  onOpenHumanSupport,
  onOpenMyTickets,
}) => {
  const t = useTranslations("KnowledgeBase");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0e2b25] via-[#0f6b5c] to-[#0b3c33] text-white border border-primary/20 p-6 sm:p-8 shadow-md my-8">
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 text-amber-300 shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI & Human Support</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {t("aiAssistantBannerTitle")}
            </h3>
            <p className="text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              {t("aiAssistantBannerSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={onOpenAiAssistant}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0e2b25] font-bold text-xs sm:text-sm shadow-sm transition-all duration-150"
            type="button"
          >
            <span>{t("askAiBtn")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onOpenHumanSupport && (
            <button
              onClick={onOpenHumanSupport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs sm:text-sm border border-white/20 transition-all duration-150"
              type="button"
            >
              <span>{t("humanSupportBtn")}</span>
            </button>
          )}

          {onOpenMyTickets && (
            <button
              onClick={onOpenMyTickets}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/30 hover:bg-black/40 text-emerald-200 font-medium text-xs sm:text-sm border border-emerald-500/30 transition-all duration-150"
              type="button"
            >
              <span>{t("myTicketsBtn")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

