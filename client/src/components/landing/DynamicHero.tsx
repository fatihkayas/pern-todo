import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const copy = {
  en: {
    kicker: "SEIKO + TISSOT CURATED COLLECTION",
    title: "Precision Meets Heritage.",
    subtitle: "Explore premium automatic and classic watches designed for timeless performance.",
    ctaPrimary: "Shop Collection",
    ctaSecondary: "Discover Story",
  },
  de: {
    kicker: "SEIKO + TISSOT KURATIERTE KOLLEKTION",
    title: "Präzision trifft Tradition.",
    subtitle: "Entdecken Sie Premium-Automatik- und klassische Uhren mit zeitloser Performance.",
    ctaPrimary: "Kollektion ansehen",
    ctaSecondary: "Story entdecken",
  },
} as const;

const DynamicHero = () => {
  const { language } = useLanguage();
  const t = copy[language];
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffsetY(window.scrollY * 0.35);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "78vh",
        color: "#F9F9F7",
        overflow: "hidden",
        background:
          "linear-gradient(rgba(10,10,10,0.48), rgba(10,10,10,0.58)), url('https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1800&q=80') center / cover no-repeat",
        backgroundPositionY: `${-offsetY}px`,
      }}
    >
      <div
        className="container d-flex flex-column justify-content-center"
        style={{ minHeight: "78vh", position: "relative", zIndex: 2 }}
      >
        <p style={{ letterSpacing: "0.14em", fontSize: 12, fontWeight: 600, marginBottom: 18 }}>{t.kicker}</p>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            lineHeight: 1.05,
            marginBottom: 18,
            maxWidth: 760,
          }}
        >
          {t.title}
        </h1>
        <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", maxWidth: 720, color: "rgba(249,249,247,0.9)" }}>
          {t.subtitle}
        </p>
        <div className="d-flex gap-3 mt-4 flex-wrap">
          <a href="#catalog" className="btn btn-light px-4 py-2 fw-semibold rounded-pill">
            {t.ctaPrimary}
          </a>
          <a
            href="#trust"
            className="btn px-4 py-2 fw-semibold rounded-pill"
            style={{ background: "rgba(212,175,55,0.18)", color: "#F9F9F7", border: "1px solid #D4AF37" }}
          >
            {t.ctaSecondary}
          </a>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: 150,
          background: "linear-gradient(to bottom, rgba(0,0,0,0), #F9F9F7)",
        }}
      />
    </section>
  );
};

export default DynamicHero;

