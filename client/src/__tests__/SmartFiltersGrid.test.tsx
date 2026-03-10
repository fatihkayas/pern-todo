import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SmartFiltersGrid from "../components/landing/SmartFiltersGrid";
import { LanguageProvider } from "../context/LanguageContext";
import type { Watch } from "../types";

const mockWatch: Watch = {
  watch_id: 1,
  watch_name: "Seiko 5 Sports",
  brand: "Seiko",
  price: "299.99",
  image_url: "https://example.com/watch.jpg",
  stock_quantity: 10,
  description: "A reliable sports watch",
};

const defaultProps = {
  products: [mockWatch] as Watch[],
  addToCart: jest.fn(),
  search: "",
  onSearchChange: jest.fn(),
  activeFilter: "all",
  onFilterChange: jest.fn(),
};

const renderGrid = (props: Partial<typeof defaultProps> = {}) =>
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SmartFiltersGrid {...defaultProps} {...props} />
      </LanguageProvider>
    </MemoryRouter>
  );

describe("SmartFiltersGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // ─── Rendering ────────────────────────────────────────────────────────────────

  it("renders the product name and price", () => {
    renderGrid();
    expect(screen.getByText("Seiko 5 Sports")).toBeInTheDocument();
    expect(screen.getByText("$299.99")).toBeInTheDocument();
  });

  it("renders the product brand badge", () => {
    renderGrid();
    expect(screen.getByText("Seiko")).toBeInTheDocument();
  });

  it("renders the product description", () => {
    renderGrid();
    expect(screen.getByText("A reliable sports watch")).toBeInTheDocument();
  });

  it("shows the item count", () => {
    renderGrid();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows empty-results message when products list is empty", () => {
    renderGrid({ products: [] });
    expect(
      screen.getByText("No watches found for your current filters.")
    ).toBeInTheDocument();
  });

  it("renders all 6 filter buttons plus the All button", () => {
    renderGrid();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Automatic")).toBeInTheDocument();
    expect(screen.getByText("Quartz")).toBeInTheDocument();
    expect(screen.getByText("Steel Strap")).toBeInTheDocument();
    expect(screen.getByText("Leather Strap")).toBeInTheDocument();
    expect(screen.getByText("Black Dial")).toBeInTheDocument();
    expect(screen.getByText("Blue Dial")).toBeInTheDocument();
  });

  // ─── Interactions ─────────────────────────────────────────────────────────────

  it("calls addToCart with the watch when Add to Cart is clicked", () => {
    const addToCart = jest.fn();
    renderGrid({ addToCart });
    userEvent.click(screen.getByText("Add to Cart"));
    expect(addToCart).toHaveBeenCalledWith(mockWatch);
  });

  it("calls onFilterChange with the filter value when a filter button is clicked", () => {
    const onFilterChange = jest.fn();
    renderGrid({ onFilterChange });
    userEvent.click(screen.getByText("Automatic"));
    expect(onFilterChange).toHaveBeenCalledWith("automatic");
  });

  it("calls onFilterChange with 'all' when All button is clicked", () => {
    const onFilterChange = jest.fn();
    renderGrid({ onFilterChange, activeFilter: "automatic" });
    userEvent.click(screen.getByText("All"));
    expect(onFilterChange).toHaveBeenCalledWith("all");
  });

  it("calls onSearchChange when typing in the search input", () => {
    const onSearchChange = jest.fn();
    renderGrid({ onSearchChange });
    userEvent.type(screen.getByPlaceholderText("Search by model or brand..."), "s");
    expect(onSearchChange).toHaveBeenCalled();
  });

  // ─── German translations ───────────────────────────────────────────────────────

  it("shows German empty-results message when language is de", () => {
    localStorage.setItem("language", "de");
    renderGrid({ products: [] });
    expect(
      screen.getByText("Keine Uhren für die aktuellen Filter gefunden.")
    ).toBeInTheDocument();
  });

  it("shows 'In den Warenkorb' button text in German", () => {
    localStorage.setItem("language", "de");
    renderGrid();
    expect(screen.getByText("In den Warenkorb")).toBeInTheDocument();
  });

  it("shows German search placeholder in German", () => {
    localStorage.setItem("language", "de");
    renderGrid();
    expect(
      screen.getByPlaceholderText("Nach Modell oder Marke suchen...")
    ).toBeInTheDocument();
  });
});
