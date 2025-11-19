"use server";

import { auth } from "@/lib/auth";

export async function createOrg(name: string) {
  const session = await auth.api.getSession({
    headers: new Headers(),
  });

  if (!session) throw new Error("Not authenticated");

  const org = await (auth.api as any).organization.creat({
    name,
  });

  return org;
}
