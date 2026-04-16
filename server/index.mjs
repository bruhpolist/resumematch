import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import dotenv from "dotenv";
import { z } from "zod";
import { createServer as createViteServer } from "vite";
import { analyzeResume } from "./openrouter.mjs";
import { pool } from "./db.mjs";
import {
  clearSessionCookie,
  createRawSessionToken,
  getSessionExpiry,
  getSessionTokenFromRequest,
  hashPassword,
  hashSessionToken,
  setSessionCookie,
  verifyPassword,
} from "./auth.mjs";
import {
  consumeAnalysisCredit,
  createCardlinkCheckout,
  createPendingPayment,
  createYooKassaCheckout,
  getCountryFromRequest,
  getCurrencyByCountry,
  getProvidersByCountry,
  getPaymentById,
  getPlanByName,
  listPricingPlans,
  localizePrice,
  markPaymentAsFailed,
  markPaymentAsSucceeded,
  normalizePlanName,
  syncPaymentStatus,
  verifyCardlinkNotification,
} from "./billing.mjs";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const isProd = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 5173);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../client/dist");
const clientRoot = path.resolve(__dirname, "../client");

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const checkoutSchema = z.object({
  planName: z.string().min(1),
  provider: z.enum(["cardlink", "yookassa"]),
  country: z.string().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url().optional(),
});

const resumeSchema = z.object({
  title: z.string().min(1).max(200),
  personal_info: z
    .object({
      full_name: z.string().optional().default(""),
      email: z.string().optional().default(""),
      phone: z.string().optional().default(""),
      location: z.string().optional().default(""),
      linkedin: z.string().optional().default(""),
      website: z.string().optional().default(""),
      profession: z.string().optional().default(""),
      image: z.string().optional().default(""),
    })
    .passthrough(),
  professional_summary: z.string().optional().default(""),
  skills: z.array(z.string()).optional().default([]),
  experience: z.array(z.record(z.any())).optional().default([]),
  education: z.array(z.record(z.any())).optional().default([]),
  project: z.array(z.record(z.any())).optional().default([]),
  template: z.string().optional().default("classic"),
  accent_color: z.string().optional().default("#3B82F6"),
  public: z.boolean().optional().default(false),
  text_overrides: z
    .object({
      elements: z.record(z.record(z.any())).optional().default({}),
      sections: z.record(z.record(z.any())).optional().default({}),
    })
    .optional()
    .default({ elements: {}, sections: {} }),
});

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));

const normalizeEmail = (email) => email.trim().toLowerCase();

const sanitizeUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
});

const readActiveSubscription = async (userId) => {
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

const createSession = async (res, userId) => {
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

  setSessionCookie(res, rawToken);
};

const readUserFromSession = async (req) => {
  const token = getSessionTokenFromRequest(req);
  if (!token) {
    return null;
  }

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

const mapResumeRowToDto = (row) => {
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

const requireAuth = (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
};

const appendQuery = (baseUrl, params) => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

app.use(async (req, _res, next) => {
  try {
    req.user = await readUserFromSession(req);
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/auth/me", async (req, res) => {
  if (!req.user) {
    res.status(401).json({ authenticated: false });
    return;
  }

  const billing = await readActiveSubscription(req.user.id);
  res.json({
    authenticated: true,
    user: sanitizeUser(req.user),
    billing,
  });
});

app.post("/api/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    return;
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = normalizeEmail(email);

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    normalizedEmail,
  ]);

  if (existing.rowCount > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const created = await pool.query(
    `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email
    `,
    [name.trim(), normalizedEmail, passwordHash]
  );

  const user = created.rows[0];
  await createSession(res, user.id);

  const billing = await readActiveSubscription(user.id);
  res.status(201).json({ user: sanitizeUser(user), billing });
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const normalizedEmail = normalizeEmail(email);

  const result = await pool.query(
    "SELECT id, name, email, password FROM users WHERE email = $1",
    [normalizedEmail]
  );

  const user = result.rows[0];
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  await createSession(res, user.id);
  const billing = await readActiveSubscription(user.id);
  res.json({ user: sanitizeUser(user), billing });
});

app.post("/api/auth/logout", async (req, res) => {
  const token = getSessionTokenFromRequest(req);
  if (token) {
    const tokenHash = hashSessionToken(token);
    await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
  }

  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/pricing", async (req, res) => {
  const country = getCountryFromRequest(req, req.query.country);
  const payload = await listPricingPlans({ country });
  res.json(payload);
});

app.get("/api/subscription/me", async (req, res) => {
  if (!requireAuth(req, res)) return;
  const billing = await readActiveSubscription(req.user.id);
  res.json({ billing });
});

app.post("/api/payments/checkout", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid checkout payload", details: parsed.error.flatten() });
    return;
  }

  const { provider, successUrl, cancelUrl } = parsed.data;
  const planName = normalizePlanName(parsed.data.planName);
  const country = getCountryFromRequest(req, parsed.data.country);
  const availableProviders = getProvidersByCountry(country);
  if (!availableProviders.includes(provider)) {
    res.status(400).json({ error: "Selected payment provider is unavailable for this region" });
    return;
  }

  const plan = await getPlanByName(planName);
  if (!plan) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }

  const currency = getCurrencyByCountry(country);
  const amount = await localizePrice(Number(plan.price), currency);

  const payment = await createPendingPayment({
    userId: req.user.id,
    planName: plan.name,
    provider,
    amount,
    currency,
    metadata: {
      country,
      successUrl,
      cancelUrl,
    },
  });

  let providerPayload;

  if (provider === "yookassa") {
    const yookassaReturnUrl = appendQuery(successUrl, { paymentId: payment.id });
    providerPayload = await createYooKassaCheckout({
      payment,
      plan,
      currency,
      amount,
      successUrl: yookassaReturnUrl,
    });
  }

  if (provider === "cardlink") {
    providerPayload = await createCardlinkCheckout({
      payment,
      plan,
      currency,
      amount,
    });
  }

  res.status(201).json({
    paymentId: payment.id,
    provider,
    country,
    currency,
    amount,
    ...providerPayload,
  });
});

