import { NextRequest, NextResponse } from "next/server";
import { getStrapiURL } from "@/lib/api/api-config";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(getStrapiURL("/api/auth/send-otp"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
