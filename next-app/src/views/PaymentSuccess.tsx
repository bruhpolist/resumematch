import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../lib/api";
import { useAppContext } from "../contexts/AppContext";

type PaymentStatus = "idle" | "loading" | "success" | "pending" | "failed";

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshSession } = useAppContext();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState("");

  const initialPaymentId = useMemo(() => {
    const queryId = searchParams.get("paymentId");
    if (queryId) return queryId;
    return window.sessionStorage.getItem("last_payment_id");
  }, [searchParams]);

  useEffect(() => {
    const syncPayment = async () => {
      if (!initialPaymentId) {
        setPaymentStatus("pending");
        return;
      }

      setPaymentStatus("loading");
      setError("");

      try {
        const response = await apiFetch<{
          payment: {
            id: string;
            status: string;
          };
        }>(`/api/payments/${initialPaymentId}/sync`, {
          method: "POST",
        });

        const status = String(response.payment.status || "").toLowerCase();
        if (status === "succeeded") {
          setPaymentStatus("success");
          await refreshSession();
          window.sessionStorage.removeItem("last_payment_id");
          return;
        }

        if (status === "failed") {
          setPaymentStatus("failed");
          return;
        }

        setPaymentStatus("pending");
      } catch (requestError) {
        setPaymentStatus("pending");
        setError(requestError instanceof Error ? requestError.message : t("payment.success.error"));
      }
    };

    syncPayment();
  }, [initialPaymentId, refreshSession, t]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {paymentStatus === "loading" && (
          <div className="inline-flex items-center gap-2 text-slate-600">
            <Loader2 className="size-5 animate-spin" /> {t("payment.success.checking")}
          </div>
        )}

        {paymentStatus === "success" && (
          <>
            <CheckCircle2 className="size-16 text-emerald-500 mx-auto" />
            <h1 className="mt-4 text-3xl font-bold text-slate-900">{t("payment.success.title")}</h1>
            <p className="mt-3 text-slate-600">{t("payment.success.subtitle")}</p>
          </>
        )}

        {(paymentStatus === "pending" || paymentStatus === "idle") && (
          <>
            <Loader2 className="size-16 text-amber-500 mx-auto animate-spin" />
            <h1 className="mt-4 text-3xl font-bold text-slate-900">{t("payment.success.pendingTitle")}</h1>
            <p className="mt-3 text-slate-600">{t("payment.success.pendingSubtitle")}</p>
          </>
        )}

        {paymentStatus === "failed" && (
          <>
            <XCircle className="size-16 text-rose-500 mx-auto" />
            <h1 className="mt-4 text-3xl font-bold text-slate-900">{t("payment.success.failedTitle")}</h1>
            <p className="mt-3 text-slate-600">{t("payment.success.failedSubtitle")}</p>
          </>
        )}

        {!!error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate("/app?create=1")}
            className="rounded-full bg-cyan-600 px-6 py-2.5 text-white font-semibold hover:bg-cyan-700"
          >
            {t("payment.success.goCreate")}
          </button>
          <Link
            to="/app/subscription"
            className="rounded-full border border-slate-300 px-6 py-2.5 text-slate-700 font-semibold hover:bg-slate-50"
          >
            {t("payment.success.backPlans")}
          </Link>
        </div>
      </div>
    </div>
  );
}