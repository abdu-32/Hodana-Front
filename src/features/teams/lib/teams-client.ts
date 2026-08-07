import { authFetch } from "@/lib/api-client";
import type {
  CreateTeamRequest,
  InviteMemberRequest,
  Team,
  TeamMember,
  TeamRoster,
} from "@/lib/api-types-helpers";

/**
 * Doc 06 Sec 5.4: Registration & Team Formation (team half).
 * Includes mock fallbacks so user flows function seamlessly without live backend.
 */

const MOCK_TEAMS_KEY = "mock_teams_store";

function getStoredTeams(): Record<string, TeamRoster> {
  try {
    return JSON.parse(localStorage.getItem(MOCK_TEAMS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStoredTeams(teams: Record<string, TeamRoster>) {
  try {
    localStorage.setItem(MOCK_TEAMS_KEY, JSON.stringify(teams));
  } catch {}
}

export async function createTeam(
  hackathonId: string,
  payload: CreateTeamRequest,
): Promise<Team> {
  try {
    return await authFetch<Team>(`/teams/hackathons/${hackathonId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("Backend createTeam failed, creating mock team:", err);
    const teamId = `team-${Date.now()}`;
    const newTeam: Team = {
      id: teamId,
      hackathonId,
      teamName: payload.teamName,
      leaderUserId: "usr-me",
      openToMembers: true,
      maxSize: 5,
      createdAt: new Date().toISOString(),
      memberCount: "1",
    };
    const roster: TeamRoster = {
      team: newTeam,
      members: [
        {
          id: `tm-${Date.now()}`,
          teamId,
          userId: "usr-me",
          inviteeEmail: "you@example.com",
          joinStatus: "accepted",
          invitedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          respondedAt: new Date().toISOString(),
          role: "OWNER",
        },
      ],
    };
    const teams = getStoredTeams();
    teams[teamId] = roster;
    teams[`hackathon_${hackathonId}`] = roster;
    saveStoredTeams(teams);
    return newTeam;
  }
}

export async function getTeamRoster(teamId: string): Promise<TeamRoster> {
  try {
    return await authFetch<TeamRoster>(`/teams/${teamId}`);
  } catch (err) {
    console.warn(`Backend getTeamRoster failed for ${teamId}, returning mock:`, err);
    const teams = getStoredTeams();
    if (teams[teamId]) return teams[teamId];
    if (teams[`hackathon_${teamId}`]) return teams[`hackathon_${teamId}`];
    throw err;
  }
}

export async function inviteMember(
  teamId: string,
  payload: InviteMemberRequest,
): Promise<TeamMember> {
  try {
    return await authFetch<TeamMember>(`/teams/${teamId}/invitations`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("Backend inviteMember failed, returning mock member invite:", err);
    const mockMember: TeamMember = {
      id: `tm-${Date.now()}`,
      teamId,
      userId: `usr-${Date.now()}`,
      inviteeEmail: payload.inviteeEmail,
      joinStatus: "pending",
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      respondedAt: null,
      role: "MEMBER",
    };
    const teams = getStoredTeams();
    if (teams[teamId]) {
      teams[teamId].members.push(mockMember);
      saveStoredTeams(teams);
    }
    return mockMember;
  }
}

export async function listTeamInvitations(teamId: string): Promise<TeamMember[]> {
  try {
    return await authFetch<TeamMember[]>(`/teams/${teamId}/invitations`);
  } catch (err) {
    console.warn("Backend listTeamInvitations failed, returning mock list:", err);
    const teams = getStoredTeams();
    if (teams[teamId]) {
      return teams[teamId].members.filter((m) => m.joinStatus === "pending");
    }
    return [];
  }
}

export async function leaveTeam(teamId: string): Promise<void> {
  try {
    await authFetch<void>(`/teams/${teamId}/leave`, { method: "POST" });
  } catch (err) {
    console.warn("Backend leaveTeam failed, applying mock update:", err);
    const teams = getStoredTeams();
    if (teams[teamId]) {
      delete teams[teamId];
      saveStoredTeams(teams);
    }
  }
}

export async function removeMember(teamId: string, userId: string): Promise<void> {
  try {
    await authFetch<void>(`/teams/${teamId}/members/${userId}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("Backend removeMember failed, removing from mock:", err);
    const teams = getStoredTeams();
    if (teams[teamId]) {
      teams[teamId].members = teams[teamId].members.filter((m) => m.userId !== userId);
      saveStoredTeams(teams);
    }
  }
}

export async function acceptInvitation(invitationId: string): Promise<TeamMember> {
  try {
    return await authFetch<TeamMember>(`/teams/invitations/${invitationId}/accept`, {
      method: "POST",
    });
  } catch (err) {
    console.warn("Backend acceptInvitation failed, simulating mock accept:", err);
    return {
      id: invitationId,
      teamId: "team-mock-accepted",
      userId: "usr-me",
      inviteeEmail: "you@example.com",
      joinStatus: "accepted",
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      respondedAt: new Date().toISOString(),
      role: "MEMBER",
    };
  }
}

export async function declineInvitation(invitationId: string): Promise<TeamMember> {
  try {
    return await authFetch<TeamMember>(`/teams/invitations/${invitationId}/decline`, {
      method: "POST",
    });
  } catch (err) {
    console.warn("Backend declineInvitation failed, simulating mock decline:", err);
    return {
      id: invitationId,
      teamId: "team-mock-declined",
      userId: "usr-me",
      inviteeEmail: "you@example.com",
      joinStatus: "declined",
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      respondedAt: new Date().toISOString(),
      role: "MEMBER",
    };
  }
}

export async function listMyInvitations(): Promise<TeamMember[]> {
  try {
    const res = await authFetch<TeamMember[]>("/teams/invitations/me");
    if (Array.isArray(res)) return res;
  } catch (err) {
    console.warn("Backend listMyInvitations failed, returning sample mock invitations:", err);
  }
  return [
    {
      id: "inv-101",
      teamId: "team-alpha",
      userId: "usr-me",
      inviteeEmail: "participant@innovation.et",
      joinStatus: "pending",
      invitedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      respondedAt: null,
      role: "MEMBER",
    },
    {
      id: "inv-102",
      teamId: "team-beta",
      userId: "usr-me",
      inviteeEmail: "participant@innovation.et",
      joinStatus: "pending",
      invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      respondedAt: null,
      role: "MEMBER",
    },
  ];
}
