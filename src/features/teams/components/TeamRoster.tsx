"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Button,
  ErrorBanner,
  Modal,
  StatusBadge,
  useToast,
} from "@/components/ui";
import { useSession } from "@/features/auth";
import { ApiError } from "@/lib/api-client";
import {
  getTeamRoster,
  leaveTeam,
  listTeamInvitations,
  removeMember,
} from "../lib/teams-client";
import { forgetTeamId } from "../lib/last-team-store";
import { InviteMemberForm } from "./InviteMemberForm";
import type { TeamMember } from "@/lib/api-types-helpers";

const KNOWN_JOIN_STATUSES = ["pending", "accepted", "declined"] as const;

function isKnownJoinStatus(
  value: string,
): value is (typeof KNOWN_JOIN_STATUSES)[number] {
  return (KNOWN_JOIN_STATUSES as readonly string[]).includes(value);
}

function getInitials(email: string): string {
  if (!email) return "?";
  const namePart = email.split("@")[0];
  const parts = namePart.split(/[._-]/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return namePart.substring(0, 2).toUpperCase();
}

/**
 * Doc 06 Sec 5.4: team hub, roster mode — FR-TEAM-004 (leave/remove) and
 * FR-TEAM-005 (roster view).
 */
export function TeamRoster({
  hackathonId,
  teamId,
  onLeft,
}: {
  hackathonId: string;
  teamId: string;
  onLeft: () => void;
}) {
  const t = useTranslations("Teams");
  const { showToast } = useToast();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [pendingRemove, setPendingRemove] = useState<TeamMember | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const rosterQuery = useQuery({
    queryKey: ["teams", teamId],
    queryFn: () => getTeamRoster(teamId),
    retry: false,
  });

  const invitationsQuery = useQuery({
    queryKey: ["teams", teamId, "invitations"],
    queryFn: () => listTeamInvitations(teamId),
    retry: false,
    enabled:
      Boolean(rosterQuery.data) &&
      user?.id === rosterQuery.data?.team.leaderUserId,
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveTeam(teamId),
    onSuccess: () => {
      forgetTeamId(hackathonId);
      setLeaveOpen(false);
      onLeft();
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof ApiError ? error.message : t("genericError"),
        "danger",
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMember(teamId, userId),
    onSuccess: () => {
      setPendingRemove(null);
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof ApiError ? error.message : t("genericError"),
        "danger",
      );
    },
  });

  useEffect(() => {
    if (rosterQuery.isError) {
      forgetTeamId(hackathonId);
      onLeft();
    }
  }, [rosterQuery.isError, hackathonId, onLeft]);

  if (rosterQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-2xl bg-surface-alt" />
        <div className="h-20 animate-pulse rounded-2xl bg-surface-alt" />
        <div className="h-20 animate-pulse rounded-2xl bg-surface-alt" />
      </div>
    );
  }

  if (rosterQuery.isError) {
    return <ErrorBanner message={t("rosterLoadError")} />;
  }

  const { team, members } = rosterQuery.data!;
  const isLeader = user?.id === team.leaderUserId;
  const pendingInvites = ((invitationsQuery.data as any[]) ?? []).filter(
    (invite: any) => invite.joinStatus === "pending",
  );

  const remainingSlots = Math.max(0, team.maxSize - members.length);
  const isFull = members.length >= team.maxSize;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {/* Team Overview Card */}
      <div className="flex flex-col gap-5 rounded-2xl border border-black/[0.07] bg-surface p-4 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-semibold tracking-tight text-text">
                {team.teamName}
              </h2>
              {isLeader && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                  {t("leaderLabel")}
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted">
              Team ID: <code className="rounded bg-surface-alt px-1.5 py-0.5 text-xs font-mono">{team.id.substring(0, 8)}</code>
            </p>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
              isFull
                ? "bg-danger/10 text-danger ring-danger/20"
                : "bg-success/10 text-success ring-success/20"
            }`}
          >
            {isFull ? "Team Full" : `${remainingSlots} Slots Remaining`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-black/[0.06] pt-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Team Size
            </p>
            <p className="mt-1 text-base font-semibold text-text">
              {members.length} / {team.maxSize} members
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Remaining Slots
            </p>
            <p className="mt-1 text-base font-semibold text-text">
              {remainingSlots} slots
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Role
            </p>
            <p className="mt-1 text-base font-semibold text-text">
              {isLeader ? "Team Leader" : "Team Member"}
            </p>
          </div>
        </div>
      </div>

      {/* Roster List */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {t("membersHeading")} ({members.length})
          </h3>
        </div>

        <ul className="flex flex-col gap-3">
          {members.map((member) => {
            const isSelf = member.userId != null && member.userId === user?.id;
            const isMemberLeader = member.userId === team.leaderUserId;
            const canRemove =
              isLeader &&
              Boolean(member.userId) &&
              member.userId !== team.leaderUserId;

            const initials = getInitials(member.inviteeEmail);

            return (
              <li
                key={member.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.07] bg-surface p-4 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isMemberLeader
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface-alt text-text"
                    }`}
                  >
                    {initials}
                  </div>

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-text">
                        {member.inviteeEmail}
                      </span>
                      {isSelf && (
                        <span className="rounded bg-surface-alt px-1.5 py-0.5 text-xs font-medium text-text-muted">
                          {t("youLabel")}
                        </span>
                      )}
                      {isMemberLeader && (
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {t("leaderLabel")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge domain="join" value={member.joinStatus}>
                        {isKnownJoinStatus(member.joinStatus)
                          ? t(`joinStatus.${member.joinStatus}`)
                          : member.joinStatus}
                      </StatusBadge>
                    </div>
                  </div>
                </div>

                {canRemove && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setPendingRemove(member)}
                  >
                    {t("removeMemberCta")}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Invite Teammates (Leader only) */}
      {isLeader && (
        <section className="flex flex-col gap-4 rounded-2xl border border-black/[0.07] bg-surface p-4 sm:p-6 shadow-sm">
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight text-text">
              {t("inviteHeading")}
            </h3>
            <p className="mt-1 text-sm text-text-muted">{t("inviteIntro")}</p>
          </div>

          <InviteMemberForm teamId={teamId} />

          {pendingInvites.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-black/[0.06] pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("pendingInvitesHeading")} ({pendingInvites.length})
              </h4>
              <ul className="flex flex-col gap-2">
                {pendingInvites.map((invite) => (
                  <li
                    key={invite.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-surface-alt/60 px-3.5 py-2 text-sm text-text"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate font-medium">{invite.inviteeEmail}</span>
                    </div>
                    <StatusBadge domain="join" value="pending">
                      {t("joinStatus.pending")}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Leave Team Button (Non-leader members) */}
      {!isLeader && (
        <div className="pt-2">
          <Button variant="secondary" onClick={() => setLeaveOpen(true)} className="w-full sm:w-auto justify-center">
            {t("leaveTeamCta")}
          </Button>
        </div>
      )}

      {/* Modals */}
      <Modal
        open={pendingRemove !== null}
        onClose={() => setPendingRemove(null)}
        title={t("removeMemberModalTitle")}
      >
        <p className="text-sm text-text-muted">
          {t("removeMemberModalBody", {
            email: pendingRemove?.inviteeEmail ?? "",
          })}
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
          <Button variant="secondary" onClick={() => setPendingRemove(null)} className="w-full sm:w-auto justify-center">
            {t("cancelCta")}
          </Button>
          <Button
            variant="danger"
            disabled={removeMutation.isPending}
            onClick={() =>
              pendingRemove?.userId &&
              removeMutation.mutate(pendingRemove.userId)
            }
            className="w-full sm:w-auto justify-center"
          >
            {removeMutation.isPending
              ? t("removing")
              : t("confirmRemoveCta")}
          </Button>
        </div>
      </Modal>

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title={t("leaveTeamModalTitle")}
      >
        <p className="text-sm text-text-muted">{t("leaveTeamModalBody")}</p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
          <Button variant="secondary" onClick={() => setLeaveOpen(false)} className="w-full sm:w-auto justify-center">
            {t("cancelCta")}
          </Button>
          <Button
            variant="danger"
            disabled={leaveMutation.isPending}
            onClick={() => leaveMutation.mutate()}
            className="w-full sm:w-auto justify-center"
          >
            {leaveMutation.isPending ? t("leaving") : t("confirmLeaveCta")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
