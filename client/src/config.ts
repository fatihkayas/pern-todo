const DEFAULT_API_BASE_URL = "https://seiko-backend-e3b5xeopra-ew.a.run.app";

const rawApiBaseUrl = process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL;

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
