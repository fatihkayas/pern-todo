import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Customer } from "../types";

interface LoginProps {
  onLogin: (customer: Customer) => void;
}

interface LoginForm {
  email: string;
  password: string;
}

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("token", data.token);
      localStorage.setItem("customer", JSON.stringify(data.customer));
      onLogin(data.customer);
      toast.success(`Hoş geldin, ${data.customer.full_name}! 👋`);
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 80 }}>
      <div className="card shadow-sm border-0 rounded-4 p-4">
        <h3 className="text-center fw-bold mb-1">⌚ Giriş Yap</h3>
        <p className="text-center text-muted small mb-4">Hesabınıza giriş yapın</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control rounded-pill"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-control rounded-pill"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-dark w-100 rounded-pill" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="text-center mt-3 small">
          Hesabınız yok mu?{" "}
          <Link to="/register" className="text-primary">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
