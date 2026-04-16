"use client";

/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";

type PlanType = "free" | "start" | "pro" | "business";

interface User {
  id: string;
  email: string;
  name: string;
}

interface BillingState {
  plan: PlanType;
  tokenCount: number | null;
  expiresAt?: string | null;
  hasActiveSubscription: boolean;
  canAccessPremiumTemplates: boolean;
  canViewFullAnalysis: boolean;
  isUnlimited: boolean;
}

interface AppContextValue {
  user: User | null;
  billing: BillingState;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  hasActiveSubscription: boolean;
  canAccessPremiumTemplates: boolean;
  canViewFullAnalysis: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; name: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const defaultBilling: BillingState = {
  plan: "free",
  tokenCount: 0,
  expiresAt: null,
  hasActiveSubscription: false,
  canAccessPremiumTemplates: false,
  canViewFullAnalysis: false,
  isUnlimited: false,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const mapBilling = (billing?: Partial<BillingState>): BillingState => ({
  plan: (billing?.plan as PlanType) || "free",
  tokenCount: billing?.tokenCount ?? 0,
  expiresAt: billing?.expiresAt ?? null,
  hasActiveSubscription: Boolean(billing?.hasActiveSubscription),
  canAccessPremiumTemplates: Boolean(billing?.canAccessPremiumTemplates),
  canViewFullAnalysis: Boolean(billing?.canViewFullAnalysis),
  isUnlimited: Boolean(billing?.isUnlimited),
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [billing, setBilling] = useState<BillingState>(defaultBilling);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const refreshSession = async () => {
    try {
      const response = await apiFetch<{
        authenticated: boolean;
        user?: User;
        billing?: Partial<BillingState>;
      }>("/api/auth/me", {
        method: "GET",
      });

      if (response.authenticated && response.user) {
        setUser(response.user);
        setBilling(mapBilling(response.billing));
      } else {
        setUser(null);
        setBilling(defaultBilling);
      }
    } catch {
      setUser(null);
      setBilling(defaultBilling);
    } finally {
      setIsBootstrapping(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const value: AppContextValue = useMemo(
    () => ({
      user,
      billing,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      hasActiveSubscription: billing.hasActiveSubscription,
      canAccessPremiumTemplates: billing.canAccessPremiumTemplates,
      canViewFullAnalysis: billing.canViewFullAnalysis,
      login: async ({ email, password }) => {
        const response = await apiFetch<{ user: User; billing: Partial<BillingState> }>(
          "/api/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          }
        );

        setUser(response.user);
        setBilling(mapBilling(response.billing));
      },
      register: async ({ email, name, password }) => {
        const response = await apiFetch<{ user: User; billing: Partial<BillingState> }>(
          "/api/auth/register",
          {
            method: "POST",
            body: JSON.stringify({ email, name, password }),
          }
        );

        setUser(response.user);
        setBilling(mapBilling(response.billing));
      },
      logout: async () => {
        await apiFetch<{ ok: boolean }>("/api/auth/logout", {
          method: "POST",
        });

        setUser(null);
        setBilling(defaultBilling);
      },
      refreshSession,
    }),
    [user, billing, isBootstrapping]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
};
