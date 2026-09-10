"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Globe, Mail, Share2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logomark } from "./Logomark";
import { LegalModal, type LegalModalType } from "./LegalModal";

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);

  return (
    <>
      <footer className="w-full border-t border-[#d6e7e1] bg-[#f3f6f4] text-[#122622]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
          {/* Top 4-Column Section */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12">
            {/* Brand Column */}
            <div className="flex flex-col items-start gap-3 lg:col-span-5">
              <Link href="/" className="flex items-center gap-3.5">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-[#d6e7e1] shadow-xs overflow-hidden p-1 transition-transform hover:scale-105">
                  <Logomark className="h-full w-full object-contain" />
                </span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
                  {tNav("brandName")}
                </span>
              </Link>

              <p className="text-xs leading-relaxed text-[#57685f] max-w-sm">
                {t("summary")}
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3.5 pt-1 text-[#57685f]">
                <a href="#" aria-label="Website" className="p-1 rounded-md hover:text-[#0f6b5c] hover:bg-[#e8f3f0] transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
                <a href="mailto:info@hodana.et" aria-label="Email" className="p-1 rounded-md hover:text-[#0f6b5c] hover:bg-[#e8f3f0] transition-colors">
                  <Mail className="h-4 w-4" />
                </a>
                <a href="#" aria-label="Share" className="p-1 rounded-md hover:text-[#0f6b5c] hover:bg-[#e8f3f0] transition-colors">
                  <Share2 className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Navigation Links Column */}
            <div className="flex flex-col gap-3 lg:col-span-2 sm:col-span-1">
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#57685f]">
                {t("navHeader")}
              </h4>
              <ul className="flex flex-col gap-2 text-xs font-medium text-[#57685f]">
                <li>
                  <Link href="/" className="hover:text-[#0f6b5c] transition-colors">
                    {t("home")}
                  </Link>
                </li>
                <li>
                  <Link href="/hackathons" className="hover:text-[#0f6b5c] transition-colors">
                    {t("hackathons")}
                  </Link>
                </li>
                <li>
                  <Link href="/startups" className="hover:text-[#0f6b5c] transition-colors">
                    {t("gallery")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="flex flex-col gap-3 lg:col-span-3 sm:col-span-1">
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#57685f]">
                {t("resHeader")}
              </h4>
              <ul className="flex flex-col gap-2 text-xs font-medium text-[#57685f]">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("policy")}
                    className="hover:text-[#0f6b5c] transition-colors text-left cursor-pointer"
                  >
                    {t("startupAct")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("policy")}
                    className="hover:text-[#0f6b5c] transition-colors text-left cursor-pointer"
                  >
                    {t("impactReport")}
                  </button>
                </li>
                <li>
                  <Link href="/help" className="hover:text-[#0f6b5c] transition-colors">
                    {t("faq")}
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-[#0f6b5c] transition-colors">
                    {t("support")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="flex flex-col gap-3 lg:col-span-2 sm:col-span-1">
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#57685f]">
                {t("legalHeader")}
              </h4>
              <ul className="flex flex-col gap-2 text-xs font-medium text-[#57685f]">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("terms")}
                    className="hover:text-[#0f6b5c] transition-colors text-left cursor-pointer"
                  >
                    {t("terms")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("privacy")}
                    className="hover:text-[#0f6b5c] transition-colors text-left cursor-pointer"
                  >
                    {t("privacy")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("policy")}
                    className="hover:text-[#0f6b5c] transition-colors text-left cursor-pointer"
                  >
                    {t("govData")}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#d6e7e1] pt-6 text-xs text-[#57685f]">
            <p>{t("rights")}</p>
            <div className="flex items-center gap-1.5 font-medium">
              <span>{t("poweredBy")}</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#0f6b5c]">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#0f6b5c] text-[9px] text-white font-extrabold">C</span>
                Cheche
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modal Popup */}
      <LegalModal type={activeModal} onClose={() => setActiveModal(null)} />
    </>
  );
}
