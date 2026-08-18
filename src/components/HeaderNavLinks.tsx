"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ParticipantNavLinks } from "@/features/registrations";
import { OrganizationNavLinks } from "@/features/organizations";
import { LegalModal } from "@/components/ui/LegalModal";

export function HeaderNavLinks() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [policyModalOpen, setPolicyModalOpen] = useState(false);

  const isDiscover = pathname === "/";
  const isHackathons = pathname === "/hackathons";
  const isStartups = pathname === "/startups";

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto sm:justify-center sm:gap-3 text-xs font-semibold text-[#57685f]">
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
      </div>

      {/* Policy Hub Popup Modal */}
      <LegalModal type={policyModalOpen ? "policy" : null} onClose={() => setPolicyModalOpen(false)} />
    </>
  );
}
