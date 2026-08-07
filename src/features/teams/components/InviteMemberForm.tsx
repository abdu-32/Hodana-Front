"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button, ErrorBanner, TextField, useToast } from "@/components/ui";
import { ApiError } from "@/lib/api-client";
import { inviteMember } from "../lib/teams-client";

/**
 * Doc 06 Sec 5.4: team hub, invite panel — FR-TEAM-002. Owner-only
 * server-side; a 403 here means the caller isn't this team's leader.
 */
export function InviteMemberForm({ teamId }: { teamId: string }) {
  const t = useTranslations("Teams");
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      inviteMember(teamId, { inviteeEmail: inviteeEmail.trim() }),
    onSuccess: () => {
      showToast(t("inviteSuccess"), "success");
      setInviteeEmail("");
      setFieldErrors({});
      queryClient.invalidateQueries({
        queryKey: ["teams", teamId, "invitations"],
      });
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
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
      } else if (error instanceof ApiError) {
        showToast(error.message, "danger");
      }
    },
  });

  const bannerMessage =
    mutation.isError &&
    !(mutation.error instanceof ApiError && mutation.error.fields)
      ? t("genericError")
      : null;

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <TextField
            label={t("inviteeEmailLabel")}
            type="email"
            required
            value={inviteeEmail}
            onChange={(event) => setInviteeEmail(event.target.value)}
            error={fieldErrors.inviteeEmail}
          />
        </div>
        <Button
          type="submit"
          disabled={mutation.isPending || !inviteeEmail.trim()}
        >
          {mutation.isPending ? t("inviting") : t("inviteCta")}
        </Button>
      </div>
    </form>
  );
}
