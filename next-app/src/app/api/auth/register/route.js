import { NextResponse } from "next/server";
import { pool } from "@/server/db.mjs";
import {
  attachSessionCookie,
  authApi,
  normalizeEmail,
  readActiveSubscription,
  sanitizeUser,
} from "@/server/core.mjs";
import { registerSchema } from "@/server/schemas.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = normalizeEmail(email);

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
  if (existing.rowCount > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await authApi.hashPassword(password);
  const created = await pool.query(
    `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email
    `,
    [name.trim(), normalizedEmail, passwordHash]
  );

  const user = created.rows[0];
  const billing = await readActiveSubscription(user.id);
  const response = NextResponse.json({ user: sanitizeUser(user), billing }, { status: 201 });
  await attachSessionCookie(response, user.id);
  return response;
}


