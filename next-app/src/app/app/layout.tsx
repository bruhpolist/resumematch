"use client";

import Navbar from "@/components/Navbar";
import RequireAuth from "@/components/RequireAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <RequireAuth>{children}</RequireAuth>
    </div>
  );
}
