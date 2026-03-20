import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Customer } from "../types";
import { apiUrl } from "../config";

interface LoginProps {
  onLogin: (customer: Customer) => void;
}

interface LoginForm {
  email: string;
  password: string;
}

const googleAuthUrl = process.env.REACT_APP_GOOGLE_AUTH_URL || apiUrl("/api/v1/auth/google");

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0b0b0b",
    color: "#ffffff",
    padding: "120px 16px 48px",
  },
  shell: {
    maxWidth: 460,
    margin: "0 auto",
  },
  card: {
    background: "#141414",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 22px 44px rgba(0,0,0,0.28)",
  },
  kicker: {
    color: "#c19a6b",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.08,
    fontWeight: 900,
  },
  subtitle: {
    margin: "12px 0 0",
    color: "rgba(255,255,255,0.66)",
    lineHeight: 1.75,
  },
  googleButton: {
    width: "100%",
    minHeight: 56,
    marginTop: 24,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#ffffff",
    color: "#141414",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    cursor: "pointer",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "18px 0",
  },
  dividerLine: {
    height: 1,
    flex: 1,
    background: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.56)",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: "0.12em",
  },
  guestLink: {
    display: "inline-flex",
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#ffffff",
    fontWeight: 800,
    textDecoration: "none",
  },
  form: {
    display: "grid",
    gap: 16,
    marginTop: 20,
  },
  label: {
    display: "grid",
    gap: 8,
    fontSize: 14,
    fontWeight: 700,
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#1b1b1b",
    color: "#ffffff",
    padding: "0 16px",
    outline: "none",
  },
  submit: {
    width: "100%",
    minHeight: 56,
    borderRadius: 18,
    border: "none",
    background: "#f2c94c",
    color: "#111111",
    fontWeight: 900,
    cursor: "pointer",
    marginTop: 6,
  },
  footer: {
    marginTop: 18,
    textAlign: "center",
    color: "rgba(255,255,255,0.66)",
  },
  footerLink: {
    color: "#c19a6b",
    textDecoration: "none",
    fontWeight: 700,
  },
};

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/v1/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("token", data.token);
      localStorage.setItem("customer", JSON.stringify(data.customer));
      onLogin(data.customer);
      toast.success(`Willkommen zurück, ${data.customer.full_name}!`);
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${googleAuthUrl}?returnTo=${encodeURIComponent("/")}`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.card}>
          <div style={styles.kicker}>Ranch Kebab Zugang</div>
          <h1 style={styles.title}>Mit Konto einloggen oder direkt als Gast bestellen.</h1>
          <p style={styles.subtitle}>
            Google Login bleibt optional. Für deine Bestellung brauchst du kein Konto.
          </p>

          <button type="button" style={styles.googleButton} onClick={handleGoogle}>
            <GoogleIcon />
            <span>Mit Google anmelden</span>
          </button>

          <div style={styles.dividerRow}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>oder</span>
            <div style={styles.dividerLine} />
          </div>

          <Link to="/checkout" style={styles.guestLink}>
            Ohne Konto bestellen
          </Link>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              <span>E-Mail</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={styles.input}
                required
              />
            </label>

            <label style={styles.label}>
              <span>Passwort</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={styles.input}
                required
              />
            </label>

            <button type="submit" style={styles.submit} disabled={loading}>
              {loading ? "Anmeldung läuft..." : "Anmelden"}
            </button>
          </form>

          <div style={styles.footer}>
            Noch kein Konto?{" "}
            <Link to="/register" style={styles.footerLink}>
              Registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.5-5.4 3.5-3.2 0-5.8-2.6-5.8-5.8S8.8 6 12 6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.7 3.7 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.7-3.7 8.7-8.9 0-.6-.1-1.1-.2-1.6H12z" />
      <path fill="#34A853" d="M3 7.6l3.2 2.3C7 8 9.3 6 12 6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.7 3.7 14.6 3 12 3 8.1 3 4.7 5.2 3 7.6z" />
      <path fill="#FBBC05" d="M12 21c2.5 0 4.6-.8 6.2-2.3l-2.9-2.4c-.8.6-1.9 1.1-3.3 1.1-3.9 0-5.1-2.3-5.4-3.4l-3.2 2.5C5 18.8 8.2 21 12 21z" />
      <path fill="#4285F4" d="M3 16.5l3.2-2.5c-.2-.5-.3-1-.3-1.6s.1-1.1.3-1.6L3 8.2C2.4 9.4 2 10.7 2 12s.4 2.6 1 4.5z" />
    </svg>
  );
}

export default Login;
