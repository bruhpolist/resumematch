import { NextResponse } from "next/server";
import { readActiveSubscription, readUserFromRequest, unauthorized } from "@/server/core.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const user = await readUserFromRequest(request);
  if (!user) return unauthorized();

  const billing = await readActiveSubscription(user.id);
  return NextResponse.json({ billing });
}


