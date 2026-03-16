"use client";

import type { Plan } from "@porygon/shared";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@porygon/ui/components/tabs";
import { useState } from "react";

import { BillingTab } from "@/components/dashboard/settings/billing-tab";
import { GeneralTab } from "@/components/dashboard/settings/general-tab";
import { MembersTab } from "@/components/dashboard/settings/members-tab";

interface Member {
  id: string;
  workspaceId: string;
  userId: string;
  role: "admin" | "editor" | "viewer";
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type { Member, Workspace };

interface WorkspaceSettingsProps {
  workspace: Workspace;
  members: Member[];
  currentUserId: string;
  isAdmin: boolean;
  demoCount: number;
}

export function WorkspaceSettings({
  workspace: initialWorkspace,
  members: initialMembers,
  currentUserId,
  isAdmin,
  demoCount,
}: WorkspaceSettingsProps) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [members, setMembers] = useState(initialMembers);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and workspace settings.
        </p>
      </div>

      <Tabs defaultValue="workspace">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <div className="max-w-lg">
            <p className="text-sm text-muted-foreground">
              Account settings coming soon.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="workspace" className="mt-6">
          <GeneralTab workspace={workspace} onUpdate={setWorkspace} />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <MembersTab
            workspace={workspace}
            members={members}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onMembersChange={setMembers}
          />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingTab workspace={workspace} memberCount={members.length} demoCount={demoCount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
