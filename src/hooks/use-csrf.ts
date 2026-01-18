"use client";

import { useEffect, useState } from "react";

function getCsrfToken(tenantId: string): string | null {
  if (typeof document === "undefined") return null;
  
  const cookieName = `tenant_${tenantId}_csrf`;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === cookieName) {
      return value;
    }
  }
  return null;
}

export function useCsrf(tenantId: string) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    const token = getCsrfToken(tenantId);
    setCsrfToken(token);
  }, [tenantId]);

  const fetchWithCsrf = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (csrfToken) {
      headers.set("x-csrf-token", csrfToken);
    }
    
    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  return { csrfToken, fetchWithCsrf };
}
