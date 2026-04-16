"use client";

import "@/i18n";
import { AppProvider } from "@/contexts/AppContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
