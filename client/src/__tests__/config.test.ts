import { apiUrl, API_BASE_URL } from "../config";

describe("API_BASE_URL", () => {
  it("has no trailing slash", () => {
    expect(API_BASE_URL).not.toMatch(/\/$/);
  });
});

describe("apiUrl", () => {
  it("builds a URL from a path with a leading slash", () => {
    expect(apiUrl("/api/v1/watches")).toBe(`${API_BASE_URL}/api/v1/watches`);
  });

  it("adds a leading slash when path has none", () => {
    expect(apiUrl("api/v1/watches")).toBe(`${API_BASE_URL}/api/v1/watches`);
  });

  it("does not double the slash", () => {
    const url = apiUrl("/api/v1/orders");
    expect(url).not.toContain("//api");
  });

  it("works for nested paths", () => {
    expect(apiUrl("/api/v1/chat/run-123")).toBe(`${API_BASE_URL}/api/v1/chat/run-123`);
  });
});
