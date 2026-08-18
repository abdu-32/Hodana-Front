"use client";

import { useTranslations } from "next-intl";
import { Scale, ShieldCheck, FileText, X, CheckCircle2 } from "lucide-react";
import { Modal } from "./Modal";

export type LegalModalType = "terms" | "privacy" | "policy" | null;

export interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  const t = useTranslations("LegalModals");

  if (!type) return null;

  const getModalMeta = () => {
    switch (type) {
      case "terms":
        return {
          title: t("termsTitle"),
          subtitle: t("termsSubtitle"),
          icon: <Scale className="h-6 w-6 text-[#0f6b5c]" />,
          clauses: [
            { title: t("termsClause1Title"), text: t("termsClause1Text") },
            { title: t("termsClause2Title"), text: t("termsClause2Text") },
            { title: t("termsClause3Title"), text: t("termsClause3Text") },
            { title: t("termsClause4Title"), text: t("termsClause4Text") },
          ],
        };
      case "privacy":
        return {
          title: t("privacyTitle"),
          subtitle: t("privacySubtitle"),
          icon: <ShieldCheck className="h-6 w-6 text-[#16793d]" />,
          clauses: [
            { title: t("privacyClause1Title"), text: t("privacyClause1Text") },
            { title: t("privacyClause2Title"), text: t("privacyClause2Text") },
            { title: t("privacyClause3Title"), text: t("privacyClause3Text") },
            { title: t("privacyClause4Title"), text: t("privacyClause4Text") },
          ],
        };
      case "policy":
      default:
        return {
          title: t("policyTitle"),
          subtitle: t("policySubtitle"),
          icon: <FileText className="h-6 w-6 text-[#b45309]" />,
          clauses: [
            { title: t("policyClause1Title"), text: t("policyClause1Text") },
            { title: t("policyClause2Title"), text: t("policyClause2Text") },
            { title: t("policyClause3Title"), text: t("policyClause3Text") },
            { title: t("policyClause4Title"), text: t("policyClause4Text") },
          ],
        };
    }
  };

  const meta = getModalMeta();

  return (
    <Modal open={Boolean(type)} onClose={onClose} title="">
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#d6e7e1] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f3f0] shadow-2xs">
              {meta.icon}
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold text-[#122622]">
                {meta.title}
              </h3>
              <p className="text-xs font-medium text-[#57685f]">
                {meta.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Legal Clauses List */}
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {meta.clauses.map((c, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#d6e7e1] bg-[#f3f6f4] p-3.5 flex flex-col gap-1 text-xs"
            >
              <h4 className="font-bold text-[#122622] flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0f6b5c] shrink-0" />
                <span>{c.title}</span>
              </h4>
              <p className="text-[#57685f] leading-relaxed pl-5 font-normal">
                {c.text}
              </p>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="border-t border-[#d6e7e1] pt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-[#0f6b5c] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-colors cursor-pointer"
          >
            {t("closeBtn")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
