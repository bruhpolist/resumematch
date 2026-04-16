import { CheckCircle2, CreditCard, Globe2, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import { apiFetch } from "../lib/api";

type Provider = "cardlink" | "yookassa";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  usdPrice: number;
  localizedPrice: number;
  currency: "RUB" | "BYN";
  tokenCount: number | null;
  billingPeriod: "monthly" | "yearly";
  isUnlimited: boolean;
}

interface PricingResponse {
  country: string;
  currency: "RUB" | "BYN";
  providers: Provider[];
  plans: PricingPlan[];
}

const currencySymbols: Record<string, string> = {
  RUB: "?",
  BYN: "Br",
};

const providerLabels: Record<Provider, string> = {
  cardlink: "Cardlink",
  yookassa: "YooKassa",
};

export default function Subscription() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { billing, refreshSession } = useAppContext();

  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string>("");

  useEffect(() => {
    const loadPricing = async () => {
      try {
        setLoading(true);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await apiFetch<PricingResponse>("/api/pricing", {
          method: "GET",
          headers: {
            "x-timezone": timezone,
          },
        });

        setPricing(response);
        setActiveProvider(response.providers[0]);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : t("subscription.loadError")
        );
      } finally {
        setLoading(false);
      }
    };

    loadPricing();
  }, [t]);

  const formatPrice = (plan: PricingPlan) => {
    const symbol = currencySymbols[plan.currency] || plan.currency;
    return `${symbol}${plan.localizedPrice.toFixed(2)}`;
  };

  const sortedPlans = useMemo(() => {
    if (!pricing) return [];
    const weight: Record<string, number> = { start: 1, pro: 2, business: 3 };
    return [...pricing.plans].sort((a, b) => weight[a.name] - weight[b.name]);
  }, [pricing]);

  const startCheckout = async (planName: string) => {
    if (!activeProvider || !pricing) return;

    try {
      setError("");
      setPendingPlan(planName);

      const response = await apiFetch<{
        paymentId: string;
        provider: Provider;
        checkoutUrl?: string | null;
      }>("/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({
          planName,
          provider: activeProvider,
          country: pricing.country,
          successUrl: `${window.location.origin}/app/payment/success`,
          cancelUrl: `${window.location.origin}/app/payment/success?status=cancel`,
        }),
      });

      if (response.checkoutUrl) {
        window.sessionStorage.setItem("last_payment_id", response.paymentId);
        window.location.href = response.checkoutUrl;
        return;
      }

      setError(t("subscription.checkoutUnavailable"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("subscription.paymentFailed"));
    } finally {
      setPendingPlan("");
      await refreshSession();
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center text-slate-600">
        {t("subscription.loading")}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900">{t("subscription.title")}</h1>
        <p className="mt-2 text-slate-600">{t("subscription.subtitle")}</p>

        <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
          <ShieldCheck className="size-4 text-emerald-500" />
          {t("subscription.current")}: <span className="font-semibold">{billing.plan}</span>
          <span className="text-slate-300">|</span>
          {t("nav.credits")}: <span className="font-semibold">{billing.isUnlimited ? "unlimited" : billing.tokenCount || 0}</span>
          {billing.expiresAt && (
            <>
              <span className="text-slate-300">|</span>
              {t("subscription.active")}: <span className="font-semibold">{new Date(billing.expiresAt).toLocaleDateString()}</span>
            </>
          )}
        </div>

        {!!pricing?.providers.length && (
          <div className="mt-5 inline-flex items-center rounded-full border border-slate-200 bg-white p-1">
            {pricing.providers.map((provider) => (
              <button
                key={provider}
                onClick={() => setActiveProvider(provider)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  activeProvider === provider
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {providerLabels[provider]}
              </button>
            ))}
          </div>
        )}

        {pricing && (
          <p className="mt-3 text-sm text-slate-500 inline-flex items-center gap-1">
            <Globe2 className="size-4" />
            {t("subscription.region")}: {pricing.country}, {t("subscription.currency")}: {pricing.currency}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {sortedPlans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 uppercase">
              <CreditCard className="size-4" />
              {plan.name}
            </div>
            <div className="mt-5">
              <p className="text-4xl font-bold text-slate-900">{formatPrice(plan)}</p>
              <p className="text-sm text-slate-500">
                {plan.billingPeriod === "yearly" ? t("subscription.yearly") : t("subscription.monthly")}
              </p>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              <li className="inline-flex gap-2 items-start">
                <CheckCircle2 className="size-4 mt-0.5 text-emerald-500" />
                <span>{plan.description}</span>
              </li>
              <li className="inline-flex gap-2 items-start">
                <CheckCircle2 className="size-4 mt-0.5 text-emerald-500" />
                <span>
                  {plan.isUnlimited
                    ? t("subscription.unlimited")
                    : `${t("subscription.features.credits")}: +${plan.tokenCount || 0}`}
                </span>
              </li>
            </ul>
            <button
              onClick={() => startCheckout(plan.name)}
              disabled={!activeProvider || pendingPlan === plan.name}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white hover:opacity-95 disabled:opacity-70 inline-flex justify-center items-center gap-2"
            >
              {pendingPlan === plan.name && <Loader2 className="size-4 animate-spin" />}
              {t("subscription.buy")}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button onClick={() => navigate("/app")} className="text-sm text-slate-500 hover:text-slate-700">
          {t("subscription.backDashboard")}
        </button>
      </div>
    </div>
  );
}
