"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button, ErrorBanner, Modal, StatusBadge, TextField, useToast } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api-client";
import { listHackathons } from "@/features/hackathons/lib/hackathons-client";
import { getRememberedTeamId } from "@/features/teams/lib/last-team-store";
import {
  listMyRegistrations,
  withdrawRegistration,
} from "../lib/registrations-client";
import type { Registration } from "@/lib/api-types-helpers";

type FilterTab = "all" | "active" | "withdrawn";

/**
 * Doc 06 Sec 5.4: `/dashboard/registrations`, CSR, Participant —
 * FR-REG-002 (view) / FR-REG-003 (withdraw).
 */
export function MyRegistrationsList() {
  const t = useTranslations("Registrations");
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [pendingWithdraw, setPendingWithdraw] = useState<Registration | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const query = useQuery({
    queryKey: ["registrations", "me"],
    queryFn: listMyRegistrations,
  });

  const hackathonsQuery = useQuery({
    queryKey: ["hackathons", "list"],
    queryFn: listHackathons,
  });

  const hackathonById = useMemo(() => {
    const map = new Map<string, { id: string; title: string; slug: string; status?: string }>();
    for (const hackathon of hackathonsQuery.data?.data ?? []) {
      map.set(hackathon.id, {
        id: hackathon.id,
        title: hackathon.title,
        slug: hackathon.slug,
        status: hackathon.status,
      });
    }
    return map;
  }, [hackathonsQuery.data]);

  const withdrawMutation = useMutation({
    mutationFn: (hackathonId: string) => withdrawRegistration(hackathonId),
    onSuccess: () => {
      showToast(t("withdrawSuccess"), "success");
      setPendingWithdraw(null);
      queryClient.invalidateQueries({ queryKey: ["registrations", "me"] });
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof ApiError ? error.message : t("genericError"),
        "danger",
      );
    },
  });

  const registrations = query.data ?? [];

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const isWithdrawn = Boolean(reg.withdrawnAt);
      if (activeTab === "active" && isWithdrawn) return false;
      if (activeTab === "withdrawn" && !isWithdrawn) return false;

      if (!searchQuery.trim()) return true;

      const hackathon = hackathonById.get(reg.hackathonId);
      const title = hackathon?.title ?? reg.hackathonId;
      const queryLower = searchQuery.toLowerCase().trim();
      return title.toLowerCase().includes(queryLower) || reg.status?.toLowerCase().includes(queryLower);
    });
  }, [registrations, activeTab, searchQuery, hackathonById]);

  if (query.isLoading || hackathonsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-hidden="true">
        <div className="h-10 w-full animate-pulse rounded-xl bg-surface-alt" />
        <div className="h-32 animate-pulse rounded-2xl bg-surface-alt" />
        <div className="h-32 animate-pulse rounded-2xl bg-surface-alt" />
      </div>
    );
  }

  if (query.isError) {
    return <ErrorBanner message={t("loadError")} />;
  }

  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-black/10 bg-surface-alt/40 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-display text-base font-semibold text-text">{t("emptyState")}</p>
          <p className="text-sm text-text-muted">Explore open hackathons and start building innovative solutions.</p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium tracking-tight text-white shadow-sm transition-all hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {t("emptyStateCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <TextField
            label="Search registrations"
            placeholder="Search registrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-surface-alt p-1">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === "all"
                ? "bg-surface text-text shadow-sm"
                : "text-text-muted hover:text-text"
              }`}
          >
            All ({registrations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === "active"
                ? "bg-surface text-text shadow-sm"
                : "text-text-muted hover:text-text"
              }`}
          >
            Active ({registrations.filter((r) => !r.withdrawnAt).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("withdrawn")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === "withdrawn"
                ? "bg-surface text-text shadow-sm"
                : "text-text-muted hover:text-text"
              }`}
          >
            Withdrawn ({registrations.filter((r) => Boolean(r.withdrawnAt)).length})
          </button>
        </div>
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/10 bg-surface-alt/30 p-8 text-center">
          <p className="text-sm font-medium text-text">No registrations match your filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveTab("all");
            }}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {filteredRegistrations.map((registration) => {
            const hackathon = hackathonById.get(registration.hackathonId);
            const title = hackathon?.title ?? t("hackathonIdLabel", { id: registration.hackathonId });
            const isWithdrawn = Boolean(registration.withdrawnAt);
            const rememberedTeamId = getRememberedTeamId(registration.hackathonId);

            return (
              <li
                key={registration.id}
                className="flex flex-col gap-5 rounded-2xl border border-black/[0.07] bg-surface p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {hackathon ? (
                      <Link
                        href={`/hackathons/${hackathon.slug}`}
                        className="truncate font-display text-lg font-semibold tracking-tight text-text hover:text-primary transition-colors"
                      >
                        {title}
                      </Link>
                    ) : (
                      <span className="truncate font-display text-lg font-semibold tracking-tight text-text">
                        {title}
                      </span>
                    )}

                    {isWithdrawn ? (
                      <span className="inline-flex items-center rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger ring-1 ring-inset ring-danger/20">
                        {t("withdrawnLabel")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success ring-1 ring-inset ring-success/20">
                        Registered
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                    <span>
                      {t("registeredAtLabel", {
                        date: new Date(registration.registeredAt).toLocaleDateString(),
                      })}
                    </span>

                    {!isWithdrawn && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-text-muted/40" />
                        Team Status:{" "}
                        <span className="font-medium text-text">
                          {rememberedTeamId ? "In Team" : "No Team"}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-black/[0.05] pt-4 sm:border-t-0 sm:pt-0">
                  {hackathon && (
                    <Link
                      href={`/hackathons/${hackathon.slug}`}
                      className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-black/10 bg-surface px-3.5 text-xs font-medium text-text shadow-sm transition-colors hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    >
                      View Hackathon
                    </Link>
                  )}

                  {hackathon && !isWithdrawn && (
                    <Link
                      href={`/hackathons/${hackathon.slug}/team`}
                      className="inline-flex min-h-[38px] items-center justify-center rounded-lg bg-primary px-3.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    >
                      {t("openTeamCta")} &rarr;
                    </Link>
                  )}

                  {!isWithdrawn && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPendingWithdraw(registration)}
                    >
                      {t("withdrawCta")}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={pendingWithdraw !== null}
        onClose={() => setPendingWithdraw(null)}
        title={t("withdrawModalTitle")}
      >
        <p className="text-sm text-text-muted">{t("withdrawModalBody")}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setPendingWithdraw(null)}>
            {t("cancelCta")}
          </Button>
          <Button
            variant="danger"
            disabled={withdrawMutation.isPending}
            onClick={() =>
              pendingWithdraw &&
              withdrawMutation.mutate(pendingWithdraw.hackathonId)
            }
          >
            {withdrawMutation.isPending
              ? t("withdrawing")
              : t("confirmWithdrawCta")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
