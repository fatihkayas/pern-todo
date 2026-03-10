import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CartSidebar from "../components/CartSidebar";
import toast from "react-hot-toast";
import type { CartItem } from "../types";

jest.mock("react-hot-toast", () => ({ error: jest.fn() }));

const mockItem: CartItem = {
  watch_id: 1,
  watch_name: "Seiko 5 Sports",
  brand: "Seiko",
  price: "299.99",
  image_url: "https://example.com/watch.jpg",
  stock_quantity: 10,
  quantity: 2,
};

const defaultProps = {
  cart: [] as CartItem[],
  isOpen: true,
  onClose: jest.fn(),
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
  onOrderSuccess: jest.fn(),
};

const renderCart = (props: Partial<typeof defaultProps> = {}) =>
  render(
    <MemoryRouter>
      <CartSidebar {...defaultProps} {...props} />
    </MemoryRouter>
  );

describe("CartSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // ─── Empty state ──────────────────────────────────────────────────────────────

  it("shows empty cart message when cart is empty", () => {
    renderCart();
    expect(screen.getByText("Sepetiniz boş")).toBeInTheDocument();
  });

  it("hides checkout button when cart is empty", () => {
    renderCart();
    expect(screen.queryByText("Proceed to Checkout →")).not.toBeInTheDocument();
  });

  // ─── Populated cart ───────────────────────────────────────────────────────────

  it("renders item name and unit price", () => {
    renderCart({ cart: [mockItem] });
    expect(screen.getByText("Seiko 5 Sports")).toBeInTheDocument();
    expect(screen.getByText("$299.99")).toBeInTheDocument();
  });

  it("shows correct total (line-item + summary both show 2×299.99 = $599.98)", () => {
    renderCart({ cart: [mockItem] });
    // $599.98 appears once as the line-item subtotal and once in the Toplam summary
    expect(screen.getAllByText("$599.98").length).toBe(2);
  });

  it("shows Proceed to Checkout button when cart has items", () => {
    renderCart({ cart: [mockItem] });
    expect(screen.getByText("Proceed to Checkout →")).toBeInTheDocument();
  });

  // ─── Interactions ─────────────────────────────────────────────────────────────

  it("calls removeFromCart with the correct watch_id", () => {
    const removeFromCart = jest.fn();
    renderCart({ cart: [mockItem], removeFromCart });
    userEvent.click(screen.getByText("Sil"));
    expect(removeFromCart).toHaveBeenCalledWith(1);
  });

  it("calls updateQuantity +1 when + is clicked", () => {
    const updateQuantity = jest.fn();
    renderCart({ cart: [mockItem], updateQuantity });
    userEvent.click(screen.getByText("+"));
    expect(updateQuantity).toHaveBeenCalledWith(1, 3);
  });

  it("calls updateQuantity -1 when − is clicked", () => {
    const updateQuantity = jest.fn();
    renderCart({ cart: [mockItem], updateQuantity });
    userEvent.click(screen.getByText("−"));
    expect(updateQuantity).toHaveBeenCalledWith(1, 1);
  });

  it("calls onClose when × button is clicked", () => {
    const onClose = jest.fn();
    renderCart({ onClose });
    userEvent.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalled();
  });

  // ─── Checkout: no token ───────────────────────────────────────────────────────

  it("shows toast.error when checkout without a token", () => {
    renderCart({ cart: [mockItem] });
    userEvent.click(screen.getByText("Proceed to Checkout →"));
    expect(toast.error).toHaveBeenCalledWith("Please login to checkout");
  });

  // ─── Checkout: with token ─────────────────────────────────────────────────────

  it("calls onClose when checkout is clicked with a valid token", () => {
    localStorage.setItem("token", "fake-jwt-token");
    const onClose = jest.fn();
    renderCart({ cart: [mockItem], onClose });
    userEvent.click(screen.getByText("Proceed to Checkout →"));
    expect(onClose).toHaveBeenCalled();
  });

  it("does not call toast.error when token is present", () => {
    localStorage.setItem("token", "fake-jwt-token");
    renderCart({ cart: [mockItem] });
    userEvent.click(screen.getByText("Proceed to Checkout →"));
    expect(toast.error).not.toHaveBeenCalled();
  });
});
