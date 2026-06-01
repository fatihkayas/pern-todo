import { useState } from "react";

interface PromoBannerProps {
  message: string;
  code?: string;
  onDismiss?: () => void;
}

const PromoBanner = ({ message, code, onDismiss }: PromoBannerProps) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      style={{
        background: "var(--brand-anthracite)",
        color: "#f8f7f5",
        fontSize: "0.8rem",
        letterSpacing: "0.08em",
        fontFamily: "'Jost', sans-serif",
        fontWeight: 400,
      }}
      className="w-100 py-2 px-3 d-flex align-items-center justify-content-center gap-3 position-relative"
    >
      <span>{message}</span>
      {code && (
        <span
          style={{
            border: "0.5px solid var(--brand-gold)",
            color: "var(--brand-gold)",
            padding: "1px 10px",
            letterSpacing: "0.12em",
            fontWeight: 500,
          }}
        >
          {code}
        </span>
      )}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          right: "1rem",
          background: "none",
          border: "none",
          color: "#aaa",
          cursor: "pointer",
          fontSize: "1rem",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
};

export default PromoBanner;
