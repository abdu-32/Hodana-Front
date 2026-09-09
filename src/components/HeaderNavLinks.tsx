"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, Compass, Calendar, Rocket, Sparkles, ShieldAlert } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LegalModal } from "@/components/ui/LegalModal";

export function HeaderNavLinks() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDiscover = pathname === "/";
  const isHackathons = pathname === "/hackathons";
  const isStartups = pathname === "/startups";

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2 lg:gap-3 text-xs font-semibold text-[#57685f]">
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

      {/* Mobile Hamburger Toggle Button */}
      <div className="flex md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d6e7e1] bg-white text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          title={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Slide-down Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 z-50 border-b border-[#d6e7e1] bg-white/95 backdrop-blur-md p-5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2 text-sm font-bold text-[#122622]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                isDiscover ? "bg-[#e8f3f0] text-[#0f6b5c]" : "hover:bg-gray-100"
              }`}
            >
              <Compass className="h-4 w-4 text-[#0f6b5c]" />
              <span>{t("discover")}</span>
            </Link>

            <Link
              href="/hackathons"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                isHackathons ? "bg-[#e8f3f0] text-[#0f6b5c]" : "hover:bg-gray-100"
              }`}
            >
              <Calendar className="h-4 w-4 text-[#0f6b5c]" />
              <span>{t("hackathons")}</span>
            </Link>

            <Link
              href="/startups"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                isStartups ? "bg-[#e8f3f0] text-[#0f6b5c]" : "hover:bg-gray-100"
              }`}
            >
              <Rocket className="h-4 w-4 text-[#0f6b5c]" />
              <span>{t("startups")}</span>
            </Link>

            <Link
              href="/#programs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-[#0f6b5c]" />
              <span>{t("programs")}</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setPolicyModalOpen(true);
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <ShieldAlert className="h-4 w-4 text-[#0f6b5c]" />
              <span>{t("policy")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Policy Hub Popup Modal */}
      <LegalModal type={policyModalOpen ? "policy" : null} onClose={() => setPolicyModalOpen(false)} />
    </>
  );
}

