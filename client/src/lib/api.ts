import type { SnapshotResponse } from "@/types/snapshot";

function resolveApiBaseUrl() {
  const raw = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  if (!raw) {
    if (typeof window !== "undefined") {
      const { hostname, port } = window.location;
      if (
        (hostname === "localhost" || hostname === "127.0.0.1") &&
        (port === "8080" || port === "5173")
      ) {
        return "http://localhost:5001";
      }
      return window.location.origin;
    }
    return "http://localhost:5001";
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

const API_BASE_URL = resolveApiBaseUrl();

export async function fetchSnapshot(params?: {
  date?: string;
  country?: string;
  region?: string;
}): Promise<SnapshotResponse> {
  const url = new URL("/api/snapshot", API_BASE_URL);

  if (params?.date) url.searchParams.set("date", params.date);
  if (params?.country) url.searchParams.set("country", params.country);
  if (params?.region) url.searchParams.set("region", params.region);

  const response = await fetch(url.toString());
  let payload: SnapshotResponse | { error?: string } | null = null;

  try {
    payload = await response.json();
  } catch (err) {
    payload = null;
  }

  if (!response.ok || !payload || !("ok" in payload) || !payload.ok) {
    const message =
      payload && "error" in payload && payload.error
        ? payload.error
        : `Failed to fetch snapshot (status ${response.status})`;
    throw new Error(message);
  }

  return payload;
}
