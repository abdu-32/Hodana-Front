"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button, ErrorBanner, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { useRouter } from "@/i18n/navigation";
import { registerForHackathon } from "../lib/registrations-client";

interface Track {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const DEFAULT_TRACKS: Track[] = [
  {
    id: "general",
    name: "General Innovation",
    description: "Open track for creative digital products, web apps, and tech solutions.",
    icon: "💡",
  },
  {
    id: "ai_ml",
    name: "AI & Machine Learning",
    description: "Solutions leveraging LLMs, computer vision, or predictive models for local impact.",
    icon: "🤖",
  },
  {
    id: "fintech_agri",
    name: "FinTech & AgriTech",
    description: "Applications driving financial inclusion or agricultural efficiency in Ethiopia.",
    icon: "🌾",
  },
];

export function RegistrationForm({
  hackathonId,
  hackathonSlug,
}: {
  hackathonId: string;
  hackathonSlug: string;
}) {
  const t = useTranslations("Registrations");
  const router = useRouter();
  const { showToast } = useToast();

  const [selectedTrack, setSelectedTrack] = useState<string>("general");
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      registerForHackathon(hackathonId, {
        eligibilityConfirmed,
        customAnswers: { selectedTrack },
      }),
    onSuccess: () => {
      showToast("Registration successful! Directing to Team Hub...", "success");
      router.push(`/hackathons/${hackathonSlug}/team`);
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
      className="flex w-full flex-col gap-8"
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

      {/* Step 1: Track Selection */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            1
          </span>
          <h3 className="font-display text-lg font-semibold text-text">
            Select Your Preferred Challenge Track
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {DEFAULT_TRACKS.map((track) => {
            const isSelected = selectedTrack === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrack(track.id)}
                className={`relative flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                    : "border-black/[0.08] bg-surface hover:border-black/20 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{track.icon}</span>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-black/20 bg-surface"
                    }`}
                  >
                    {isSelected && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-display text-base font-bold text-text">
                    {track.name}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    {track.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Terms & Eligibility */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            2
          </span>
          <h3 className="font-display text-lg font-semibold text-text">
            Confirm Eligibility & Guidelines
          </h3>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-black/[0.08] bg-surface p-6 shadow-sm">
          <p className="rounded-xl bg-surface-alt p-4 text-xs sm:text-sm text-text leading-relaxed">
            By registering, you confirm that your team will adhere to the event guidelines, intellectual property policies, and code of conduct of HODANA.
          </p>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/[0.08] p-4 transition-all hover:bg-surface-alt/70">
            <input
              type="checkbox"
              checked={eligibilityConfirmed}
              onChange={(event) => setEligibilityConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-primary"
              aria-invalid={Boolean(fieldErrors.eligibilityConfirmed)}
            />
            <span className="text-sm font-medium text-text">
              {t("eligibilityConfirmLabel")}
            </span>
          </label>
          {fieldErrors.eligibilityConfirmed && (
            <p className="text-sm font-medium text-danger" role="alert">
              {fieldErrors.eligibilityConfirmed}
            </p>
          )}
        </div>
      </div>

      {/* Submit Action */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <Button
          type="submit"
          size="md"
          disabled={mutation.isPending || !eligibilityConfirmed}
          className="w-full sm:w-auto min-w-[200px]"
        >
          {mutation.isPending ? t("registering") : `${t("registerCta")} & Continue →`}
        </Button>
      </div>
    </form>
  );
}
