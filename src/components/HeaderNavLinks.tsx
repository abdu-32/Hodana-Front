"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, LogIn, UserPlus, LogOut } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LegalModal } from "@/components/ui/LegalModal";
import { useSession } from "@/features/auth";

export function HeaderNavLinks() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useSession();
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDiscover = pathname === "/";
  const isHackathons = pathname === "/hackathons";
  const isStartups = pathname === "/startups";

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d6e7e1] bg-white text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-colors cursor-pointer"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          title={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Slide-down Sheet & Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-14 sm:top-16 md:top-20 z-40 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden fixed inset-x-0 top-14 sm:top-16 md:top-20 z-50 border-b border-[#d6e7e1] bg-white p-4 sm:p-5 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-4rem)] overflow-y-auto">
            <div className="flex flex-col gap-1 text-sm font-semibold text-[#57685f]">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`relative px-3 py-2.5 rounded-lg transition-colors ${
                  isDiscover
                    ? "text-[#0f6b5c] font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[#0f6b5c] after:rounded-full"
                    : "hover:text-[#0f6b5c]"
                }`}
              >
                <span>{t("discover")}</span>
              </Link>

              <Link
                href="/hackathons"
                onClick={() => setMobileMenuOpen(false)}
                className={`relative px-3 py-2.5 rounded-lg transition-colors ${
                  isHackathons
                    ? "text-[#0f6b5c] font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[#0f6b5c] after:rounded-full"
                    : "hover:text-[#0f6b5c]"
                }`}
              >
                <span>{t("hackathons")}</span>
              </Link>

              <Link
                href="/startups"
                onClick={() => setMobileMenuOpen(false)}
                className={`relative px-3 py-2.5 rounded-lg transition-colors ${
                  isStartups
                    ? "text-[#0f6b5c] font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[#0f6b5c] after:rounded-full"
                    : "hover:text-[#0f6b5c]"
                }`}
              >
                <span>{t("startups")}</span>
              </Link>

              <Link
                href="/#programs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:text-[#0f6b5c] transition-colors"
              >
                <span>{t("programs")}</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setPolicyModalOpen(true);
                }}
                className="px-3 py-2.5 rounded-lg hover:text-[#0f6b5c] transition-colors cursor-pointer text-left font-semibold"
              >
                <span>{t("policy")}</span>
              </button>

              {/* Mobile Auth Actions */}
              {!user ? (
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-[#d6e7e1]">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#d6e7e1] bg-white py-2.5 text-xs font-bold text-[#122622] hover:bg-[#e8f3f0] hover:text-[#0f6b5c] transition-colors"
                  >
                    <LogIn className="h-4 w-4 text-[#0f6b5c]" />
                    <span>{t("login")}</span>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register Account</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-[#d6e7e1]">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0f6b5c] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5347] transition-all"
                  >
                    <span>My Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      router.push("/");
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#d6e7e1] bg-white py-2.5 text-xs font-bold text-[#57685f] hover:bg-gray-50 hover:text-[#122622] transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-gray-500" />
                    <span>{t("logout")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Policy Hub Popup Modal */}
      <LegalModal type={policyModalOpen ? "policy" : null} onClose={() => setPolicyModalOpen(false)} />
    </>
  );
}

