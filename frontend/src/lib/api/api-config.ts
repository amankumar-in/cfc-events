// src/lib/api/api-config.ts

/**
 * API Configuration for connecting to Strapi backend
 */

// Define the environment-specific API URL
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

// Helper function to build complete API URLs
export const getStrapiURL = (path = "") => {
  return `${API_URL}${path}`;
};

// Function to get API response with error handling
export async function fetchAPI(path: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers as Record<string, string>,
      ...(options.headers as Record<string, string>),
    },
  };

  const requestUrl = getStrapiURL(`/api${path}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(requestUrl, {
      ...mergedOptions,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        "API response not OK:",
        response.status,
        response.statusText
      );
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching API:", requestUrl, error);
    throw error;
  }
}

// Authenticated fetch - injects JWT from localStorage
export async function fetchAPIWithAuth(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetchAPI(path, { ...options, headers });
}
