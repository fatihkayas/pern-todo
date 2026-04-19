import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Customer } from "../types";
import { apiUrl } from "../config";
import { clearAuthData, storeAuthSession } from "../utils/auth";

interface LoginProps {
  onLogin: (customer: Customer) => void;
}

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  refreshToken?: string;
  customer?: Customer;
  error?: string;
}

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const updateField =
    (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/v1/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as LoginResponse;

      if (!res.ok || !data.token || !data.customer) {
        clearAuthData();
        throw new Error(data.error || "Unable to sign in with those credentials.");
      }

      storeAuthSession({
        token: data.token,
        refreshToken: data.refreshToken,
        customer: data.customer,
      });
      onLogin(data.customer);
      toast.success(`Welcome back, ${data.customer.full_name}!`);
      navigate("/");
    } catch (err) {
      clearAuthData();
      toast.error((err as Error).message || "Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 80 }}>
      <div className="card shadow-sm border-0 rounded-4 p-4">
        <h3 className="text-center fw-bold mb-1">Login</h3>
        <p className="text-center text-muted small mb-4">Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control rounded-pill"
              placeholder="email@example.com"
              value={form.email}
              onChange={updateField("email")}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control rounded-pill"
              placeholder="********"
              value={form.password}
              onChange={updateField("password")}
              required
            />
          </div>
          <button type="submit" className="btn btn-dark w-100 rounded-pill" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-3 small">
          Need an account?{" "}
          <Link to="/register" className="text-primary">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
