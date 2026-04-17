"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/contexts/AppContext";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, billing, isAuthenticated } = useAppContext();

  const navLinkClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full transition-all ${
      active
        ? "bg-slate-900 text-white shadow-[0_10px_25px_-18px_rgba(15,23,42,0.7)]"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  const switchLanguage = (lang: "en" | "ru") => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="shadow bg-white/95 backdrop-blur border-b border-slate-200">
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-900 transition-all">
        <Link href={isAuthenticated ? "/app" : "/"}>
          <img src="/logo.svg" alt="logo" className="h-11 w-auto" />
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link href="/" className={navLinkClass(pathname === "/")}>
            {t("nav.home")}
          </Link>

          {isAuthenticated && (
            <>
              <Link href="/app" className={navLinkClass(pathname === "/app")}>
                {t("nav.dashboard")}
              </Link>
              <Link href="/app/templates" className={navLinkClass(pathname === "/app/templates")}>
                {t("nav.templates")}
              </Link>
              <Link href="/app/process" className={navLinkClass(pathname === "/app/process")}>
                {t("nav.process")}
              </Link>
              <Link href="/app/subscription" className={navLinkClass(pathname === "/app/subscription")}>
                {t("nav.subscription")}
              </Link>
            </>
          )}

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1">
            <span className="text-slate-500">{t("nav.credits")}:</span>
            <span className="font-semibold">{billing.isUnlimited ? "unlimited" : billing.tokenCount || 0}</span>
          </div>

          <div className="flex items-center rounded-full border border-slate-200 p-1">
            <button
              className={`px-2 py-0.5 rounded-full ${i18n.language.startsWith("en") ? "bg-slate-900 text-white" : ""}`}
              onClick={() => switchLanguage("en")}
            >
              EN
            </button>
            <button
              className={`px-2 py-0.5 rounded-full ${i18n.language.startsWith("ru") ? "bg-slate-900 text-white" : ""}`}
              onClick={() => switchLanguage("ru")}
            >
              RU
            </button>
          </div>

          {isAuthenticated ? (
            <>
              <p className="max-sm:hidden">{user?.name}</p>
              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="bg-white hover:bg-slate-50 border border-gray-300 px-5 py-1.5 rounded-full active:scale-95 transition-all"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="bg-slate-900 text-white px-5 py-1.5 rounded-full"
            >
              {t("nav.login")}
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
