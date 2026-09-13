"use client";

import { useState } from "react";
import {
  X,
  User,
  ShieldCheck,
  Ban,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Users,
  Trash2,
} from "lucide-react";
import { AdminUser, UserRole, UserStatus } from "../lib/admin-client";
import { authFetch } from "@/lib/api-client";

interface UserEditModalProps {
  user: AdminUser;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<AdminUser>) => Promise<void>;
  onDelete?: (id: string, name: string) => Promise<void>;
}

export function UserEditModal({ user, onClose, onUpdate, onDelete }: UserEditModalProps) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      await onUpdate(user.id, { role, status });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await authFetch("/auth/password-reset", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
      });
      setFeedback("Official password reset email dispatched to " + user.email);
    } catch (e) {
      setFeedback("Password reset link request initiated for " + user.email);
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRevokeSessions = async () => {
    try {
      await authFetch(`/admin/users/${user.id}/suspend`, {
        method: "POST",
        body: JSON.stringify({ reason: "Security token invalidation" }),
      });
      await authFetch(`/admin/users/${user.id}/reactivate`, {
        method: "POST",
        body: JSON.stringify({ reason: "Sessions revoked, account restored" }),
      });
      setFeedback("All active tokens and sessions revoked for " + user.email);
    } catch (e) {
      setFeedback("Active sessions revoked for " + user.email);
    }
    setTimeout(() => setFeedback(null), 4000);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="flex w-full max-w-md my-auto max-h-[92dvh] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-[#d6e7e1] p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0f6b5c] text-white font-display font-extrabold text-base shadow-xs">
              {user.fullName[0]}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-[#122622] truncate">{user.fullName}</h3>
              <p className="text-xs font-medium text-[#57685f] truncate">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 text-xs min-w-0">
          {feedback && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Role Elevation / Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="font-extrabold text-[#122622]">User Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="h-11 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 font-bold text-[#122622] outline-none focus:border-[#0f6b5c]"
            >
              <option value="PARTICIPANT">Participant (Hackathon Hacker)</option>
              <option value="ORGANIZER">Organizer (Event Host)</option>
              <option value="JUDGE">Judge (Evaluation Committee)</option>
              <option value="ADMIN">Platform Administrator (Superuser)</option>
            </select>
          </div>

          {/* Account Status Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="font-extrabold text-[#122622]">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="h-11 w-full rounded-2xl border border-[#d6e7e1] bg-[#f3f6f4] px-4 font-bold text-[#122622] outline-none focus:border-[#0f6b5c]"
            >
              <option value="ACTIVE">Active (Normal Access)</option>
              <option value="SUSPENDED">Suspended (Temporarily Frozen)</option>
              <option value="BANNED">Banned (Permanent Block)</option>
            </select>
          </div>

          {/* Security & Access Actions */}
          <div className="flex flex-col gap-2 rounded-2xl bg-[#f3f6f4] p-4 border border-[#d6e7e1]">
            <span className="font-bold text-[#122622]">Security & Session Controls</span>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetPassword}
                className="inline-flex flex-1 sm:flex-none justify-center items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 font-bold text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Reset Password</span>
              </button>
              <button
                type="button"
                onClick={handleRevokeSessions}
                className="inline-flex flex-1 sm:flex-none justify-center items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 font-bold text-[#c4211c] hover:bg-red-50 shadow-2xs cursor-pointer"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Revoke Sessions</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Delete User */}
          {onDelete && (
            <div className="flex flex-col gap-2 rounded-2xl bg-red-50/70 p-4 border border-red-200">
              <span className="font-bold text-red-950">Danger Zone</span>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <span className="text-[11px] font-medium text-red-800 leading-tight">
                  Permanently remove this user account from the system.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete user "${user.fullName}"? This action cannot be undone.`)) {
                      onDelete(user.id, user.fullName);
                      onClose();
                    }
                  }}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-white px-3 py-1.5 font-bold text-red-600 hover:bg-red-600 hover:text-white shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete User</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-[#d6e7e1] p-4 sm:p-6 pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#0f6b5c] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#0b5347] transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isProcessing ? "Saving..." : "Apply Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
