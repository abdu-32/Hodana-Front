"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button, ErrorBanner, StatusBadge, TextField, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { useSession } from "@/features/auth";
import { updateMyProfile } from "../lib/profile-client";

/**
 * Doc 06 Sec 5.1: `/settings/profile`, CSR, all authenticated roles
 * (FR-PROFILE-001 edit + FR-PROFILE-003 -- skills/bio/university/portfolio
 * as the profile-completeness fields other features read from). Sourced
 * from `useSession().user` rather than a fresh `GET /users/me` -- Sec 2
 * "server is the source of truth" is already satisfied by SessionProvider
 * having fetched it via login/refresh, so a second round trip here would
 * just be duplicate work for data we already trust.
 *
 * `skills` has no shared multi-select/tag input in components/ui yet, so
 * it's edited as a comma-separated list, same trick the contract itself
 * uses for the wire format (`skills: string[]`).
 */
const KNOWN_VERIFICATION_STATUSES = ["unverified", "pending", "verified"] as const;

function isKnownVerificationStatus(
  value: string,
): value is (typeof KNOWN_VERIFICATION_STATUSES)[number] {
  return (KNOWN_VERIFICATION_STATUSES as readonly string[]).includes(value);
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </h2>
  );
}

export function ProfileForm() {
  const t = useTranslations("Profile");
  const { user, updateUser } = useSession();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [university, setUniversity] = useState(user?.university ?? "");
  const [skillsText, setSkillsText] = useState(
    (user?.skills ?? []).join(", "),
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl ?? "");
  const [contactEmail, setContactEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      updateMyProfile({
        fullName,
        bio,
        university,
        skills: skillsText
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        avatarUrl,
        portfolioUrl,
        ...(contactEmail ? { contactEmail } : {}),
      }),
    onSuccess: (updated) => {
      updateUser(updated);
      showToast(t("saveSuccess"), "success");
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

  // SessionProvider guarantees `user` is set here in practice (this form
  // only renders on the /settings/profile route, which middleware already
  // gates on a refresh cookie), but the type is nullable while the
  // mount-time refresh is in flight.
  if (!user) {
    return (
      <div className="flex w-full max-w-2xl flex-col gap-4" aria-hidden="true">
        <div className="h-40 animate-pulse rounded-2xl bg-surface-alt" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
      </div>
    );
  }

  const initial = fullName.trim().charAt(0).toUpperCase() || "?";
  const showAvatarImage = avatarUrl && !avatarLoadFailed;

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

      <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-surface shadow-sm">
        {/* Identity -- avatar preview + verification status, read-mostly. */}
        <div className="flex flex-col gap-4 p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {showAvatarImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar
              // comes from an arbitrary user-supplied URL, previewed live
              // as the person edits the field below.
              <img
                src={avatarUrl}
                alt=""
                onError={() => setAvatarLoadFailed(true)}
                onLoad={() => setAvatarLoadFailed(false)}
                className="h-16 w-16 rounded-full object-cover ring-1 ring-black/10"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-display text-xl font-semibold text-primary"
              >
                {initial}
              </span>
            )}
            <div>
              <p className="font-display text-lg font-semibold text-text">
                {fullName || user.fullName}
              </p>
              <p className="text-sm text-text-muted">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">{t("verificationLabel")}</span>
            <StatusBadge domain="verification" value={user.verificationStatus}>
              {isKnownVerificationStatus(user.verificationStatus)
                ? t(`verificationStatus.${user.verificationStatus}`)
                : user.verificationStatus}
            </StatusBadge>
          </div>
        </div>

        <div className="border-t border-black/6 p-6">
          <div className="flex flex-col gap-4">
            <SectionHeading>{t("sectionBasics")}</SectionHeading>

            <TextField
              label={t("emailLabel")}
              type="email"
              value={user.email}
              disabled
              hint={t("emailHint")}
            />

            <TextField
              label={t("fullNameLabel")}
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              error={fieldErrors.fullName}
            />
          </div>
        </div>

        <div className="border-t border-black/6 p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <SectionHeading>{t("sectionAbout")}</SectionHeading>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="profile-bio" className="text-sm font-medium text-text">
                {t("bioLabel")}
              </label>
              <textarea
                id="profile-bio"
                rows={4}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                aria-invalid={Boolean(fieldErrors.bio)}
                className={`rounded-lg border px-3.5 py-2.5 text-[15px] text-text bg-surface shadow-xs
                  transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-focus
                  ${fieldErrors.bio ? "border-danger" : "border-black/12 hover:border-black/20"}`}
              />
              {fieldErrors.bio && (
                <p className="flex items-start gap-1 text-sm text-danger" role="alert">
                  <span aria-hidden="true">•</span>
                  <span>{fieldErrors.bio}</span>
                </p>
              )}
            </div>

            <TextField
              label={t("universityLabel")}
              type="text"
              value={university}
              onChange={(event) => setUniversity(event.target.value)}
              error={fieldErrors.university}
            />

            <TextField
              label={t("skillsLabel")}
              type="text"
              value={skillsText}
              onChange={(event) => setSkillsText(event.target.value)}
              error={fieldErrors.skills}
              hint={fieldErrors.skills ? undefined : t("skillsHint")}
            />
          </div>
        </div>

        <div className="border-t border-black/6 p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <SectionHeading>{t("sectionLinks")}</SectionHeading>

            <TextField
              label={t("avatarUrlLabel")}
              type="url"
              value={avatarUrl}
              onChange={(event) => {
                setAvatarUrl(event.target.value);
                setAvatarLoadFailed(false);
              }}
              error={fieldErrors.avatarUrl}
            />

            <TextField
              label={t("portfolioUrlLabel")}
              type="url"
              value={portfolioUrl}
              onChange={(event) => setPortfolioUrl(event.target.value)}
              error={fieldErrors.portfolioUrl}
            />

            <TextField
              label={t("contactEmailLabel")}
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              error={fieldErrors.contactEmail}
              hint={fieldErrors.contactEmail ? undefined : t("contactEmailHint")}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto justify-center">
          {mutation.isPending ? t("saving") : t("saveCta")}
        </Button>
      </div>
    </form>
  );
}
