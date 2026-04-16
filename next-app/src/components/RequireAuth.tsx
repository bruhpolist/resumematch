"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/app")}`);
    }
  }, [isAuthenticated, isBootstrapping, pathname, router]);

  if (isBootstrapping) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-slate-600">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
