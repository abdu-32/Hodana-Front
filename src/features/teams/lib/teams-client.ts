import { authFetch } from "@/lib/api-client";
import type {
  Team,
  TeamMember,
  TeamRoster,
} from "@/lib/api-types-helpers";

export interface HackathonTeamState {
  hackathon: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
  registration: {
    id: string;
    hackathonId: string;
    userId: string;
    registrationType: "solo" | "looking_for_team" | "create_team";
    verificationStatus: string;
    status: string;
    registeredAt: string;
  } | null;
  team: {
    id: string;
    hackathonId: string;
    hackathonTitle?: string;
    teamName: string;
    description: string;
    leaderUserId: string;
    leaderName: string;
    leaderEmail: string;
    openToMembers: boolean;
    maxSize: number;
    createdAt: string;
    memberCount: number;
    isLeader: boolean;
  } | null;
  isLeader: boolean;
  members: Array<{
    id: string;
    teamId: string;
    teamName: string;
    hackathonId: string;
    userId: string | null;
    userName: string;
    avatarUrl?: string | null;
    inviteeEmail: string;
    joinStatus: "pending" | "accepted" | "declined";
    invitedAt: string;
    expiresAt: string;
    respondedAt?: string | null;
    role: "owner" | "member" | null;
  }>;
  pendingInvitations: Array<{
    id: string;
    teamId: string;
    teamName: string;
    hackathonId: string;
    userId: string | null;
    userName: string;
    avatarUrl?: string | null;
    inviteeEmail: string;
    joinStatus: string;
    invitedAt: string;
    expiresAt: string;
    role: string | null;
  }>;
  pendingJoinRequests: Array<{
    id: string;
    teamId: string;
    teamName: string;
    hackathonId: string;
    userId: string;
    userName: string;
    userEmail: string;
    avatarUrl?: string | null;
    message: string;
    status: string;
    createdAt: string;
  }>;
  mySentRequests: Array<{
    id: string;
    teamId: string;
    teamName: string;
    hackathonId: string;
    userId: string;
    userName: string;
    userEmail: string;
    message: string;
    status: string;
    createdAt: string;
  }>;
  myInvitations: Array<{
    id: string;
    teamId: string;
    teamName: string;
    hackathonId: string;
    hackathonTitle: string;
    userId: string | null;
    userName: string;
    inviteeEmail: string;
    joinStatus: string;
    invitedAt: string;
    expiresAt: string;
    role: string | null;
  }>;
  openTeams: Array<{
    id: string;
    hackathonId: string;
    hackathonTitle?: string;
    teamName: string;
    description: string;
    leaderUserId: string;
    leaderName: string;
    leaderEmail: string;
    openToMembers: boolean;
    maxSize: number;
    createdAt: string;
    memberCount: number;
    isLeader: boolean;
    hasRequestedJoin: boolean;
  }>;
}

export async function getHackathonTeamState(hackathonId: string): Promise<HackathonTeamState> {
  return await authFetch<HackathonTeamState>(`/teams/hackathons/${hackathonId}/my-state`);
}

export async function listHackathonTeams(hackathonId: string): Promise<any[]> {
  return await authFetch<any[]>(`/teams/hackathons/${hackathonId}`);
}

export async function createTeam(
  hackathonId: string,
  payload: { teamName: string; description?: string },
): Promise<Team> {
  return await authFetch<Team>(`/teams/hackathons/${hackathonId}/create`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTeam(
  teamId: string,
  payload: { teamName?: string; description?: string; openToMembers?: boolean },
): Promise<Team> {
  return await authFetch<Team>(`/teams/${teamId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTeam(teamId: string): Promise<void> {
  return await authFetch<void>(`/teams/${teamId}`, {
    method: "DELETE",
  });
}

export async function getTeamRoster(teamId: string): Promise<TeamRoster> {
  return await authFetch<TeamRoster>(`/teams/${teamId}`);
}

export async function listTeamInvitations(teamId: string): Promise<TeamMember[]> {
  return await authFetch<TeamMember[]>(`/teams/${teamId}/invitations`);
}

export async function inviteMember(
  teamId: string,
  payload: { inviteeEmail: string },
): Promise<TeamMember> {
  return await authFetch<TeamMember>(`/teams/${teamId}/invitations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  return await authFetch<void>(`/teams/invitations/${invitationId}`, {
    method: "DELETE",
  });
}

export async function acceptInvitation(invitationId: string): Promise<TeamMember> {
  return await authFetch<TeamMember>(`/teams/invitations/${invitationId}/accept`, {
    method: "POST",
  });
}

export async function declineInvitation(invitationId: string): Promise<TeamMember> {
  return await authFetch<TeamMember>(`/teams/invitations/${invitationId}/decline`, {
    method: "POST",
  });
}

export async function listMyInvitations(hackathonId?: string): Promise<TeamMember[]> {
  const url = hackathonId ? `/teams/invitations/me?hackathonId=${hackathonId}` : `/teams/invitations/me`;
  return await authFetch<TeamMember[]>(url);
}

export async function createJoinRequest(
  teamId: string,
  payload: { message?: string } = {},
): Promise<any> {
  return await authFetch<any>(`/teams/${teamId}/join-requests`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelJoinRequest(requestId: string): Promise<void> {
  return await authFetch<void>(`/teams/join-requests/${requestId}`, {
    method: "DELETE",
  });
}

export async function reviewJoinRequest(
  requestId: string,
  payload: { decision: "accepted" | "rejected" },
): Promise<any> {
  return await authFetch<any>(`/teams/join-requests/${requestId}/review`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function leaveTeam(teamId: string): Promise<void> {
  return await authFetch<void>(`/teams/${teamId}/leave`, {
    method: "POST",
  });
}

export async function removeMember(teamId: string, userId: string): Promise<void> {
  return await authFetch<void>(`/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
  });
}

export async function updateRegistrationType(
  hackathonId: string,
  registrationType: "solo" | "looking_for_team" | "create_team",
): Promise<any> {
  return await authFetch<any>(`/registrations/hackathons/${hackathonId}/type`, {
    method: "PATCH",
    body: JSON.stringify({ registrationType }),
  });
}
