import crypto from "node:crypto";
import { pool } from "./db.mjs";

const COUNTRY_TO_CURRENCY = {
  RU: "RUB",
  BY: "BYN",
};

const FALLBACK_RATES = {
  RUB: 92,
  BYN: 3.25,
};

const rateCache = {
  fetchedAt: 0,
  rates: { ...FALLBACK_RATES },
};

const ONE_HOUR_MS = 60 * 60 * 1000;

export const normalizePlanName = (planName) => String(planName || "").trim().toLowerCase();

export const getCountryFromRequest = (req, explicitCountry) => {
  const directCountry = String(explicitCountry || "").trim().toUpperCase();
  if (directCountry.length === 2) {
    return directCountry;
  }

  const headerCandidates = [
    req.headers["x-vercel-ip-country"],
    req.headers["cf-ipcountry"],
    req.headers["x-country-code"],
    req.headers["cloudfront-viewer-country"],
  ];

  for (const candidate of headerCandidates) {
    const value = String(candidate || "").trim().toUpperCase();
    if (value.length === 2) return value;
  }

  const timezone = String(req.headers["x-timezone"] || "").toLowerCase();
  if (timezone.includes("minsk")) return "BY";
  if (timezone.includes("moscow")) return "RU";

  const acceptLanguage = String(req.headers["accept-language"] || "").toLowerCase();
  if (acceptLanguage.includes("ru-ru")) return "RU";

  return "BY";
};

export const getCurrencyByCountry = (country) => COUNTRY_TO_CURRENCY[country] || "BYN";

export const getProvidersByCountry = (country) => {
  if (country === "RU") {
    return ["cardlink", "yookassa"];
  }

  if (country === "BY") {
    return ["cardlink"];
  }

  return ["cardlink"];
};

const loadRates = async () => {
  if (Date.now() - rateCache.fetchedAt < ONE_HOUR_MS) {
    return rateCache.rates;
  }

  try {
    const response = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=RUB,BYN"
    );

    if (!response.ok) {
      throw new Error(`Rate API returned ${response.status}`);
    }

    const payload = await response.json();
    if (!payload?.rates) {
      throw new Error("Rate API payload missing rates field");
    }

    rateCache.rates = {
      RUB: Number(payload.rates.RUB) || FALLBACK_RATES.RUB,
      BYN: Number(payload.rates.BYN) || FALLBACK_RATES.BYN,
    };
    rateCache.fetchedAt = Date.now();
    return rateCache.rates;
  } catch {
    return rateCache.rates;
  }
};

export const localizePrice = async (usdPrice, currency) => {
  const amount = Number(usdPrice);
  if (!Number.isFinite(amount)) return 0;

  if (currency === "USD") {
    return Number(amount.toFixed(2));
  }

  const rates = await loadRates();
  const rate = rates[currency] ?? 1;
  return Number((amount * rate).toFixed(2));
};

export const getPlanByName = async (planName) => {
  const normalized = normalizePlanName(planName);
  const result = await pool.query(
    `
      SELECT id, name, description, price, token_count, billing_period, is_unlimited
      FROM pricing
      WHERE name = $1
      LIMIT 1
    `,
    [normalized]
  );

  return result.rows[0] ?? null;
};

export const listPricingPlans = async ({ country }) => {
  const currency = getCurrencyByCountry(country);
  const result = await pool.query(
    `
      SELECT id, name, description, price, token_count, billing_period, is_unlimited
      FROM pricing
      ORDER BY CASE name
        WHEN 'start' THEN 1
        WHEN 'pro' THEN 2
        WHEN 'business' THEN 3
        ELSE 100 END
    `
  );

  const plans = await Promise.all(
    result.rows.map(async (plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      usdPrice: Number(plan.price),
      localizedPrice: await localizePrice(Number(plan.price), currency),
      currency,
      tokenCount: plan.token_count,
      billingPeriod: plan.billing_period,
      isUnlimited: plan.is_unlimited,
    }))
  );

  return {
    country,
    currency,
    providers: getProvidersByCountry(country),
    plans,
  };
};

export const createPendingPayment = async ({ userId, planName, provider, amount, currency, metadata }) => {
  const created = await pool.query(
    `
      INSERT INTO payments (user_id, plan_name, provider, amount, currency, status, metadata)
      VALUES ($1, $2, $3, $4, $5, 'pending', $6)
      RETURNING id, user_id, plan_name, provider, amount, currency, status, metadata, provider_payment_id
    `,
    [userId, planName, provider, amount, currency, JSON.stringify(metadata || {})]
  );

  return created.rows[0];
};

export const updateProviderPaymentId = async ({ paymentId, providerPaymentId }) => {
  await pool.query(
    `
      UPDATE payments
      SET provider_payment_id = $1,
          updated_at = NOW()
      WHERE id = $2
    `,
    [providerPaymentId, paymentId]
  );
};

