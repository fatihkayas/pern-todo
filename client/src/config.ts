const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const defaultApiBaseUrl =
  typeof window !== "undefined"
    ? isLocalhost
      ? "http://localhost:5001"
      : window.location.origin
    : "http://localhost:5001";

const rawApiBaseUrl = process.env.REACT_APP_API_URL || defaultApiBaseUrl;

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

