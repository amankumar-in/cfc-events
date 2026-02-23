import { fetchAPI } from "./api-config";

export async function sendOtp(email: string) {
  return fetchAPI("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, code: string) {
  return fetchAPI("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function getMe(token: string) {
  return fetchAPI("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
