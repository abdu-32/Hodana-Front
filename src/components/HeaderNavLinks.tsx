"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LegalModal } from "@/components/ui/LegalModal";

interface HeaderNavLinksProps {
  /** When true, renders the mobile horizontal nav strip (row 2 of mobile header). */
  mobileStrip?: boolean;
}

export function HeaderNavLinks({ mobileStrip = false }: HeaderNavLinksProps) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [policyModalOpen, setPolicyModalOpen] = useState(false);

  const isDiscover = pathname === "/";
  const isHackathons = pathname === "/hackathons";
  const isStartups = pathname === "/startups";

  // ── Mobile nav strip (row 2 of mobile header) ─────────────────────────
  if (mobileStrip) {
    return (
      <>
        <nav
          aria-label="Mobile navigation"
          className="flex items-center gap-0 overflow-x-auto no-scrollbar px-2 py-1"
        >
          <Link
            href="/"
            className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
              isDiscover
                ? "text-[#0f6b5c] bg-[#e8f3f0]"
                : "text-[#57685f] hover:text-[#0f6b5c] hover:bg-[#e8f3f0]/60"
            }`}
          >
            {t("discover")}
          </Link>

          <Link
            href="/hackathons"
            className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
              isHackathons
                ? "text-[#0f6b5c] bg-[#e8f3f0]"
                : "text-[#57685f] hover:text-[#0f6b5c] hover:bg-[#e8f3f0]/60"
            }`}
          >
            {t("hackathons")}
          </Link>

          <Link
            href="/startups"
            className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
              isStartups
                ? "text-[#0f6b5c] bg-[#e8f3f0]"
                : "text-[#57685f] hover:text-[#0f6b5c] hover:bg-[#e8f3f0]/60"
            }`}
          >
            {t("startups")}
          </Link>

          <Link
            href="/#programs"
            className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold text-[#57685f] hover:text-[#0f6b5c] hover:bg-[#e8f3f0]/60 transition-colors"
          >
            {t("programs")}
          </Link>

          <button
            type="button"
            onClick={() => setPolicyModalOpen(true)}
            className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold text-[#57685f] hover:text-[#0f6b5c] hover:bg-[#e8f3f0]/60 transition-colors cursor-pointer"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            {t("policy")}
          </button>
        </nav>

        <LegalModal
          type={policyModalOpen ? "policy" : null}
          onClose={() => setPolicyModalOpen(false)}
        />
      </>
    );
  }

  // ── Desktop nav (single row, hidden on mobile) ────────────────────────
  return (
    <>
      <nav className="hidden md:flex min-w-0 flex-1 items-center justify-center gap-1 lg:gap-3 text-xs font-semibold text-[#57685f]">
        <Link
          href="/"
          className={`relative px-3 py-1.5 transition-colors ${
            isDiscover
              ? "text-[#0f6b5c] font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[#0f6b5c] after:rounded-full"
              : "hover:text-[#0f6b5c]"
          }`}
        >
          {t("discover")}
        </Link>

        <Link
          href="/hackathons"
          className={`relative px-3 py-1.5 transition-colors ${
            isHackathons
              ? "text-[#0f6b5c] font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[#0f6b5c] after:rounded-full"
              : "hover:text-[#0f6b5c]"
          }`}
        >
          {t("hackathons")}
        </Link>

        <Link
          href="/startups"
          className={`relative px-3 py-1.5 transition-colors ${
            isStartups
              ? "text-[#0f6b5c] font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[#0f6b5c] after:rounded-full"
              : "hover:text-[#0f6b5c]"
          }`}
        >
          {t("startups")}
        </Link>

        <Link
          href="/#programs"
          className="px-3 py-1.5 rounded-lg hover:text-[#0f6b5c] transition-colors"
        >
          {t("programs")}
        </Link>

        <button
          type="button"
          onClick={() => setPolicyModalOpen(true)}
          className="px-3 py-1.5 rounded-lg hover:text-[#0f6b5c] transition-colors cursor-pointer text-left font-semibold"
        >
          {t("policy")}
        </button>
      </nav>

      <LegalModal
        type={policyModalOpen ? "policy" : null}
        onClose={() => setPolicyModalOpen(false)}
      />
    </>
  );
}
