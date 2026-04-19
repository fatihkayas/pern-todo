import { apiUrl } from "../config";
import { Customer } from "../types";

interface AuthResponse {
  token: string;
  refreshToken?: string;
  customer?: Customer;
}

const LOGIN_PATH = "/login";

let refreshPromise: Promise<string> | null = null;

export const getAccessToken = () => localStorage.getItem("token");

export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const getStoredCustomer = (): Customer | null => {
  const saved = localStorage.getItem("customer");
  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as Customer;
  } catch {
    localStorage.removeItem("customer");
    return null;
  }
};

export const clearAuthData = (redirectToLogin = false) => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("customer");

  if (
    redirectToLogin &&
    typeof window !== "undefined" &&
    window.location.pathname !== LOGIN_PATH
  ) {
    window.location.assign(LOGIN_PATH);
  }
};

export const storeAuthSession = ({ token, refreshToken, customer }: AuthResponse) => {
  localStorage.setItem("token", token);

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  } else {
    localStorage.removeItem("refreshToken");
  }

  if (customer) {
    localStorage.setItem("customer", JSON.stringify(customer));
  } else {
    localStorage.removeItem("customer");
  }
};

const runRefreshRequest = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthData(true);
    throw new Error("Your session has expired. Please sign in again.");
  }

  const res = await fetch(apiUrl("/api/v1/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = (await res.json()) as Partial<AuthResponse> & { error?: string };

  if (!res.ok || !data.token) {
    clearAuthData(true);
    throw new Error(data.error || "Your session has expired. Please sign in again.");
  }

  storeAuthSession({
    token: data.token,
    refreshToken: data.refreshToken ?? refreshToken,
    customer: data.customer ?? getStoredCustomer() ?? undefined,
  });

  return data.token;
};

export const refreshAccessTokenLocked = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = runRefreshRequest().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const createAuthHeaders = (headers?: HeadersInit, tokenOverride?: string) => {
  const nextHeaders = new Headers(headers);
  const token = tokenOverride ?? getAccessToken();

  if (token) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  } else {
    nextHeaders.delete("Authorization");
  }

  return nextHeaders;
};

export const fetchWithAuth = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const runRequest = (tokenOverride?: string) =>
    fetch(input, {
      ...init,
      headers: createAuthHeaders(init?.headers, tokenOverride),
    });

  let response = await runRequest();

  if (response.status !== 401) {
    return response;
  }

  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    clearAuthData(true);
    throw new Error("Your session has expired. Please sign in again.");
  }

  const nextToken = await refreshAccessTokenLocked();
  response = await runRequest(nextToken);

  if (response.status === 401) {
    clearAuthData(true);
    throw new Error("Your session has expired. Please sign in again.");
  }

  return response;
};
