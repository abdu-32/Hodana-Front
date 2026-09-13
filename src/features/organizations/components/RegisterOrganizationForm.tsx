"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button, ErrorBanner, Select, TextField } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { useRouter } from "@/i18n/navigation";
import type { RegisterOrganizationType } from "@/lib/api-types-helpers";
import { registerOrganization } from "../lib/organizations-client";
import { rememberRegisteredOrganizationId } from "../lib/last-organization-store";

/**
 * Doc 06 Sec 5.2: `/orgs/new`, CSR, any authenticated user (registering an
 * org is what makes them an Organizer) -- FR-ORG-001. Flow 6.4: after
 * creation the backend either auto-verifies the org (recognized
 * institution domain) or leaves it `unverified` pending document upload,
 * so this form always redirects to `/orgs/{id}/verification` on success
 * rather than trying to guess which branch happened -- that screen reads
 * the org's actual `verificationStatus` and renders the right state.
 */
const ORG_TYPES: RegisterOrganizationType[] = [
  "university",
  "company",
  "ngo",
  "government",
];

export function RegisterOrganizationForm() {
  const t = useTranslations("Organizations");
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState<RegisterOrganizationType | "">("");
  const [contactEmail, setContactEmail] = useState("");
  const [primaryEmailDomain, setPrimaryEmailDomain] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      registerOrganization({
        name,
        type: type as RegisterOrganizationType,
        contactEmail,
        primaryEmailDomain: primaryEmailDomain.trim() || null,
      }),
    onSuccess: (organization) => {
      rememberRegisteredOrganizationId(organization.id);
      router.push(`/orgs/${organization.id}/verification`);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.fields) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(error.fields).map(([field, messages]) => [
              field,
              messages[0],
            ]),
          ),
        );
      }
    },
  });

  const bannerMessage =
    mutation.isError &&
    !(mutation.error instanceof ApiError && mutation.error.fields)
      ? mutation.error instanceof Error
        ? mutation.error.message
        : t("genericError")
      : null;

  return (
    <form
      noValidate
      className="flex w-full max-w-2xl flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setFieldErrors({});
        mutation.mutate();
      }}
    >
      {bannerMessage && (
        <ErrorBanner
          message={bannerMessage}
          onDismiss={() => mutation.reset()}
          dismissLabel={t("dismissError")}
        />
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-black/[0.07] bg-surface p-6 shadow-sm">
        <TextField
          label={t("nameLabel")}
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
        />

        <Select
          label={t("typeLabel")}
          required
          placeholder={t("typePlaceholder")}
          value={type}
          onChange={(event) =>
            setType(event.target.value as RegisterOrganizationType)
          }
          error={fieldErrors.type}
          options={ORG_TYPES.map((value) => ({
            value,
            label: t(`typeOptions.${value}`),
          }))}
        />

        <TextField
          label={t("contactEmailLabel")}
          type="email"
          required
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
          error={fieldErrors.contactEmail}
        />

        <TextField
          label={t("primaryEmailDomainLabel")}
          type="text"
          placeholder="university.edu.et"
          value={primaryEmailDomain}
          onChange={(event) => setPrimaryEmailDomain(event.target.value)}
          error={fieldErrors.primaryEmailDomain}
          hint={
            fieldErrors.primaryEmailDomain
              ? undefined
              : t("primaryEmailDomainHint")
          }
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto justify-center">
          {mutation.isPending ? t("registering") : t("registerCta")}
        </Button>
      </div>
    </form>
  );
}
