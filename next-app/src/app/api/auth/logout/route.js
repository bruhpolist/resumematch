import { NextResponse } from "next/server";
import { clearSession } from "@/server/core.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  const response = NextResponse.json({ ok: true });
  await clearSession(request, response);
  return response;
}
