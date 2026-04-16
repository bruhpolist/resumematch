import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const SESSION_COOKIE_NAME = "rb_session";
const SESSION_TTL_DAYS = 30;

export const hashPassword = async (password) => bcrypt.hash(password, 12);

export const verifyPassword = async (password, passwordHash) =>
  bcrypt.compare(password, passwordHash);

export const createRawSessionToken = () => crypto.randomBytes(48).toString("hex");

export const hashSessionToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const getSessionExpiry = () => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + SESSION_TTL_DAYS);
  return expiry;
};

export const parseCookies = (cookieHeader = "") => {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce((cookies, pair) => {
    const index = pair.indexOf("=");
    if (index < 0) return cookies;

    const key = pair.slice(0, index).trim();
    const value = decodeURIComponent(pair.slice(index + 1).trim());
    cookies[key] = value;
    return cookies;
  }, {});
};

export const getSessionTokenFromRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE_NAME] ?? null;
};

export const setSessionCookie = (res, token) => {
  const secure = process.env.NODE_ENV === "production";
  const maxAgeSeconds = SESSION_TTL_DAYS * 24 * 60 * 60;
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (secure) {
    cookieParts.push("Secure");
  }

  res.setHeader("Set-Cookie", cookieParts.join("; "));
};

export const clearSessionCookie = (res) => {
  const secure = process.env.NODE_ENV === "production";
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if (secure) {
    cookieParts.push("Secure");
  }

  res.setHeader("Set-Cookie", cookieParts.join("; "));
};