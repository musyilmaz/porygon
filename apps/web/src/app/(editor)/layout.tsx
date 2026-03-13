import { redirect } from "next/navigation";

import { getSession } from "@/lib/get-session";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return <>{children}</>;
}
