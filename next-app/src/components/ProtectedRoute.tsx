"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactElement } from "react";
import { useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";

export default function ProtectedRoute({
  children,
}: {
  children: ReactElement;
}) {
  const { isAuthenticated, isBootstrapping } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      const qs = searchParams.toString();
      const next = encodeURIComponent(qs ? `${pathname}?${qs}` : pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [isAuthenticated, isBootstrapping, pathname, router, searchParams]);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
