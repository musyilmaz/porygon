import "dotenv/config";

import { createDb } from "./client";
import { eq } from "./drizzle";
import { account, user } from "./schema/auth";
import { demos } from "./schema/demos";
import { workspaceMembers, workspaces } from "./schema/workspaces";

const SEED_USER_ID = "seed_user_dev";
const SEED_ACCOUNT_ID = "seed_account_dev";
const SEED_WORKSPACE_ID = "seed_workspace_dev";
const SEED_MEMBER_ID = "seed_member_dev";
const SEED_DEMO_ID = "seed_demo_editor_test";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");

  const db = createDb(url);

  // Delete demo (steps, hotspots, annotations cascade)
  const deletedDemos = await db
    .delete(demos)
    .where(eq(demos.id, SEED_DEMO_ID))
    .returning({ id: demos.id });
  if (deletedDemos.length > 0) {
    console.log("Deleted seed demo (steps, hotspots, annotations cascade-deleted)");
  }

  // Delete workspace member
  const deletedMembers = await db
    .delete(workspaceMembers)
    .where(eq(workspaceMembers.id, SEED_MEMBER_ID))
    .returning({ id: workspaceMembers.id });
  if (deletedMembers.length > 0) {
    console.log("Deleted workspace membership");
  }

  // Delete workspace
  const deletedWorkspaces = await db
    .delete(workspaces)
    .where(eq(workspaces.id, SEED_WORKSPACE_ID))
    .returning({ id: workspaces.id });
  if (deletedWorkspaces.length > 0) {
    console.log("Deleted seed workspace");
  }

  // Delete account
  const deletedAccounts = await db
    .delete(account)
    .where(eq(account.id, SEED_ACCOUNT_ID))
    .returning({ id: account.id });
  if (deletedAccounts.length > 0) {
    console.log("Deleted credential account");
  }

  // Delete user
  const deletedUsers = await db
    .delete(user)
    .where(eq(user.id, SEED_USER_ID))
    .returning({ id: user.id });
  if (deletedUsers.length > 0) {
    console.log("Deleted seed user");
  }

  if (
    deletedDemos.length === 0 &&
    deletedUsers.length === 0
  ) {
    console.log("No seed data found to delete.");
  }

  console.log("Unseed complete.");
}

main().catch((err) => {
  console.error("Unseed failed:", err);
  process.exit(1);
});
