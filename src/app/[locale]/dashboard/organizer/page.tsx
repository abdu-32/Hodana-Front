"use client";

import { OrganizerGuard } from "@/features/organizer-onboarding";
import OrganizerDashboardPage from "@/app/[locale]/organizer/dashboard/page";

export default function DashboardOrganizerGatePage() {
  return (
    <OrganizerGuard>
      <OrganizerDashboardPage />
    </OrganizerGuard>
  );
}
