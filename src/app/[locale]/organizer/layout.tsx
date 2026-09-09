import type { ReactNode } from "react";
import { OrganizerGuard } from "@/features/organizer-onboarding";

export const metadata = {
  title: "Organizer Portal | HODANA",
  description: "Manage your hackathons, judging rounds, participant registrations, and prize distributions.",
};

export default function OrganizerRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OrganizerGuard>{children}</OrganizerGuard>;
}
