import { NextResponse } from "next/server";
import { getCountryFromRequest, listPricingPlans } from "@/server/billing.mjs";

export const runtime = "nodejs";

export async function GET(request) {
  const country = getCountryFromRequest(
    {
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      ip: request.ip,
      socket: { remoteAddress: request.ip },
    },
    request.nextUrl.searchParams.get("country")
  );

  const payload = await listPricingPlans({ country });
  return NextResponse.json(payload);
}
