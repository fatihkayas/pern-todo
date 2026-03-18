import React from "react";
import { useLanguage } from "../../context/LanguageContext";

interface OrderModalProps {
  onClose: () => void;
  onDirectOrder: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ onClose, onDirectOrder }) => {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div id="order" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close order popup">
          x
        </button>

        <div style={styles.kicker}>{t.kicker}</div>
        <h2 style={styles.title}>{t.title}</h2>
        <p style={styles.sub}>{t.sub}</p>

        <div style={styles.buttons}>
          <a
            href="https://www.lieferando.de"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.btn, ...styles.lieferando }}
          >
            <div style={styles.btnTitle}>Lieferando</div>
            <div style={styles.btnSub}>{t.lieferando}</div>
          </a>

          <a
            href="https://www.ubereats.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.btn, ...styles.ubereats }}
          >
            <div style={styles.btnTitle}>Uber Eats</div>
            <div style={styles.btnSub}>{t.ubereats}</div>
          </a>

          <button
            type="button"
            onClick={onDirectOrder}
            style={{ ...styles.btn, ...styles.directButton }}
          >
            <div style={styles.btnTitle}>{t.directTitle}</div>
            <div style={styles.btnSub}>{t.directSub}</div>
          </button>
        </div>
      </div>
    </div>
  );
};

const copy = {
  en: {
    kicker: "Order now!",
    title: "How would you like to order?",
    sub: "Use Lieferando, Uber Eats, or order directly on this page.",
    lieferando: "Open marketplace ordering",
    ubereats: "Fast app-based delivery",
    directTitle: "Order directly here",
    directSub: "Add items to the site cart and checkout here",
  },
  de: {
    kicker: "Jetzt bestellen!",
    title: "Wie möchtest du bestellen?",
    sub: "Nutze Lieferando, Uber Eats oder bestelle direkt auf dieser Seite.",
    lieferando: "Zum Marktplatz wechseln",
    ubereats: "Schnelle Lieferung per App",
    directTitle: "Direkt auf der Seite",
    directSub: "Produkte in den Warenkorb legen und hier bezahlen",
  },
} as const;

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.82)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: 20,
    backdropFilter: "blur(6px)",
  },
  modal: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 24,
    padding: "32px 28px",
    background: "linear-gradient(180deg, #151111 0%, #090909 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
    position: "relative",
    textAlign: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },
  kicker: {
    color: "#ff7a00",
    fontSize: 13,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontWeight: 800,
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 1,
    margin: "0 0 10px",
    fontWeight: 900,
  },
  sub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    margin: "0 0 24px",
  },
  buttons: {
    display: "grid",
    gap: 14,
  },
  btn: {
    display: "block",
    width: "100%",
    textDecoration: "none",
    borderRadius: 18,
    padding: "18px 20px",
    textAlign: "left",
    color: "#fff",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
    border: "none",
  },
  lieferando: {
    background: "linear-gradient(135deg, #ff8c00 0%, #ff6a00 100%)",
  },
  ubereats: {
    background: "linear-gradient(135deg, #0f8b4c 0%, #06c167 100%)",
  },
  directButton: {
    background: "linear-gradient(135deg, #e63946 0%, #ff4d57 100%)",
    cursor: "pointer",
  },
  btnTitle: {
    fontSize: 20,
    fontWeight: 800,
    marginBottom: 4,
  },
  btnSub: {
    fontSize: 13,
    opacity: 0.92,
  },
};

export default OrderModal;
