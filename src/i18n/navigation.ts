import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware wrappers around next/navigation's Link/redirect/usePathname/
 * useRouter -- use these instead of importing directly from "next/navigation"
 * or "next/link" anywhere under app/[locale], so links never silently drop
 * the current locale segment when a user navigates.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);