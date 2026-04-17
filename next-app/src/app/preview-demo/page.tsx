import { Suspense } from "react";
import PreviewDemoClient from "@/views/PreviewDemoClient";

export const dynamic = "force-dynamic";

export default function PreviewDemoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PreviewDemoClient />
    </Suspense>
  );
}
