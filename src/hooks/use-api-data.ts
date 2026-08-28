"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  debounceMs?: number;
}

export function useApiData<T>(
  url: string | null,
  options: Options = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loadingState, setLoadingState] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async (target: string) => {
    try {
      const res = await fetch(target);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Request failed");
        setData(null);
        return;
      }
      const json = (await res.json()) as T;
      setData(json);
      setError(null);
    } catch {
      setError("Network error");
      setData(null);
    } finally {
      setLoadingState(false);
    }
  }, []);

  useEffect(() => {
    if (!url) return;

    const run = (target: string) =>
      Promise.resolve()
        .then(() => setLoadingState(true))
        .then(() => fetch(target))
        .then((res) =>
          res.ok
            ? (res.json() as Promise<T>)
            : res
                .json()
                .catch(() => null)
                .then((body: { error?: string } | null) => {
                  throw new Error(body?.error ?? "Request failed");
                })
        )
        .then((json: T) => {
          setData(json);
          setError(null);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Network error");
          setData(null);
        })
        .finally(() => setLoadingState(false));

    const debounceMs = options.debounceMs ?? 0;
    if (debounceMs > 0) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void run(url);
      }, debounceMs);
      return () => {
        if (timer.current) clearTimeout(timer.current);
      };
    }

    void run(url);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [url, options.debounceMs]);

  const loading = url ? loadingState : false;

  return { data, loading, error, refresh };
}

export async function postJson<T>(
  url: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Request failed" }))) as {
      error?: string;
    };
    throw new Error(err.error ?? "Request failed");
  }
  return (await res.json()) as T;
}

export async function deleteRequest<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Request failed" }))) as {
      error?: string;
    };
    throw new Error(err.error ?? "Request failed");
  }
  return (await res.json()) as T;
}