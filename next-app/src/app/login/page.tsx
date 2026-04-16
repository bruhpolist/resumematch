import { Suspense } from "react";
import Login from "@/views/Login";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 text-slate-600">Loading...</div>}>
      <Login />
    </Suspense>
  );
}
