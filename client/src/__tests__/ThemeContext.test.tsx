import React from "react";
import { renderHook, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.removeAttribute("data-bs-theme");
    document.body.style.backgroundColor = "";
  });

  it("defaults to light mode when localStorage is empty", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    expect(result.current.isDark).toBe(false);
  });

  it("reads dark mode from localStorage on mount", () => {
    localStorage.setItem("theme", "dark");
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    expect(result.current.isDark).toBe(true);
  });

  it("toggle switches isDark from false to true", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    act(() => result.current.toggle());
    expect(result.current.isDark).toBe(true);
  });

  it("toggle switches isDark back to false on second call", () => {
    localStorage.setItem("theme", "dark");
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    act(() => result.current.toggle());
    expect(result.current.isDark).toBe(false);
  });

  it("persists theme to localStorage after toggle", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    act(() => result.current.toggle());
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("sets data-bs-theme attribute on document.body", () => {
    localStorage.setItem("theme", "dark");
    renderHook(() => useTheme(), { wrapper: ThemeProvider });
    expect(document.body.getAttribute("data-bs-theme")).toBe("dark");
  });

  it("throws when used outside ThemeProvider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within ThemeProvider"
    );
    (console.error as jest.Mock).mockRestore();
  });
});
