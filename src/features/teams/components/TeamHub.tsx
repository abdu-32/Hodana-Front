"use client";

import { useState } from "react";
import { CreateTeamForm } from "./CreateTeamForm";
import { TeamRoster } from "./TeamRoster";
import { getRememberedTeamId } from "../lib/last-team-store";
import type { Team } from "@/lib/api-types-helpers";

/**
 * Doc 06 Sec 5.4: `/hackathons/{slug}/team`, CSR, Participant —
 * FR-TEAM-001, FR-TEAM-002, FR-TEAM-004, FR-TEAM-005.
 *
 * Picks between "create a team" and "show my roster" based on
 * last-team-store.ts (see that file's contract-gap note — there's no
 * server endpoint for "my team on this hackathon"). TeamRoster clears the
 * stored id itself if it turns out stale, which is what drops us back to
 * the create view below.
 */
export function TeamHub({ hackathonId }: { hackathonId: string }) {
  const [teamId, setTeamId] = useState<string | null>(() =>
    getRememberedTeamId(hackathonId),
  );

  if (!teamId) {
    return (
      <CreateTeamForm
        hackathonId={hackathonId}
        onCreated={(team: Team) => setTeamId(team.id)}
      />
    );
  }

  return (
    <TeamRoster
      hackathonId={hackathonId}
      teamId={teamId}
      onLeft={() => setTeamId(null)}
    />
  );
}
