"use client";

import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import type { AuthContextValue } from "@/lib/auth/auth-context";

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
