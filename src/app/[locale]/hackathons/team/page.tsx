// Doc 06 Sec 5.4 — /hackathons/{slug}/team, CSR (auth-gated), Participant
// — FR-TEAM-001, FR-TEAM-002, FR-TEAM-004, FR-TEAM-005.
"use client";

import { useTranslations } from "next-intl";
import { TeamHub } from "@/features/teams";
// TODO: same slug->hackathon resolver dependency as the register page —
// confirm against the real hackathons-client.ts.
import { useHackathonBySlug } from "@/features/hackathons";

export default function TeamHubPage({
    params,
}: {
    params: { slug: string };
}) {
    const t = useTranslations("Teams");
    const { data: hackathon, isLoading, isError } = useHackathonBySlug(
        params.slug,
    );

    if (isLoading) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-10" aria-hidden="true">
                <div className="h-8 w-2/3 animate-pulse rounded bg-surface-alt" />
                <div className="mt-6 h-40 animate-pulse rounded-2xl bg-surface-alt" />
            </div>
        );
    }

    if (isError || !hackathon) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-10">
                <p className="text-sm text-red-600">{t("hackathonLoadError")}</p>
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
            <div>
                <h1 className="text-2xl font-semibold">{t("teamHubHeading")}</h1>
                <p className="mt-1 text-sm text-foreground/70">{hackathon.title}</p>
            </div>
            <TeamHub hackathonId={hackathon.id} />
        </div>
    );
}
