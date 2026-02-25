import { NextResponse } from "next/server";

export async function GET() {
  const strapiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.STRAPI_URL;
  const dailyApiKey = process.env.DAILY_API_KEY;
  let backendOk = false;
  let dailyQuota: Record<string, unknown> | null = null;

  // Check backend health
  if (strapiUrl) {
    try {
      const res = await fetch(`${strapiUrl}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      backendOk = res.ok;
    } catch {
      backendOk = false;
    }
  }

  // Check Daily.co quota/usage
  if (dailyApiKey) {
    try {
      const res = await fetch("https://api.daily.co/v1/", {
        headers: { Authorization: `Bearer ${dailyApiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        dailyQuota = {
          domainName: data.domain_name,
          apiCreated: data.api_created,
        };
      }
    } catch {
      // Daily API unreachable
    }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      frontend: "ok",
      backend: backendOk ? "ok" : "unreachable",
      dailyApiKey: dailyApiKey ? "configured" : "missing",
      dailyApi: dailyQuota ? "ok" : "unreachable",
    },
    daily: dailyQuota,
  });
}
