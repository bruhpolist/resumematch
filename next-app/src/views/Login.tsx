"use client";

import { Lock, Mail, User2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/contexts/AppContext";

export default function Login() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, register } = useAppContext();

  const [mode, setMode] = useState<"login" | "register">(
    searchParams?.get("mode") === "register" ? "register" : "login"
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nextParam = searchParams?.get("next");

  const title = useMemo(
    () => (mode === "login" ? t("login.title.login") : t("login.title.register")),
    [mode, t]
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register({
          email: formData.email,
          name: formData.name,
          password: formData.password,
        });
      }

      router.push(nextParam ? decodeURIComponent(nextParam) : "/app");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("login.genericError")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-amber-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="sm:w-[420px] w-full text-center border border-slate-200 rounded-2xl px-8 bg-white shadow-xl"
      >
        <h1 className="text-slate-900 text-3xl mt-10 font-semibold">{title}</h1>
        <p className="text-slate-500 text-sm mt-2">
          {t("login.subtitle", {
            state: title,
          })}
        </p>

        {mode !== "login" && (
          <div className="flex items-center mt-6 w-full bg-white border border-slate-300 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <User2Icon size={16} color="#334155" />
            <input
              type="text"
              name="name"
              placeholder={t("login.name")}
              className="border-none outline-none ring-0 w-full"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="flex items-center w-full mt-4 bg-white border border-slate-300 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <Mail size={13} color="#334155" />
          <input
            type="email"
            name="email"
            placeholder={t("login.email")}
            className="border-none outline-none ring-0 w-full"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex items-center mt-4 w-full bg-white border border-slate-300 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <Lock size={13} color="#334155" />
          <input
            type="password"
            name="password"
            placeholder={t("login.password")}
            className="border-none outline-none ring-0 w-full"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          type="submit"
          className="mt-6 w-full h-11 rounded-full text-white bg-cyan-600 hover:opacity-90 transition-opacity disabled:opacity-70"
        >
          {loading ? t("login.loading") : mode === "login" ? t("login.submit.login") : t("login.submit.register")}
        </button>
        <p
          onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
          className="text-slate-500 text-sm mt-3 mb-8 cursor-pointer"
        >
          {mode === "login" ? t("login.toggle.login") : t("login.toggle.register")}{" "}
          <span className="text-cyan-600 hover:underline">{t("login.toggle.link")}</span>
        </p>

        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mb-10 inline-block">
          {t("login.backHome")}
        </Link>
      </form>
    </div>
  );
}
