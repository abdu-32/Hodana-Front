"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Button, ErrorBanner, StatusBadge, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { listHackathons } from "@/features/hackathons/lib/hackathons-client";
import {
  acceptInvitation,
  declineInvitation,
  getTeamRoster,
  listMyInvitations,
} from "../lib/teams-client";
import { rememberTeamId } from "../lib/last-team-store";

const KNOWN_JOIN_STATUSES = ["pending", "accepted", "declined"] as const;

function isKnownJoinStatus(
  value: string,
): value is (typeof KNOWN_JOIN_STATUSES)[number] {
  return (KNOWN_JOIN_STATUSES as readonly string[]).includes(value);
}

export function InvitationInbox() {
  const t = useTranslations("Teams");
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["teams", "invitations", "me"],
    queryFn: () => listMyInvitations(),
  });

  const hackathonsQuery = useQuery({
    queryKey: ["hackathons", "list"],
    queryFn: () => listHackathons(),
  });

  const hackathonById = useMemo(() => {
    const map = new Map<string, { title: string; slug: string }>();
    for (const hackathon of hackathonsQuery.data?.data ?? []) {
      map.set(hackathon.id, {
        title: hackathon.title,
        slug: hackathon.slug,
      });
    }
    return map;
  }, [hackathonsQuery.data]);

  const acceptMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const member = await acceptInvitation(invitationId);
      try {
        const roster = await getTeamRoster(member.teamId);
        rememberTeamId(roster.team.hackathonId, roster.team.id);
        const hackathon = hackathonById.get(roster.team.hackathonId);
        return { member, roster, slug: hackathon?.slug };
      } catch {
        return { member, roster: null, slug: undefined };
      }
    },
    onSuccess: (data) => {
      showToast("Invitation accepted! Welcome to the team.", "success");
      queryClient.invalidateQueries({
        queryKey: ["teams", "invitations", "me"],
      });

      if (data.slug) {
        router.push(`/hackathons/${data.slug}/team`);
      }
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof ApiError ? error.message : t("genericError"),
        "danger",
      );
    },
  });

  const declineMutation = useMutation({
    mutationFn: (invitationId: string) => declineInvitation(invitationId),
    onSuccess: () => {
      showToast("Invitation declined.", "danger");
      queryClient.invalidateQueries({
        queryKey: ["teams", "invitations", "me"],
      });
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof ApiError ? error.message : t("genericError"),
        "danger",
      );
    },
  });

  if (query.isLoading || hackathonsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-hidden="true">
        <div className="h-28 animate-pulse rounded-2xl bg-surface-alt" />
        <div className="h-28 animate-pulse rounded-2xl bg-surface-alt" />
      </div>
    );
  }

  if (query.isError) {
    return <ErrorBanner message={t("invitationsLoadError")} />;
  }

  const invitations = ((query.data as any[]) ?? []).filter(
    (member: any) => member.joinStatus === "pending",
  );

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-black/10 bg-surface-alt/30 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1 max-w-sm">
          <p className="font-display text-lg font-bold text-text">{t("invitationsEmptyState")}</p>
          <p className="text-sm text-text-muted">{t("invitationsEmptyHint")}</p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover"
        >
          Explore Open Hackathons &rarr;
        </Link>
      </div>
    );
  }

  const busyInvitationId =
    acceptMutation.isPending
      ? acceptMutation.variables
      : declineMutation.isPending
        ? declineMutation.variables
        : null;

  return (
    <ul className="flex flex-col gap-4">
      {invitations.map((invite) => {
        const rowBusy = busyInvitationId === invite.id;

        return (
          <li
            key={invite.id}
            className="group flex flex-col gap-5 rounded-2xl border border-black/[0.08] bg-surface p-4 sm:p-6 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-lg font-bold text-white shadow-sm">
                ✉️
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-bold tracking-tight text-text">
                    Team Invitation
                  </p>
                  <StatusBadge domain="join" value={invite.joinStatus}>
                    {isKnownJoinStatus(invite.joinStatus)
                      ? t(`joinStatus.${invite.joinStatus}`)
                      : invite.joinStatus}
                  </StatusBadge>
                </div>

                <div className="flex flex-col gap-0.5 text-xs text-text-muted">
                  <p className="truncate">
                    Invited: <span className="font-semibold text-text break-all">{invite.inviteeEmail}</span>
                  </p>
                  <p>
                    Expires:{" "}
                    <span className="font-medium text-text">
                      {new Date(invite.expiresAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3 border-t border-black/[0.06] pt-4 sm:border-t-0 sm:pt-0 w-full sm:w-auto">
              <Button
                variant="secondary"
                disabled={rowBusy}
                onClick={() => declineMutation.mutate(invite.id)}
                className="w-full sm:w-auto justify-center"
              >
                {declineMutation.isPending &&
                declineMutation.variables === invite.id
                  ? t("declining")
                  : t("declineCta")}
              </Button>

              <Button
                disabled={rowBusy}
                onClick={() => acceptMutation.mutate(invite.id)}
                className="w-full sm:w-auto justify-center"
              >
                {acceptMutation.isPending &&
                acceptMutation.variables === invite.id
                  ? t("accepting")
                  : t("acceptCta")}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
