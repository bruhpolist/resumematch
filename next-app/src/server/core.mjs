import { NextResponse } from "next/server";
import { pool } from "./db.mjs";
import {
  createRawSessionToken,
  getSessionExpiry,
  hashSessionToken,
  hashPassword,
  verifyPassword,
} from "./auth.mjs";

export const SESSION_COOKIE_NAME = "rb_session";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export const normalizeEmail = (email) => email.trim().toLowerCase();

export const sanitizeUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
});

export const mapResumeRowToDto = (row) => {
  const full = row.full_description && typeof row.full_description === "object"
    ? row.full_description
    : {};

  return {
    ...full,
    _id: row.id,
    userId: row.user_id,
    public: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const readActiveSubscription = async (userId) => {
  const result = await pool.query(
    `
      SELECT id, subscription_plan, token_count, start_date, end_date, is_unlimited
      FROM subscriptions
      WHERE user_id = $1
        AND status = 'active'
        AND end_date > NOW()
      ORDER BY end_date DESC
      LIMIT 1
    `,
    [userId]
  );

  const row = result.rows[0];
  if (!row) {
    return {
      plan: "free",
      tokenCount: 0,
      hasActiveSubscription: false,
      canAccessPremiumTemplates: false,
      canViewFullAnalysis: false,
      expiresAt: null,
      isUnlimited: false,
    };
  }

  const tokenCount = Number.isInteger(row.token_count) ? row.token_count : null;
  const isUnlimited = Boolean(row.is_unlimited);

  return {
    subscriptionId: row.id,
    plan: row.subscription_plan,
    tokenCount,
    hasActiveSubscription: true,
    canAccessPremiumTemplates: true,
    canViewFullAnalysis: isUnlimited || (tokenCount ?? 0) > 0,
    expiresAt: row.end_date,
    isUnlimited,
  };
};

export const readUserFromRequest = async (request) => {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const result = await pool.query(
    `
      SELECT users.id, users.name, users.email
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = $1
        AND sessions.expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0] ?? null;
};

export const attachSessionCookie = async (response, userId) => {
  const rawToken = createRawSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = getSessionExpiry();

  await pool.query(
    `
      INSERT INTO sessions (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
    `,
    [userId, tokenHash, expiresAt.toISOString()]
  );

  await pool.query(
    `
      DELETE FROM sessions
      WHERE user_id = $1
        AND id NOT IN (
          SELECT id
          FROM sessions
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 5
        )
    `,
    [userId]
  );

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: rawToken,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
};

export const clearSession = async (request, response) => {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashSessionToken(token);
    await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
  }

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
};

export const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export const authApi = {
  hashPassword,
  verifyPassword,
};
