"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button, ErrorBanner, StatusBadge, TextField, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import type { RegisterOrganizationType } from "@/lib/api-types-helpers";
import {
  getOrganization,
  submitVerificationDocuments,
} from "../lib/organizations-client";

/**
 * Doc 06 Sec 5.2: `/orgs/{id}/verification`, CSR, Organizer of that org --
 * FR-ORG-002 (verification status / decision display) and FR-ORG-003
 * (document upload). Flow 6.4:
 *
 *   Register -> domain matches recognized institution? -> auto-verified
 *   (verified badge immediately) : upload up to 3 documents -> pending,
 *   admin review queue -> approved (verified) or rejected (back to
 *   unverified, with a rejection reason shown to the Organizer).
 *
 * Contract gap: `GET /organizations/{id}` only exposes `verificationStatus`
 * / `verifiedAt`, not the most recent `OrgVerificationReview.rejectionReason`
 * -- there's no endpoint returning an org's review history to its own
 * organizer, only the one-shot response of the admin's review action
 * itself (`organizations-client.reviewOrganizationVerification`, called
 * from the *admin* queue). So a rejected-then-resettled-to-unverified org
 * can be prompted to resubmit documents here, but the specific reason text
 * can't be rendered without that endpoint existing -- flagging rather than
 * fabricating a reason.
 */
const MAX_DOCUMENTS = 3;

const ORG_TYPE_VALUES: readonly RegisterOrganizationType[] = [
  "university",
  "company",
  "ngo",
  "government",
];

function isKnownOrgType(value: string): value is RegisterOrganizationType {
  return (ORG_TYPE_VALUES as readonly string[]).includes(value);
}

const KNOWN_VERIFICATION_STATUSES = ["unverified", "pending", "verified"] as const;

function isKnownVerificationStatus(
  value: string,
): value is (typeof KNOWN_VERIFICATION_STATUSES)[number] {
  return (KNOWN_VERIFICATION_STATUSES as readonly string[]).includes(value);
}

export function OrganizationVerificationStatus({
  organizationId,
}: {
  organizationId: string;
}) {
  const t = useTranslations("Organizations");
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const orgQuery = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => getOrganization(organizationId),
  });

  const [documentUrls, setDocumentUrls] = useState<string[]>([""]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: () =>
      submitVerificationDocuments(organizationId, {
        fileUrls: documentUrls.map((url) => url.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      showToast(t("submitSuccess"), "success");
      setDocumentUrls([""]);
      queryClient.invalidateQueries({
        queryKey: ["organization", organizationId],
      });
    },
    onError: (error: unknown) => {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : t("genericError"),
      );
    },
  });

  if (orgQuery.isLoading) {
    return (
      <div className="flex w-full max-w-2xl flex-col gap-4" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-2xl bg-surface-alt" />
        <div className="h-56 animate-pulse rounded-2xl bg-surface-alt" />
      </div>
    );
  }

  if (orgQuery.isError) {
    const notFound =
      orgQuery.error instanceof ApiError && orgQuery.error.status === 404;
    return (
      <ErrorBanner
        message={notFound ? t("notFound") : t("loadError")}
      />
    );
  }

  const organization = orgQuery.data;
  if (!organization) {
    return null;
  }
  const status = organization.verificationStatus;
  const canSubmitDocuments = status !== "verified";

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-black/[0.07] bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold text-text">
              {organization.name}
            </p>
            <p className="text-sm text-text-muted">
              {isKnownOrgType(organization.type)
                ? t(`typeOptions.${organization.type}`)
                : organization.type}
              {" · "}
              {organization.contactEmail}
            </p>
          </div>
          <StatusBadge domain="verification" value={status}>
            {isKnownVerificationStatus(status)
              ? t(`verificationStatus.${status}`)
              : status}
          </StatusBadge>
        </div>

        {status === "verified" && (
          <p className="rounded-lg bg-success/6 px-4 py-3 text-sm text-text">
            {organization.verifiedAt
              ? t("verifiedMessageWithDate", {
                  date: new Date(organization.verifiedAt).toLocaleDateString(),
                })
              : t("verifiedMessage")}
          </p>
        )}

        {status === "pending" && (
          <p className="rounded-lg bg-warning/6 px-4 py-3 text-sm text-text">
            {t("pendingMessage")}
          </p>
        )}

        {status === "unverified" && (
          <p className="rounded-lg bg-surface-alt px-4 py-3 text-sm text-text">
            {t("unverifiedMessage")}
          </p>
        )}
      </div>

      {canSubmitDocuments && (
        <form
          noValidate
          className="flex flex-col gap-4 rounded-2xl border border-black/[0.07] bg-surface p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitError(null);
            submitMutation.mutate();
          }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {t("documentsHeading")}
          </h2>

          {submitError && (
            <ErrorBanner
              message={submitError}
              onDismiss={() => setSubmitError(null)}
              dismissLabel={t("dismissError")}
            />
          )}

          <div className="flex flex-col gap-3">
            {documentUrls.map((url, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <TextField
                    label={t("documentUrlLabel", { index: index + 1 })}
                    type="url"
                    required={index === 0}
                    value={url}
                    onChange={(event) => {
                      const next = [...documentUrls];
                      next[index] = event.target.value;
                      setDocumentUrls(next);
                    }}
                  />
                </div>
                {documentUrls.length > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setDocumentUrls(
                        documentUrls.filter((_, i) => i !== index),
                      )
                    }
                    aria-label={t("removeDocumentCta")}
                  >
                    {t("removeDocumentCta")}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {documentUrls.length < MAX_DOCUMENTS && (
            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDocumentUrls([...documentUrls, ""])}
              >
                {t("addDocumentCta")}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={
                submitMutation.isPending ||
                documentUrls.every((url) => !url.trim())
              }
            >
              {submitMutation.isPending
                ? t("submittingDocuments")
                : t("submitDocumentsCta")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
