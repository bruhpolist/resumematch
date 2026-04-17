"use client";

import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/contexts/AppContext";
import { apiFetch } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
  description: string;
  localizedPrice: number;
  currency: string;
  billingPeriod: "monthly" | "yearly";
  tokenCount: number | null;
  isUnlimited: boolean;
}

interface PricingResponse {
  plans: Plan[];
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  RUB: "?",
  BYN: "Br",
};

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAppContext();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await apiFetch<PricingResponse>("/api/pricing", {
          method: "GET",
          headers: {
            "x-timezone": timezone,
          },
        });

        setPlans(response.plans);
      } catch {
        setPlans([]);
      }
    };

    loadPricing();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ecfeff,_#ffffff_45%,_#fff7ed)]">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 pt-16 pb-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-1 text-sm text-cyan-700">
              <Sparkles className="size-4" /> {t("home.badge")}
            </p>
            <h1 className="mt-6 text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
              {t("home.title")}
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">{t("home.subtitle")}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={isAuthenticated ? "/app" : "/login?mode=register"}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-6 py-3 font-semibold text-white shadow-[0_18px_40px_-22px_rgba(8,145,178,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-[0_24px_50px_-24px_rgba(8,145,178,0.75)]"
              >
                {t("home.ctaPrimary")} <ArrowRight className="size-4" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-6 py-3 font-semibold text-slate-700 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:shadow-[0_22px_40px_-24px_rgba(15,23,42,0.38)]"
              >
                {t("home.ctaSecondary")}
              </a>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-4 text-sm">
              {["home.metric1", "home.metric2", "home.metric3"].map((metricKey) => (
                <div key={metricKey} className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_26px_45px_-28px_rgba(14,165,233,0.28)]">
                  <p className="font-semibold text-slate-900">{t(`${metricKey}.value`)}</p>
                  <p className="text-slate-500 mt-1">{t(`${metricKey}.label`)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_70px_-38px_rgba(15,23,42,0.35)]">
            <img src="/images/resume-scan-2.gif" alt="AI resume analysis" className="rounded-2xl w-full" />
            <div className="mt-5 space-y-3">
              {["home.feature1", "home.feature2", "home.feature3"].map((key) => (
                <p key={key} className="inline-flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="size-4 text-emerald-500" /> {t(key)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-7xl mx-auto px-4 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-3xl font-bold text-slate-900">{t("home.pricingTitle")}</h2>
          <p className="text-slate-600 mt-2">{t("home.pricingSubtitle")}</p>

          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div key={plan.id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-200 hover:shadow-[0_30px_60px_-30px_rgba(8,145,178,0.28)]">
                <p className="uppercase text-xs font-semibold text-cyan-700">{plan.name}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-cyan-700">
                  {(currencySymbols[plan.currency] || plan.currency) + plan.localizedPrice.toFixed(2)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {plan.billingPeriod === "yearly" ? t("subscription.yearly") : t("subscription.monthly")}
                </p>
                <p className="text-sm text-slate-600 mt-4">{plan.description}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-sm text-slate-700 transition-colors duration-300 group-hover:text-slate-900">
                  <WalletCards className="size-4" />
                  {plan.isUnlimited
                    ? t("subscription.unlimited")
                    : `${t("subscription.features.credits")}: ${plan.tokenCount || 0}`}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 px-5 py-4 text-white">
            <p className="inline-flex items-center gap-2 text-sm sm:text-base">
              <ShieldCheck className="size-4" /> {t("home.paymentSafe")}
            </p>
            <Link
              href={isAuthenticated ? "/app/subscription" : "/login?mode=register"}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-[0_16px_34px_-24px_rgba(255,255,255,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
            >
              {t("home.pricingCta")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
