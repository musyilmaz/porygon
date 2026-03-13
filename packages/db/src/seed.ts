import crypto from "node:crypto";
import "dotenv/config";

import { createDb } from "./client";
import { eq } from "./drizzle";
import { account, user } from "./schema/auth";
import { annotations } from "./schema/annotations";
import { demos } from "./schema/demos";
import { hotspots } from "./schema/hotspots";
import { steps } from "./schema/steps";
import { workspaceMembers, workspaces } from "./schema/workspaces";

// Better Auth compatible password hashing (scrypt: N=16384, r=16, p=1, dkLen=64)
function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(
      password.normalize("NFKC"),
      salt,
      64,
      { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
      (err, key) => {
        if (err) return reject(err);
        resolve(`${salt}:${key.toString("hex")}`);
      },
    );
  });
}

// Stable IDs for seed data
const SEED_USER_ID = "seed_user_dev";
const SEED_ACCOUNT_ID = "seed_account_dev";
const SEED_WORKSPACE_ID = "seed_workspace_dev";
const SEED_MEMBER_ID = "seed_member_dev";
const SEED_DEMO_ID = "seed_demo_editor_test";
const SEED_STEP_IDS = ["seed_step_1", "seed_step_2", "seed_step_3"] as const;
const SEED_HOTSPOT_IDS = ["seed_hotspot_1", "seed_hotspot_2"] as const;
const SEED_ANNOTATION_IDS = ["seed_annotation_1", "seed_annotation_2"] as const;

const SEED_EMAIL = "user@porygon.com";
const SEED_PASSWORD = "AbwQrt3452";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");

  const db = createDb(url);

  // Check if seed data already exists
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, SEED_USER_ID))
    .limit(1);
  if (existingUser) {
    console.log("Seed data already exists. Run `db:unseed` first to re-seed.");
    process.exit(0);
  }

  // 1. Create user
  await db.insert(user).values({
    id: SEED_USER_ID,
    name: "Dev User",
    email: SEED_EMAIL,
    emailVerified: true,
  });
  console.log(`Created user: ${SEED_EMAIL}`);

  // 2. Create account (email/password credential)
  const hashedPassword = await hashPassword(SEED_PASSWORD);
  await db.insert(account).values({
    id: SEED_ACCOUNT_ID,
    accountId: SEED_USER_ID,
    providerId: "credential",
    userId: SEED_USER_ID,
    password: hashedPassword,
  });
  console.log("Created credential account");

  // 3. Create workspace
  await db.insert(workspaces).values({
    id: SEED_WORKSPACE_ID,
    name: "Dev Workspace",
    slug: "dev-workspace",
    plan: "pro",
    ownerId: SEED_USER_ID,
  });
  console.log(`Created workspace: Dev Workspace (${SEED_WORKSPACE_ID})`);

  // 4. Create workspace member
  await db.insert(workspaceMembers).values({
    id: SEED_MEMBER_ID,
    workspaceId: SEED_WORKSPACE_ID,
    userId: SEED_USER_ID,
    role: "admin",
  });
  console.log("Created workspace membership");

  // 5. Create demo
  await db.insert(demos).values({
    id: SEED_DEMO_ID,
    workspaceId: SEED_WORKSPACE_ID,
    title: "Getting Started with Porygon",
    description: "A sample demo showcasing the editor features",
    slug: "getting-started-with-porygon",
    status: "draft",
    settings: {
      showProgressBar: true,
      autoPlay: false,
      showNavigation: true,
      brandColor: "#6366f1",
    },
    createdBy: SEED_USER_ID,
  });
  console.log(`Created demo: ${SEED_DEMO_ID}`);

  // 6. Create steps
  await db.insert(steps).values([
    {
      id: SEED_STEP_IDS[0],
      demoId: SEED_DEMO_ID,
      orderIndex: 0,
      screenshotUrl:
        "https://placehold.co/1280x720/1e293b/e2e8f0?text=Step+1:+Dashboard",
      actionType: "click",
      actionCoordinates: { x: 640, y: 360 },
    },
    {
      id: SEED_STEP_IDS[1],
      demoId: SEED_DEMO_ID,
      orderIndex: 1,
      screenshotUrl:
        "https://placehold.co/1280x720/1e293b/e2e8f0?text=Step+2:+Create+Demo",
      actionType: "click",
      actionCoordinates: { x: 200, y: 100 },
    },
    {
      id: SEED_STEP_IDS[2],
      demoId: SEED_DEMO_ID,
      orderIndex: 2,
      screenshotUrl:
        "https://placehold.co/1280x720/1e293b/e2e8f0?text=Step+3:+Publish",
      actionType: "click",
      actionCoordinates: { x: 900, y: 50 },
    },
  ]);
  console.log(`Created ${SEED_STEP_IDS.length} steps`);

  // 7. Create hotspots
  await db.insert(hotspots).values([
    {
      id: SEED_HOTSPOT_IDS[0],
      stepId: SEED_STEP_IDS[0],
      x: 580,
      y: 320,
      width: 120,
      height: 80,
      targetStepId: SEED_STEP_IDS[1],
      tooltipContent: { text: "Click here to create a new demo" },
      tooltipPosition: "top",
      style: {
        borderColor: "#6366f1",
        borderWidth: 2,
        pulseAnimation: true,
      },
    },
    {
      id: SEED_HOTSPOT_IDS[1],
      stepId: SEED_STEP_IDS[1],
      x: 150,
      y: 60,
      width: 100,
      height: 80,
      targetStepId: SEED_STEP_IDS[2],
      tooltipContent: { text: "Fill in the details and publish" },
      tooltipPosition: "bottom",
      style: {
        borderColor: "#10b981",
        borderWidth: 2,
        pulseAnimation: false,
      },
    },
  ]);
  console.log(`Created ${SEED_HOTSPOT_IDS.length} hotspots`);

  // 8. Create annotations
  await db.insert(annotations).values([
    {
      id: SEED_ANNOTATION_IDS[0],
      stepId: SEED_STEP_IDS[0],
      type: "highlight",
      x: 500,
      y: 300,
      width: 280,
      height: 120,
      settings: {
        highlightColor: "#fbbf24",
        highlightOpacity: 0.3,
      },
    },
    {
      id: SEED_ANNOTATION_IDS[1],
      stepId: SEED_STEP_IDS[2],
      type: "blur",
      x: 50,
      y: 600,
      width: 300,
      height: 80,
      settings: {
        blurIntensity: 8,
      },
    },
  ]);
  console.log(`Created ${SEED_ANNOTATION_IDS.length} annotations`);

  console.log("\nSeed complete!");
  console.log(`\nLogin: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
  console.log(`Editor URL: /editor/${SEED_DEMO_ID}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