app.get("/api/payments/:paymentId", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const payment = await getPaymentById(req.params.paymentId, req.user.id);
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  res.json({
    payment: {
      id: payment.id,
      planName: payment.plan_name,
      provider: payment.provider,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      metadata: payment.metadata,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    },
  });
});

app.post("/api/payments/:paymentId/sync", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const payment = await getPaymentById(req.params.paymentId, req.user.id);
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  await syncPaymentStatus(payment);
  const refreshed = await getPaymentById(req.params.paymentId, req.user.id);

  res.json({
    payment: {
      id: refreshed.id,
      planName: refreshed.plan_name,
      provider: refreshed.provider,
      amount: Number(refreshed.amount),
      currency: refreshed.currency,
      status: refreshed.status,
      metadata: refreshed.metadata,
      createdAt: refreshed.created_at,
      updatedAt: refreshed.updated_at,
    },
  });
});

app.all("/api/payments/cardlink/success", async (req, res) => {
  const payload = { ...(req.query || {}), ...(req.body || {}) };
  const clientBaseUrl = process.env.CLIENT_BASE_URL || "http://localhost:5173";
  const paymentId = String(payload.InvId || payload.custom || "");
  let status = "success";

  try {
    const signatureCheck = verifyCardlinkNotification(payload);
    if (!signatureCheck.valid) {
      status = "invalid_signature";
    } else if (paymentId) {
      await markPaymentAsSucceeded({
        paymentId,
        providerPaymentId: String(payload.TrsId || ""),
        rawMetadata: { cardlinkReturnPayload: payload },
      });
    }
  } catch {
    status = "error";
  }

  const redirectTo = appendQuery(`${clientBaseUrl}/app/payment/success`, {
    paymentId,
    status,
  });
  res.redirect(303, redirectTo);
});

app.all("/api/payments/cardlink/fail", async (req, res) => {
  const payload = { ...(req.query || {}), ...(req.body || {}) };
  const clientBaseUrl = process.env.CLIENT_BASE_URL || "http://localhost:5173";
  const paymentId = String(payload.InvId || payload.custom || "");
  if (paymentId) {
    await markPaymentAsFailed({
      paymentId,
      providerPaymentId: String(payload.TrsId || ""),
      rawMetadata: { cardlinkReturnPayload: payload },
    });
  }

  const redirectTo = appendQuery(`${clientBaseUrl}/app/payment/success`, {
    paymentId,
    status: "failed",
  });
  res.redirect(303, redirectTo);
});

app.post("/api/webhooks/yookassa", async (req, res) => {
  const event = req.body;
  const paymentObject = event?.object;
  const paymentId = paymentObject?.metadata?.paymentId;

  if (!paymentId) {
    res.status(200).json({ received: true });
    return;
  }

  if (paymentObject?.status === "succeeded") {
    await markPaymentAsSucceeded({
      paymentId,
      providerPaymentId: paymentObject.id,
      rawMetadata: {
        yookassaEvent: event?.event,
        yookassaStatus: paymentObject?.status,
      },
    });
  }

  if (paymentObject?.status === "canceled") {
    await markPaymentAsFailed({
      paymentId,
      providerPaymentId: paymentObject.id,
      rawMetadata: {
        yookassaEvent: event?.event,
        yookassaStatus: paymentObject?.status,
      },
    });
  }

  res.status(200).json({ received: true });
});

