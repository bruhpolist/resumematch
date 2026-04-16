import { NextResponse } from "next/server";
import { pool } from "@/server/db.mjs";
import {
  attachSessionCookie,
  authApi,
  normalizeEmail,
  readActiveSubscription,
  sanitizeUser,
} from "@/server/core.mjs";
import { loginSchema } from "@/server/schemas.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const normalizedEmail = normalizeEmail(email);

  const result = await pool.query(
    "SELECT id, name, email, password FROM users WHERE email = $1",
    [normalizedEmail]
  );

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await authApi.verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const billing = await readActiveSubscription(user.id);
  const response = NextResponse.json({ user: sanitizeUser(user), billing });
  await attachSessionCookie(response, user.id);
  return response;
}


