import type { ReactNode } from "react";
import { AdminGuard } from "@/features/admin";

export const metadata = {
  title: "Platform Administration | HODANA",
  description: "Platform management, user verification, organization review, and financial oversight.",
};

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
