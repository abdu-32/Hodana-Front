"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button, ErrorBanner, TextField } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api-client";
import { createTeam } from "../lib/teams-client";
import { rememberTeamId } from "../lib/last-team-store";
import type { Team } from "@/lib/api-types-helpers";

/** Doc 06 Sec 5.4: team hub, "create" mode — FR-TEAM-001. */
export function CreateTeamForm({
  hackathonId,
  onCreated,
}: {
  hackathonId: string;
  onCreated: (team: Team) => void;
}) {
  const t = useTranslations("Teams");
  const [teamName, setTeamName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => createTeam(hackathonId, { teamName: teamName.trim() }),
    onSuccess: (team) => {
      rememberTeamId(hackathonId, team.id);
      onCreated(team);
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

      <div className="flex flex-col gap-4 rounded-2xl border border-black/[0.07] bg-surface p-4 sm:p-6 shadow-sm">
        <p className="rounded-lg bg-surface-alt px-4 py-3 text-sm text-text">
          {t("createIntro")}
        </p>
        <TextField
          label={t("teamNameLabel")}
          type="text"
          required
          value={teamName}
          onChange={(event) => setTeamName(event.target.value)}
          error={fieldErrors.teamName}
          hint={fieldErrors.teamName ? undefined : t("teamNameHint")}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          disabled={mutation.isPending || !teamName.trim()}
          className="w-full sm:w-auto justify-center"
        >
          {mutation.isPending ? t("creatingTeam") : t("createTeamCta")}
        </Button>
        <p className="text-sm text-text-muted">
          {t("createAltPath")}{" "}
          <Link
            href="/dashboard/invitations"
            className="font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {t("createAltPathLink")}
          </Link>
        </p>
      </div>
    </form>
  );
}