const upsertSubscriptionFromPayment = async (paymentRow) => {
  const plan = await getPlanByName(paymentRow.plan_name);
  if (!plan) {
    throw new Error(`Plan ${paymentRow.plan_name} not found`);
  }

  const metadata = paymentRow.metadata && typeof paymentRow.metadata === "object"
    ? paymentRow.metadata
    : {};

  if (metadata.subscriptionId) {
    return metadata.subscriptionId;
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  if (plan.billing_period === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  await pool.query(
    `
      UPDATE subscriptions
      SET status = 'expired', updated_at = NOW()
      WHERE user_id = $1
        AND status = 'active'
    `,
    [paymentRow.user_id]
  );

  const insertedSubscription = await pool.query(
    `
      INSERT INTO subscriptions (
        user_id,
        subscription_plan,
        token_count,
        start_date,
        end_date,
        is_unlimited,
        status,
        payment_provider,
        payment_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8)
      RETURNING id
    `,
    [
      paymentRow.user_id,
      plan.name,
      plan.is_unlimited ? null : plan.token_count,
      startDate.toISOString(),
      endDate.toISOString(),
      plan.is_unlimited,
      paymentRow.provider,
      paymentRow.id,
    ]
  );

  const subscriptionId = insertedSubscription.rows[0].id;

  await pool.query(
    `
      UPDATE payments
      SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb,
          updated_at = NOW()
      WHERE id = $2
    `,
    [JSON.stringify({ subscriptionId }), paymentRow.id]
  );

  return subscriptionId;
};

export const markPaymentAsSucceeded = async ({ paymentId, providerPaymentId, rawMetadata }) => {
  const updated = await pool.query(
    `
      UPDATE payments
      SET status = 'succeeded',
          provider_payment_id = COALESCE($1, provider_payment_id),
          metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, user_id, plan_name, provider, provider_payment_id, metadata
    `,
    [providerPaymentId || null, JSON.stringify(rawMetadata || {}), paymentId]
  );

  const payment = updated.rows[0];
  if (!payment) {
    return null;
  }

  await upsertSubscriptionFromPayment(payment);
  return payment;
};

export const markPaymentAsFailed = async ({ paymentId, providerPaymentId, rawMetadata }) => {
  await pool.query(
    `
      UPDATE payments
      SET status = 'failed',
          provider_payment_id = COALESCE($1, provider_payment_id),
          metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
          updated_at = NOW()
      WHERE id = $3
    `,
    [providerPaymentId || null, JSON.stringify(rawMetadata || {}), paymentId]
  );
};

export const getPaymentById = async (paymentId, userId) => {
  const result = await pool.query(
    `
      SELECT id, user_id, plan_name, provider, provider_payment_id, amount, currency, status, metadata, created_at, updated_at
      FROM payments
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
    [paymentId, userId]
  );

  return result.rows[0] ?? null;
};

export const consumeAnalysisCredit = async (userId, amount = 1) => {
  const subscriptionResult = await pool.query(
    `
      SELECT id, token_count, is_unlimited
      FROM subscriptions
      WHERE user_id = $1
        AND status = 'active'
        AND end_date > NOW()
      ORDER BY end_date DESC
      LIMIT 1
    `,
    [userId]
  );

  const subscription = subscriptionResult.rows[0];
  if (!subscription) {
    return { allowed: false, reason: "no_active_subscription" };
  }

  if (subscription.is_unlimited) {
    return { allowed: true, reason: "unlimited" };
  }

  const tokenCount = Number(subscription.token_count ?? 0);
  if (tokenCount < amount) {
    return { allowed: false, reason: "insufficient_tokens" };
  }

  await pool.query(
    `
      UPDATE subscriptions
      SET token_count = token_count - $1,
          updated_at = NOW()
      WHERE id = $2
    `,
    [amount, subscription.id]
  );

  return { allowed: true, reason: "consumed" };
};

export const createYooKassaCheckout = async ({ payment, plan, currency, amount, successUrl }) => {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    throw new Error("YooKassa is not configured");
  }

  if (currency !== "RUB") {
    throw new Error("YooKassa checkout currently supports RUB only in this setup");
  }

  const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
  const idempotenceKey = crypto.randomUUID();

  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      "Idempotence-Key": idempotenceKey,
    },
    body: JSON.stringify({
      amount: {
        value: amount.toFixed(2),
        currency,
      },
      confirmation: {
        type: "redirect",
        return_url: successUrl,
      },
      capture: true,
      description: `AI Resume Builder ${plan.name}`,
      metadata: {
        paymentId: payment.id,
        userId: payment.user_id,
        planName: plan.name,
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.description || "YooKassa request failed");
  }

  await updateProviderPaymentId({ paymentId: payment.id, providerPaymentId: payload.id });

  return {
    providerPaymentId: payload.id,
    checkoutUrl: payload.confirmation?.confirmation_url,
  };
};

export const createCardlinkCheckout = async ({ payment, plan, currency, amount }) => {
  const apiToken = process.env.CARDLINK_API_TOKEN;
  const shopId = process.env.CARDLINK_SHOP_ID;
  const apiUrl = process.env.CARDLINK_API_URL || "https://cardlink.link/api/v1/bill/create";

  if (!apiToken || !shopId) {
    throw new Error("Cardlink is not configured");
  }

  const form = new URLSearchParams();
  form.append("amount", String(amount));
  form.append("order_id", payment.id);
  form.append("description", `AI Resume Builder ${plan.name}`);
  form.append("type", "normal");
  form.append("shop_id", shopId);
  form.append("currency_in", currency);
  form.append("custom", payment.id);
  form.append("payer_pays_commission", "1");
  form.append("name", `${plan.name} subscription`);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const responseBody = await response.json();
  if (!response.ok || responseBody?.success === false) {
    throw new Error(responseBody?.message || responseBody?.error || "Cardlink request failed");
  }

  const billId = String(responseBody.id || responseBody.bill_id || "");
  const checkoutUrl = responseBody.link_page_url || responseBody.url;

  await updateProviderPaymentId({
    paymentId: payment.id,
    providerPaymentId: billId,
  });

  return {
    providerPaymentId: billId,
    checkoutUrl,
  };
};

export const verifyCardlinkNotification = (payload) => {
  const apiToken = process.env.CARDLINK_API_TOKEN;
  if (!apiToken) {
    throw new Error("Cardlink API token is missing");
  }

  const outSum = String(payload.OutSum || "");
  const invId = String(payload.InvId || "");
  const signatureRaw = `${outSum}:${invId}:${apiToken}`;
  const expectedSignature = crypto
    .createHash("md5")
    .update(signatureRaw, "utf-8")
    .digest("hex")
    .toUpperCase();
  const actualSignature = String(payload.SignatureValue || "").toUpperCase();

  return {
    valid: expectedSignature === actualSignature,
    expectedSignature,
    actualSignature,
  };
};

export const syncPaymentStatus = async (payment) => {
  if (!payment?.id || !payment?.provider) {
    return { status: "unknown" };
  }

  if (payment.provider === "cardlink") {
    const apiToken = process.env.CARDLINK_API_TOKEN;
    if (!apiToken || !payment.provider_payment_id) {
      return { status: payment.status || "pending" };
    }

    const statusUrl = `https://cardlink.link/api/v1/bill/status?id=${encodeURIComponent(
      payment.provider_payment_id
    )}`;
    const response = await fetch(statusUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const payload = await response.json();
    if (!response.ok || payload?.success === false) {
      return { status: payment.status || "pending", payload };
    }

    const billStatus = String(payload.status || "").toUpperCase();
    if (billStatus === "SUCCESS" || billStatus === "OVERPAID") {
      await markPaymentAsSucceeded({
        paymentId: payment.id,
        providerPaymentId: payment.provider_payment_id,
        rawMetadata: { cardlinkStatus: billStatus },
      });
      return { status: "succeeded", payload };
    }

    if (billStatus === "FAIL") {
      await markPaymentAsFailed({
        paymentId: payment.id,
        providerPaymentId: payment.provider_payment_id,
        rawMetadata: { cardlinkStatus: billStatus },
      });
      return { status: "failed", payload };
    }

    return { status: "pending", payload };
  }

  if (payment.provider === "yookassa") {
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    if (!shopId || !secretKey || !payment.provider_payment_id) {
      return { status: payment.status || "pending" };
    }

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
    const response = await fetch(
      `https://api.yookassa.ru/v3/payments/${encodeURIComponent(
        payment.provider_payment_id
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const payload = await response.json();
    if (!response.ok) {
      return { status: payment.status || "pending", payload };
    }

    const remoteStatus = String(payload?.status || "").toLowerCase();
    if (remoteStatus === "succeeded") {
      await markPaymentAsSucceeded({
        paymentId: payment.id,
        providerPaymentId: payment.provider_payment_id,
        rawMetadata: { yookassaStatus: remoteStatus },
      });
      return { status: "succeeded", payload };
    }

    if (remoteStatus === "canceled") {
      await markPaymentAsFailed({
        paymentId: payment.id,
        providerPaymentId: payment.provider_payment_id,
        rawMetadata: { yookassaStatus: remoteStatus },
      });
      return { status: "failed", payload };
    }

    return { status: "pending", payload };
  }

  return { status: payment.status || "pending" };
};
