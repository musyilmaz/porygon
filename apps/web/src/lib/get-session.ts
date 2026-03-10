import { getAuth } from "@repo/auth";
import { headers } from "next/headers";

export async function getSession() {
  return getAuth().api.getSession({
    headers: await headers(),
  });
}
