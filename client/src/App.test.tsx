import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the store page without crashing", () => {
  render(<App />);
  expect(screen.getByRole("navigation")).toBeInTheDocument();
});
