"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@porygon/ui/components/avatar";
import { Badge } from "@porygon/ui/components/badge";
import { Button } from "@porygon/ui/components/button";
import { Input } from "@porygon/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@porygon/ui/components/select";
import { toast } from "@porygon/ui/components/sonner";
import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

import type { Member, Workspace } from "@/components/dashboard/settings/workspace-settings";
import { apiError, fetchOpts } from "@/lib/editor/api-utils";

interface MembersTabProps {
  workspace: Workspace;
  members: Member[];
  currentUserId: string;
  isAdmin: boolean;
  onMembersChange: (members: Member[]) => void;
}

function initials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0]!.toUpperCase();
}

export function MembersTab({
  workspace,
  members,
  currentUserId,
  isAdmin,
  onMembersChange,
}: MembersTabProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [adding, setAdding] = useState(false);

  async function handleAddMember() {
    if (!email.trim()) return;
    setAdding(true);

    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
        ...fetchOpts,
      });
      if (!res.ok) {
        toast.error(await apiError(res));
        return;
      }
      const newMember = await res.json();
      onMembersChange([...members, newMember]);
      setEmail("");
      toast.success("Member added");
    } catch {
      toast.error("Failed to add member");
    } finally {
      setAdding(false);
    }
  }

  async function handleRoleChange(
    member: Member,
    newRole: "admin" | "editor" | "viewer",
  ) {
    const prev = members;
    onMembersChange(
      members.map((m) =>
        m.userId === member.userId ? { ...m, role: newRole } : m,
      ),
    );

    try {
      const res = await fetch(
        `/api/workspaces/${workspace.id}/members/${member.userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
          ...fetchOpts,
        },
      );
      if (!res.ok) {
        onMembersChange(prev);
        toast.error(await apiError(res));
        return;
      }
      toast.success("Role updated");
    } catch {
      onMembersChange(prev);
      toast.error("Failed to update role");
    }
  }

  async function handleRemove(member: Member) {
    const prev = members;
    onMembersChange(members.filter((m) => m.userId !== member.userId));

    try {
      const res = await fetch(
        `/api/workspaces/${workspace.id}/members/${member.userId}`,
        {
          method: "DELETE",
          ...fetchOpts,
        },
      );
      if (!res.ok) {
        onMembersChange(prev);
        toast.error(await apiError(res));
        return;
      }
      toast.success("Member removed");
    } catch {
      onMembersChange(prev);
      toast.error("Failed to remove member");
    }
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium" htmlFor="invite-email">
              Add member by email
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddMember();
              }}
            />
          </div>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as "admin" | "editor" | "viewer")}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddMember} disabled={adding || !email.trim()}>
            <UserPlus className="size-4" />
            {adding ? "Adding..." : "Add"}
          </Button>
        </div>
      )}

      <div className="rounded-lg border">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <span>Member</span>
          <span className="w-32">Role</span>
          {isAdmin && <span className="w-10" />}
        </div>
        {members.map((member) => {
          const isOwner = member.userId === workspace.ownerId;
          const isSelf = member.userId === currentUserId;

          return (
            <div
              key={member.userId}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-4 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarImage src={member.user.image ?? undefined} />
                  <AvatarFallback>
                    {initials(member.user.name, member.user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {member.user.name ?? member.user.email}
                    {isSelf && (
                      <span className="ml-1.5 text-muted-foreground">(you)</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
              </div>

              <div className="w-32">
                {isOwner ? (
                  <Badge variant="secondary">Owner</Badge>
                ) : isAdmin && !isSelf ? (
                  <Select
                    value={member.role}
                    onValueChange={(v) =>
                      handleRoleChange(
                        member,
                        v as "admin" | "editor" | "viewer",
                      )
                    }
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline">{member.role}</Badge>
                )}
              </div>

              {isAdmin && (
                <div className="w-10">
                  {!isOwner && !isSelf && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(member)}
                      aria-label={`Remove ${member.user.name ?? member.user.email}`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
