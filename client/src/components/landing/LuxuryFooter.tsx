import React from "react";
import { useLanguage } from "../../context/LanguageContext";

const copy = {
  en: {
    support: "Support",
    links: ["Shipping", "Returns", "Warranty", "Contact"],
    newsletter: "Newsletter",
    newsletterText: "Receive curated releases and private launch access.",
    input: "Your email address",
    subscribe: "Subscribe",
    rights: "All rights reserved.",
  },
  de: {
    support: "Support",
    links: ["Versand", "Rückgabe", "Garantie", "Kontakt"],
    newsletter: "Newsletter",
    newsletterText: "Erhalten Sie kuratierte Neuheiten und privaten Launch-Zugang.",
    input: "Ihre E-Mail-Adresse",
    subscribe: "Abonnieren",
    rights: "Alle Rechte vorbehalten.",
  },
} as const;

const LuxuryFooter = () => {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <footer style={{ background: "#111", color: "#F9F9F7" }}>
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5 style={{ fontFamily: "Georgia, serif" }}>SEIKO & TISSOT STORE</h5>
            <p className="small text-light-emphasis mb-0">
              Premium watch curation with secure checkout and global delivery standards.
            </p>
          </div>
          <div className="col-lg-3">
            <h6 className="text-uppercase small">{t.support}</h6>
            <ul className="list-unstyled small m-0">
              {t.links.map((link) => (
                <li key={link} className="mb-1 text-light-emphasis">
                  {link}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-lg-5">
            <h6 className="text-uppercase small">{t.newsletter}</h6>
            <p className="small text-light-emphasis">{t.newsletterText}</p>
            <div className="input-group">
              <input className="form-control" placeholder={t.input} />
              <button className="btn" style={{ background: "#D4AF37", color: "#1a1a1a", fontWeight: 700 }}>
                {t.subscribe}
              </button>
            </div>
          </div>
        </div>
        <hr style={{ borderColor: "rgba(255,255,255,0.14)" }} />
        <div className="d-flex justify-content-between small text-light-emphasis">
          <span>© {new Date().getFullYear()} Seiko & Tissot Store. {t.rights}</span>
          <span>EN / DE</span>
        </div>
      </div>
    </footer>
  );
};

export default LuxuryFooter;

