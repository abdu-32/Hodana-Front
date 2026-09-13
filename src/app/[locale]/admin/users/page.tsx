"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Shield,
  Award,
  Code2,
  Edit3,
  CheckCircle2,
  Ban,
  Clock,
  KeyRound,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { UserEditModal } from "@/features/admin/components/UserEditModal";
import { AdminUser, UserRole, adminClient } from "@/features/admin/lib/admin-client";

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activeRole, setActiveRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const list = await adminClient.getUsers(searchQuery, activeRole);
      setUsers(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchQuery, activeRole]);

  const handleUpdateUser = async (id: string, updates: Partial<AdminUser>) => {
    try {
      const updated = await adminClient.updateUser(id, updates);
      await loadUsers();
      setToastMessage(`User profile for "${updated.fullName}" updated.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string, name?: string) => {
    setIsDeleting(true);
    try {
      await adminClient.deleteUser(id);
      setUserToDelete(null);
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
      await loadUsers();
      setToastMessage(`User account for "${name || "User"}" has been permanently deleted.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user account. You cannot delete your own account or unauthorized users.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminShell activeMenu="users">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0e2b25] px-5 py-3 text-xs font-extrabold text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#0f6b5c]">
          <Users className="h-4 w-4" />
          <span>USER GOVERNANCE & ACCESS CONTROL</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#122622]">
          Global User Directory
        </h1>
        <p className="text-xs font-medium text-[#57685f]">
          Search all ecosystem participants, elevate privileges, reassign organizer/judge roles, and control account statuses.
        </p>
      </div>

      {/* Search & Role Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white p-4 sm:p-5 border border-[#d6e7e1] shadow-xs">
        {/* Role Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "ALL", label: "All Users" },
            { key: "PARTICIPANT", label: "Participants" },
            { key: "ORGANIZER", label: "Organizers" },
            { key: "JUDGE", label: "Judges" },
            { key: "ADMIN", label: "Admins" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveRole(item.key)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeRole === item.key
                  ? "bg-[#0f6b5c] text-white shadow-xs"
                  : "bg-[#f3f6f4] text-[#57685f] hover:text-[#122622]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex items-center w-full sm:w-auto sm:min-w-[280px]">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or affiliation..."
            className="h-10 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] pl-10 pr-4 text-xs font-medium text-[#122622] outline-none focus:border-[#0f6b5c]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-[#d6e7e1] bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
            <p className="text-xs font-bold text-[#57685f]">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#e8f3f0] text-[#0f6b5c]">
              <Users className="h-7 w-7" />
            </div>
            <p className="text-sm font-extrabold text-[#122622]">No Users Found</p>
            <p className="text-xs text-[#57685f]">No user accounts match your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[760px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#d6e7e1] bg-[#f3f6f4] text-[#57685f] font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6">User / Identity</th>
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6">Affiliation / Org</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6">Last Active</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6e7e1]/60 font-medium text-[#122622]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f3f6f4]/60 transition-colors">
                    {/* User Profile Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0f6b5c] to-[#123b32] font-display font-extrabold text-sm text-white shadow-2xs">
                          {u.fullName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#122622]">{u.fullName}</span>
                          <span className="text-[11px] text-[#57685f]">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-6">
                      {u.role === "ADMIN" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f3f0] px-3 py-0.5 text-[10px] font-black text-[#0f6b5c]">
                          <ShieldCheck className="h-3 w-3" /> SUPERUSER
                        </span>
                      )}
                      {u.role === "ORGANIZER" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          <Shield className="h-3 w-3" /> ORGANIZER
                        </span>
                      )}
                      {u.role === "JUDGE" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-[10px] font-extrabold text-amber-900">
                          <Award className="h-3 w-3" /> JUDGE
                        </span>
                      )}
                      {u.role === "PARTICIPANT" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-0.5 text-[10px] font-extrabold text-[#0f6b5c]">
                          <Code2 className="h-3 w-3" /> PARTICIPANT
                        </span>
                      )}
                    </td>

                    {/* Affiliation */}
                    <td className="py-4 px-6 text-[#57685f] font-bold">
                      {u.affiliation || "Independent Developer"}
                    </td>

                    {/* Account Status */}
                    <td className="py-4 px-6">
                      {u.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#16793d] border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      )}
                      {u.status === "SUSPENDED" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          <Clock className="h-3 w-3" /> Suspended
                        </span>
                      )}
                      {u.status === "BANNED" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-[#c4211c] border border-red-200">
                          <Ban className="h-3 w-3" /> Banned
                        </span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="py-4 px-6 text-[#57685f] text-[11px]">
                      {new Date(u.lastLoginAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b5c] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#0b5347] transition-colors cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Manage</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          title={`Delete ${u.fullName}`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Edit & Role Elevation Modal */}
      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={handleUpdateUser}
          onDelete={handleDeleteUser}
        />
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="flex w-full max-w-md flex-col gap-5 rounded-3xl bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#122622]">Delete User Account</h3>
                <p className="text-xs font-medium text-[#57685f]">This action is irreversible</p>
              </div>
            </div>

            <div className="rounded-2xl bg-red-50/70 border border-red-200/60 p-4 text-xs text-red-950">
              <p className="font-semibold">
                Are you sure you want to permanently delete account{" "}
                <span className="font-bold underline">{userToDelete.fullName}</span> ({userToDelete.email})?
              </p>
              <p className="mt-1.5 text-[11px] text-red-700">
                All login tokens and sessions will be revoked and this account will be permanently removed.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteUser(userToDelete.id, userToDelete.fullName)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? "Deleting..." : "Delete User"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0f6b5c] border-t-transparent" />
          <p className="text-xs font-bold text-[#57685f]">Loading users directory...</p>
        </div>
      }
    >
      <AdminUsersContent />
    </Suspense>
  );
}
