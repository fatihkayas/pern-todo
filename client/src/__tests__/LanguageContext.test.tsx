import React from "react";
import { renderHook, act } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "../context/LanguageContext";

describe("LanguageContext", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to en when localStorage is empty", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(result.current.language).toBe("en");
  });

  it("reads de from localStorage on mount", () => {
    localStorage.setItem("language", "de");
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(result.current.language).toBe("de");
  });

  it("defaults to en for an unrecognised localStorage value", () => {
    localStorage.setItem("language", "fr");
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(result.current.language).toBe("en");
  });

  it("setLanguage updates the language state", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    act(() => result.current.setLanguage("de"));
    expect(result.current.language).toBe("de");
  });

  it("setLanguage persists the value to localStorage", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    act(() => result.current.setLanguage("de"));
    expect(localStorage.getItem("language")).toBe("de");
  });

  it("setLanguage can switch back to en", () => {
    localStorage.setItem("language", "de");
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    act(() => result.current.setLanguage("en"));
    expect(result.current.language).toBe("en");
    expect(localStorage.getItem("language")).toBe("en");
  });

  it("throws when used outside LanguageProvider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useLanguage())).toThrow(
      "useLanguage must be used within LanguageProvider"
    );
    (console.error as jest.Mock).mockRestore();
  });
});