app.post("/api/webhooks/cardlink", async (req, res) => {
  const payload = req.body || {};
  const signatureCheck = verifyCardlinkNotification(payload);
  if (!signatureCheck.valid) {
    res.status(403).send("INVALID_SIGNATURE");
    return;
  }

  const paymentId = String(payload.InvId || payload.custom || "");
  if (!paymentId) {
    res.status(400).send("MISSING_PAYMENT_ID");
    return;
  }

  const status = String(payload.Status || "").toUpperCase();
  const isSuccess = status === "SUCCESS";

  if (isSuccess) {
    await markPaymentAsSucceeded({
      paymentId,
      providerPaymentId: String(payload.TrsId || payload.id || ""),
      rawMetadata: {
        cardlinkPayload: payload,
      },
    });
  } else {
    await markPaymentAsFailed({
      paymentId,
      providerPaymentId: String(payload.TrsId || payload.id || ""),
      rawMetadata: {
        cardlinkPayload: payload,
      },
    });
  }

  res.status(200).send("OK");
});

app.get("/api/resumes", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const result = await pool.query(
    `
      SELECT id, full_description, user_id, is_public, created_at, updated_at
      FROM resumes
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `,
    [req.user.id]
  );

  res.json({ resumes: result.rows.map(mapResumeRowToDto) });
});

app.get("/api/resumes/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    `
      SELECT id, full_description, user_id, is_public, created_at, updated_at
      FROM resumes
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  const row = result.rows[0];
  if (!row) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  const isOwner = req.user?.id === row.user_id;
  if (!row.is_public && !isOwner) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  res.json({ resume: mapResumeRowToDto(row) });
});

app.post("/api/resumes", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const parsed = resumeSchema.safeParse(req.body?.resume);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid resume payload", details: parsed.error.flatten() });
    return;
  }

  const resume = parsed.data;
  const created = await pool.query(
    `
      INSERT INTO resumes (full_description, user_id, is_public)
      VALUES ($1, $2, $3)
      RETURNING id, full_description, user_id, is_public, created_at, updated_at
    `,
    [JSON.stringify(resume), req.user.id, resume.public]
  );

  res.status(201).json({ resume: mapResumeRowToDto(created.rows[0]) });
});

app.put("/api/resumes/:id", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const { id } = req.params;
  const parsed = resumeSchema.safeParse(req.body?.resume);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid resume payload", details: parsed.error.flatten() });
    return;
  }

  const updated = await pool.query(
    `
      UPDATE resumes
      SET full_description = $1,
          is_public = $2,
          updated_at = NOW()
      WHERE id = $3 AND user_id = $4
      RETURNING id, full_description, user_id, is_public, created_at, updated_at
    `,
    [JSON.stringify(parsed.data), parsed.data.public, id, req.user.id]
  );

  if (updated.rowCount === 0) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  res.json({ resume: mapResumeRowToDto(updated.rows[0]) });
});

app.delete("/api/resumes/:id", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const deleted = await pool.query(
    "DELETE FROM resumes WHERE id = $1 AND user_id = $2",
    [req.params.id, req.user.id]
  );

  if (deleted.rowCount === 0) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  res.status(204).end();
});

app.post("/api/analyze-resume", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const { resumeData, resumeText, jobDescription, fullReport = false } = req.body ?? {};
  if (!resumeData || typeof resumeData !== "object") {
    res.status(400).json({ error: "resumeData is required" });
    return;
  }

  if (fullReport) {
    const creditResult = await consumeAnalysisCredit(req.user.id, 1);
    if (!creditResult.allowed) {
      res.status(402).json({
        error:
          creditResult.reason === "insufficient_tokens"
            ? "No credits left"
            : "Active subscription required",
      });
      return;
    }
  }

  try {
    const feedback = await analyzeResume({
      resumeData,
      resumeText: typeof resumeText === "string" ? resumeText : "",
      jobDescription: typeof jobDescription === "string" ? jobDescription : "",
      env: process.env,
    });
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to analyze resume",
    });
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

if (isProd) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  const vite = await createViteServer({
    configFile: path.resolve(clientRoot, "vite.config.ts"),
    root: clientRoot,
    server: {
      middlewareMode: true,
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
