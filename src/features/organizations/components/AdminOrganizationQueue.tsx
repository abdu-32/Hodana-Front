"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Button,
  ErrorBanner,
  Modal,
  StatusBadge,
  useToast,
} from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import type {
  AdminOrganization,
  RegisterOrganizationType,
} from "@/lib/api-types-helpers";
import {
  listPendingOrganizations,
  reviewOrganizationVerification,
} from "../lib/organizations-client";

/**
 * Doc 06 Sec 5.2: `/admin/organizations`, CSR, Platform Admin --
 * FR-ORG-003 (the decision half of verification) and FR-ADMIN-001 (the
 * review-queue dashboard itself). `GET /admin/organizations/pending`
 * already scopes to orgs awaiting a decision, so every row here is
 * actionable -- there's no separate "all organizations" list per the
 * contract's own note (organizations.OrganizationListCreateView has no
 * GET/list; this pending queue is the only listing surface).
 */
const ORG_TYPE_VALUES: readonly RegisterOrganizationType[] = [
  "university",
  "company",
  "ngo",
  "government",
];

function isKnownOrgType(value: string): value is RegisterOrganizationType {
  return (ORG_TYPE_VALUES as readonly string[]).includes(value);
}

export function AdminOrganizationQueue() {
  const t = useTranslations("AdminOrganizations");
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [rejectTarget, setRejectTarget] = useState<AdminOrganization | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");

  const queueQuery = useQuery({
    queryKey: ["admin-organizations-pending"],
    queryFn: listPendingOrganizations,
  });

  const reviewMutation = useMutation({
    mutationFn: (variables: {
      organization: AdminOrganization;
      decision: "approved" | "rejected";
      reason?: string;
    }) =>
      reviewOrganizationVerification(variables.organization.id, {
        decision: variables.decision,
        rejectionReason: variables.reason ?? null,
      }),
    onSuccess: (_review, variables) => {
      showToast(
        variables.decision === "approved"
          ? t("reviewSuccessApproved", { name: variables.organization.name })
          : t("reviewSuccessRejected", { name: variables.organization.name }),
        "success",
      );
      queryClient.setQueryData<AdminOrganization[]>(
        ["admin-organizations-pending"],
        (current) =>
          current?.filter((org) => org.id !== variables.organization.id),
      );
      setRejectTarget(null);
      setRejectionReason("");
    },
    onError: (error: unknown) => {
      showToast(
        error instanceof ApiError ? error.message : t("genericError"),
        "danger",
      );
    },
  });

  if (queueQuery.isLoading) {
    return (
      <div className="flex w-full flex-col gap-3" aria-hidden="true">
        <div className="h-20 animate-pulse rounded-2xl bg-surface-alt" />
        <div className="h-20 animate-pulse rounded-2xl bg-surface-alt" />
        <div className="h-20 animate-pulse rounded-2xl bg-surface-alt" />
      </div>
    );
  }

  if (queueQuery.isError) {
    return <ErrorBanner message={t("loadError")} />;
  }

  const pending = queueQuery.data;
  if (!pending) {
    return null;
  }

  if (pending.length === 0) {
    return (
      <p className="rounded-2xl border border-black/[0.07] bg-surface p-6 text-sm text-text-muted">
        {t("emptyState")}
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {pending.map((organization) => (
        <div
          key={organization.id}
          className="flex flex-col gap-4 rounded-2xl border border-black/[0.07] bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display text-base font-semibold text-text">
                {organization.name}
              </p>
              <StatusBadge domain="verification" value="pending">
                {t("statusPending")}
              </StatusBadge>
            </div>
            <p className="text-sm text-text-muted">
              {isKnownOrgType(organization.type)
                ? t(`typeOptions.${organization.type}`)
                : organization.type}
              {" · "}
              {organization.contactEmail}
            </p>
            <p className="text-xs text-text-muted">
              {t("submittedLabel", {
                date: new Date(organization.createdAt).toLocaleDateString(),
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={reviewMutation.isPending}
              onClick={() => {
                setRejectionReason("");
                setRejectTarget(organization);
              }}
            >
              {t("rejectCta")}
            </Button>
            <Button
              size="sm"
              disabled={reviewMutation.isPending}
              onClick={() =>
                reviewMutation.mutate({ organization, decision: "approved" })
              }
            >
              {t("approveCta")}
            </Button>
          </div>
        </div>
      ))}

      <Modal
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        title={t("rejectModalTitle")}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!rejectTarget) return;
            reviewMutation.mutate({
              organization: rejectTarget,
              decision: "rejected",
              reason: rejectionReason.trim(),
            });
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="rejection-reason"
              className="text-sm font-medium text-text"
            >
              {t("rejectionReasonLabel")}
            </label>
            <textarea
              id="rejection-reason"
              required
              rows={4}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              className="rounded-lg border border-black/12 bg-surface px-3.5 py-2.5 text-[15px] text-text
                shadow-xs transition-colors hover:border-black/20 focus-visible:outline focus-visible:outline-2
                focus-visible:outline-offset-2 focus-visible:outline-focus"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRejectTarget(null)}
            >
              {t("cancelCta")}
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={
                reviewMutation.isPending || rejectionReason.trim() === ""
              }
            >
              {reviewMutation.isPending
                ? t("submittingReview")
                : t("confirmRejectCta")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
