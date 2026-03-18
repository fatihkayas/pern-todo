import React, { useMemo, useState } from "react";
import { Pizza, PizzaCartItem } from "../../types";

interface DonerFlowModalProps {
  item: Pizza;
  onClose: () => void;
  onAddToCart: (item: PizzaCartItem) => void;
}

const sides = ["Pommes klein", "Pommes groß", "Reis"];
const sauces = ["Knoblauch Soße", "Scharfe Soße", "Joghurt Soße"];
const drinks = [
  "fritz-kola",
  "fritz-kola superzero",
  "fritz-limo orange",
  "fritz-limo zitrone",
  "fritz-limo apfel-kirsch-holunder",
];

const steps = [
  "Beilage",
  "Soße",
  "Getränk",
  "Warenkorb",
];

const DonerFlowModal: React.FC<DonerFlowModalProps> = ({ item, onClose, onAddToCart }) => {
  const [step, setStep] = useState(0);
  const [side, setSide] = useState<string>("");
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [drink, setDrink] = useState<string>("");

  const total = useMemo(() => {
    const base = Number(item.base_price);
    const drinkPrice = drink ? 2.5 : 0;
    return base + drinkPrice;
  }, [drink, item.base_price]);

  const goNext = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const goBack = () => setStep((current) => Math.max(current - 1, 0));

  const toggleSauce = (sauce: string) => {
    setSelectedSauces((current) =>
      current.includes(sauce) ? current.filter((entry) => entry !== sauce) : [...current, sauce]
    );
  };

  const addToCart = () => {
    onAddToCart({
      ...item,
      cart_item_id: `${item.pizza_id}:${Date.now()}`,
      quantity: 1,
      options: {
        size: item.sizes[0] || "Standard",
        toppings: [],
        side: side || undefined,
        sauces: selectedSauces.length ? selectedSauces : undefined,
        drink: drink || undefined,
      },
      base_price: total.toFixed(2),
    });
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>x</button>

        <div style={styles.progressRow}>
          {steps.map((label, index) => (
            <div key={label} style={styles.progressItem}>
              <div
                style={{
                  ...styles.progressDot,
                  ...(index <= step ? styles.progressDotActive : {}),
                }}
              >
                {index + 1}
              </div>
              <span style={styles.progressLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div style={styles.header}>
          <div style={styles.kicker}>Döner Flow</div>
          <h2 style={styles.title}>{item.name}</h2>
          <p style={styles.description}>{item.description}</p>
        </div>

        {step === 0 ? (
          <StepCard title="Wähle deine Beilage" subtitle="Choose one or skip.">
            <OptionGrid>
              {sides.map((entry) => (
                <ChoiceButton
                  key={entry}
                  label={entry}
                  active={side === entry}
                  onClick={() => setSide(entry)}
                />
              ))}
            </OptionGrid>
            <ActionRow>
              <GhostButton onClick={goNext}>Überspringen</GhostButton>
              <PrimaryButton onClick={goNext}>Weiter</PrimaryButton>
            </ActionRow>
          </StepCard>
        ) : null}

        {step === 1 ? (
          <StepCard title="Wähle deine Soße" subtitle="Multi-select is enabled.">
            <OptionGrid>
              {sauces.map((entry) => (
                <ChoiceButton
                  key={entry}
                  label={entry}
                  active={selectedSauces.includes(entry)}
                  onClick={() => toggleSauce(entry)}
                />
              ))}
            </OptionGrid>
            <ActionRow>
              <GhostButton onClick={goBack}>Zurück</GhostButton>
              <GhostButton onClick={goNext}>Überspringen</GhostButton>
              <PrimaryButton onClick={goNext}>Weiter</PrimaryButton>
            </ActionRow>
          </StepCard>
        ) : null}

        {step === 2 ? (
          <StepCard title="Getränk hinzufügen?" subtitle="All soft drinks are 2,50 €.">
            <OptionGrid>
              {drinks.map((entry) => (
                <ChoiceButton
                  key={entry}
                  label={`${entry} · 2,50 €`}
                  active={drink === entry}
                  onClick={() => setDrink(entry)}
                />
              ))}
            </OptionGrid>
            <ActionRow>
              <GhostButton onClick={goBack}>Zurück</GhostButton>
              <GhostButton onClick={goNext}>Weiter ohne Getränk</GhostButton>
              <PrimaryButton onClick={goNext}>Mit Getränk weiter</PrimaryButton>
            </ActionRow>
          </StepCard>
        ) : null}

        {step === 3 ? (
          <StepCard title="Bestellübersicht" subtitle="Review and add to cart.">
            <div style={styles.summaryBox}>
              <SummaryRow label="Döner" value={item.name} />
              <SummaryRow label="Beilage" value={side || "Keine"} />
              <SummaryRow label="Soßen" value={selectedSauces.length ? selectedSauces.join(", ") : "Keine"} />
              <SummaryRow label="Getränk" value={drink || "Kein Getränk"} />
              <SummaryRow label="Gesamt" value={`${total.toFixed(2).replace(".", ",")} €`} strong />
            </div>
            <ActionRow>
              <GhostButton onClick={goBack}>Zurück</GhostButton>
              <PrimaryButton onClick={addToCart}>In den Warenkorb</PrimaryButton>
            </ActionRow>
          </StepCard>
        ) : null}
      </div>
    </div>
  );
};

const StepCard: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <div>
    <h3 style={styles.stepTitle}>{title}</h3>
    <p style={styles.stepSubtitle}>{subtitle}</p>
    {children}
  </div>
);

const OptionGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={styles.optionGrid}>{children}</div>
);

const ChoiceButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      ...styles.choiceButton,
      ...(active ? styles.choiceButtonActive : {}),
    }}
  >
    {label}
  </button>
);

const ActionRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={styles.actionRow}>{children}</div>
);

const GhostButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick,
  children,
}) => (
  <button type="button" onClick={onClick} style={styles.ghostButton}>
    {children}
  </button>
);

const PrimaryButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick,
  children,
}) => (
  <button type="button" onClick={onClick} style={styles.primaryButton}>
    {children}
  </button>
);

const SummaryRow: React.FC<{ label: string; value: string; strong?: boolean }> = ({
  label,
  value,
  strong,
}) => (
  <div style={styles.summaryRow}>
    <span>{label}</span>
    <strong style={strong ? styles.summaryStrong : undefined}>{value}</strong>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.78)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 2200,
  },
  modal: {
    width: "100%",
    maxWidth: 720,
    maxHeight: "92vh",
    overflowY: "auto",
    borderRadius: 28,
    background: "linear-gradient(180deg, #171010 0%, #090909 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
    padding: "28px 24px",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 999,
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },
  progressRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    marginBottom: 24,
  },
  progressItem: {
    display: "grid",
    justifyItems: "center",
    gap: 8,
  },
  progressDot: {
    width: 34,
    height: 34,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,0.55)",
    fontWeight: 800,
    background: "rgba(255,255,255,0.04)",
  },
  progressDotActive: {
    background: "linear-gradient(135deg, #e63946 0%, #ff6b35 100%)",
    color: "#fff",
    border: "none",
  },
  progressLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },
  header: {
    marginBottom: 20,
  },
  kicker: {
    color: "#ff7a00",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
  },
  description: {
    color: "rgba(255,255,255,0.7)",
    margin: "10px 0 0",
  },
  stepTitle: {
    color: "#fff",
    fontSize: 24,
    margin: "0 0 6px",
    fontWeight: 800,
  },
  stepSubtitle: {
    color: "rgba(255,255,255,0.64)",
    margin: "0 0 18px",
  },
  optionGrid: {
    display: "grid",
    gap: 12,
  },
  choiceButton: {
    minHeight: 58,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    textAlign: "left",
    padding: "14px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  choiceButtonActive: {
    border: "1px solid rgba(255,122,0,0.45)",
    background: "rgba(230,57,70,0.18)",
  },
  actionRow: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    flexWrap: "wrap",
    marginTop: 20,
  },
  ghostButton: {
    minHeight: 52,
    padding: "0 18px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryButton: {
    minHeight: 52,
    padding: "0 22px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(135deg, #e63946 0%, #ff6b35 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  summaryBox: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    padding: 18,
    display: "grid",
    gap: 12,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "#fff",
  },
  summaryStrong: {
    color: "#ffb2a3",
  },
};

export default DonerFlowModal;
