import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Customer } from "../types";

interface GoogleAuthCallbackProps {
  onLogin: (customer: Customer) => void;
}

const GoogleAuthCallback: React.FC<GoogleAuthCallbackProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    const error = searchParams.get("error");
    const token = searchParams.get("token");
    const customerParam = searchParams.get("customer");
    const returnTo = searchParams.get("returnTo") || "/";

    if (error) {
      toast.error(getGoogleErrorMessage(error));
      navigate("/login", { replace: true });
      return;
    }

    if (!token || !customerParam) {
      toast.error("Google Anmeldung konnte nicht abgeschlossen werden.");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const customer = JSON.parse(customerParam) as Customer;
      localStorage.setItem("token", token);
      localStorage.setItem("customer", JSON.stringify(customer));
      onLogin(customer);
      toast.success(`Willkommen, ${customer.full_name}!`);
      navigate(returnTo, { replace: true });
    } catch {
      toast.error("Google Anmeldung konnte nicht verarbeitet werden.");
      navigate("/login", { replace: true });
    }
  }, [navigate, onLogin, searchParams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#F5EFE6",
        color: "#2A1F18",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#FFFFFF",
          border: "1px solid #E5D6C2",
          borderRadius: 24,
          padding: 24,
          textAlign: "center",
          boxShadow: "0 18px 38px rgba(42,31,24,0.10)",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 900 }}>Google Anmeldung</div>
        <p style={{ margin: "12px 0 0", color: "#6B5B4D", lineHeight: 1.7 }}>
          Dein Login wird abgeschlossen. Einen kurzen Moment bitte.
        </p>
      </div>
    </div>
  );
};

function getGoogleErrorMessage(error: string) {
  switch (error) {
    case "google_not_configured":
      return "Google Login ist noch nicht konfiguriert.";
    case "access_denied":
      return "Google Anmeldung wurde abgebrochen.";
    default:
      return "Google Anmeldung ist fehlgeschlagen.";
  }
}

export default GoogleAuthCallback;
