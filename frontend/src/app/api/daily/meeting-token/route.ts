import { NextRequest, NextResponse } from "next/server";
import { getStrapiURL } from "@/lib/api/api-config";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const authHeader = request.headers.get("authorization");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const res = await fetch(getStrapiURL("/api/daily/meeting-token"), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
