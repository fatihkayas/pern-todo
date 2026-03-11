const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const DEFAULT_API_BASE_URL = isLocalhost
  ? "http://localhost:5001"
  : "https://seiko-backend.ashyground-a8f00237.westeurope.azurecontainerapps.io";

const rawApiBaseUrl = process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL;

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
