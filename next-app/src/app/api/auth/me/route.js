import { NextResponse } from "next/server";
import { readActiveSubscription, readUserFromRequest, sanitizeUser } from "@/server/core.mjs";

export const runtime = "nodejs";

export async function GET(request) {
  const user = await readUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const billing = await readActiveSubscription(user.id);
  return NextResponse.json({ authenticated: true, user: sanitizeUser(user), billing });
}
