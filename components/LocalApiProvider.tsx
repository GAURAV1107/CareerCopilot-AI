"use client";

import { useLayoutEffect } from "react";
import { isLocalApi, localApiFetch } from "@/lib/local-api";

export function LocalApiProvider({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
      return isLocalApi(url) && !url.startsWith("/api/llm/") && !url.startsWith("/api/local/") ? localApiFetch(input, init) : nativeFetch(input, init);
    };
    return () => { window.fetch = nativeFetch; };
  }, []);
  return children;
}
