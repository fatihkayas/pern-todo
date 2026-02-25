import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Customer } from "../types";

interface RegisterProps {
  onLogin: (customer: Customer) => void;
}

interface RegisterForm {
  email: string;
  full_name: string;
  password: string;
  password2: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

const Register = ({ onLogin }: RegisterProps) => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    email: "", full_name: "", password: "", password2: "",
    phone: "", address: "", city: "", country: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("token", data.token);
      localStorage.setItem("customer", JSON.stringify(data.customer));
      onLogin(data.customer);
      toast.success(`Hoş geldin, ${data.customer.full_name}! 🎉`);
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="container" style={{ maxWidth: 480, marginTop: 60, marginBottom: 60 }}>
      <div className="card shadow-sm border-0 rounded-4 p-4">
        <h3 className="text-center fw-bold mb-1">⌚ Kayıt Ol</h3>
        <p className="text-center text-muted small mb-4">Yeni hesap oluşturun</p>

        <div className="d-flex justify-content-center gap-2 mb-4">
          <span className={`badge rounded-pill ${step === 1 ? "bg-dark" : "bg-secondary"}`}>1. Hesap Bilgileri</span>
          <span className={`badge rounded-pill ${step === 2 ? "bg-dark" : "bg-secondary"}`}>2. Adres Bilgileri</span>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="mb-3">
                <label className="form-label">Ad Soyad</label>
                <input type="text" className="form-control rounded-pill" placeholder="Ad Soyad"
                  value={form.full_name} onChange={update("full_name")} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control rounded-pill" placeholder="email@example.com"
                  value={form.email} onChange={update("email")} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Şifre</label>
                <input type="password" className="form-control rounded-pill" placeholder="••••••••"
                  value={form.password} onChange={update("password")} required minLength={6} />
              </div>
              <div className="mb-4">
                <label className="form-label">Şifre Tekrar</label>
                <input type="password" className="form-control rounded-pill" placeholder="••••••••"
                  value={form.password2} onChange={update("password2")} required />
              </div>
              <button type="button" className="btn btn-dark w-100 rounded-pill" onClick={() => setStep(2)}>
                Devam Et →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-3">
                <label className="form-label">Telefon (opsiyonel)</label>
                <input type="tel" className="form-control rounded-pill" placeholder="+90 555 000 00 00"
                  value={form.phone} onChange={update("phone")} />
              </div>
              <div className="mb-3">
                <label className="form-label">Adres (opsiyonel)</label>
                <textarea className="form-control" rows={2} placeholder="Sokak, Mahalle..."
                  value={form.address} onChange={update("address")} />
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Şehir</label>
                  <input type="text" className="form-control rounded-pill" placeholder="İstanbul"
                    value={form.city} onChange={update("city")} />
                </div>
                <div className="col">
                  <label className="form-label">Ülke</label>
                  <input type="text" className="form-control rounded-pill" placeholder="Türkiye"
                    value={form.country} onChange={update("country")} />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary rounded-pill w-50"
                  onClick={() => setStep(1)}>← Geri</button>
                <button type="submit" className="btn btn-dark rounded-pill w-50" disabled={loading}>
                  {loading ? "Kaydediliyor..." : "Kayıt Ol"}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-center mt-3 small">
          Zaten hesabınız var mı?{" "}
          <Link to="/login" className="text-primary">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
