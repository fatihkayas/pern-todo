import React from "react";
import {
  MenuDrinkItem,
  MenuSauceOption,
  PizzaCartItem,
  RestaurantMenuItem,
} from "../../types";

interface DonerFlowModalProps {
  item: RestaurantMenuItem;
  drinks: MenuDrinkItem[];
  sauces: MenuSauceOption[];
  maxFreeSauces: number;
  onClose: () => void;
  onAddToCart: (item: PizzaCartItem) => void;
}

type StepKey = "side" | "sauces" | "drink" | "summary";

const DonerFlowModal: React.FC<DonerFlowModalProps> = ({
  item,
  drinks,
  sauces,
  maxFreeSauces,
  onClose,
  onAddToCart,
}) => {
  const steps = React.useMemo<StepKey[]>(() => {
    const nextSteps: StepKey[] = [];
    if (item.flow.sideRequired) nextSteps.push("side");
    if (item.flow.saucesIncluded > 0) nextSteps.push("sauces");
    if (item.flow.drinkOptional) nextSteps.push("drink");
    nextSteps.push("summary");
    return nextSteps;
  }, [item.flow.drinkOptional, item.flow.saucesIncluded, item.flow.sideRequired]);

  const [stepIndex, setStepIndex] = React.useState(0);
  const [side, setSide] = React.useState<{ name: string; price: number } | null>(null);
  const [selectedSauces, setSelectedSauces] = React.useState<MenuSauceOption[]>([]);
  const [drink, setDrink] = React.useState<MenuDrinkItem | null>(null);
  const [isCompact, setIsCompact] = React.useState(() => window.innerWidth < 960);

  const currentStep = steps[stepIndex];
  const basePrice = item.price;
  const sidePrice = side?.price ?? 0;
  const drinkPrice = drink?.price ?? 0;
  const total = basePrice + sidePrice + drinkPrice;

  React.useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 960);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSauce = (sauce: MenuSauceOption) => {
    setSelectedSauces((current) => {
      const exists = current.some((entry) => entry.id === sauce.id);
      if (exists) {
        return current.filter((entry) => entry.id !== sauce.id);
      }
      if (current.length >= Math.min(maxFreeSauces, item.flow.saucesIncluded)) {
        return current;
      }
      return [...current, sauce];
    });
  };

  const goNext = () => setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  const goBack = () => setStepIndex((current) => Math.max(current - 1, 0));

  const addToCart = () => {
    onAddToCart({
      pizza_id: item.pizza_id,
      name: item.name,
      description: item.description,
      base_price: total.toFixed(2),
      image_url: item.image_url,
      sizes: [],
      toppings: [],
      is_available: true,
      category: item.categoryId,
      cart_item_id: `${item.pizza_id}:${Date.now()}`,
      quantity: 1,
      allergens: item.allergens,
      options: {
        toppings: [],
        side: side?.name,
        sidePrice,
        sauces: selectedSauces.map((entry) => entry.name),
        drink: drink?.name,
        drinkPrice,
      },
    });
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose} aria-label="Schließen">
          x
        </button>

        <div
          style={{
            ...styles.modalGrid,
            gridTemplateColumns: isCompact ? "1fr" : "minmax(0, 1.6fr) minmax(280px, 0.9fr)",
          }}
        >
          <div>
            <div style={styles.progressRow}>
              {steps.map((step, index) => (
                <div key={step} style={styles.progressItem}>
                  <div
                    style={{
                      ...styles.progressDot,
                      ...(index <= stepIndex ? styles.progressDotActive : {}),
                    }}
                  >
                    {index + 1}
                  </div>
                  <span style={styles.progressLabel}>{stepLabel(step)}</span>
                </div>
              ))}
            </div>

            <div style={styles.header}>
              <div style={styles.kicker}>{item.categoryName}</div>
              <h2 style={styles.title}>{item.name}</h2>
              <p style={styles.description}>{item.description}</p>
            </div>

            {currentStep === "side" ? (
              <StepCard title="Wähle eine Beilage" subtitle="Bitte entscheide dich für Pommes oder Reis.">
                <OptionGrid>
                  {item.flow.sideOptions?.map((option) => (
                    <ChoiceButton
                      key={option.name}
                      label={`${option.name}${option.price ? ` · ${formatEuro(option.price)}` : ""}`}
                      active={side?.name === option.name}
                      onClick={() => setSide(option)}
                    />
                  ))}
                </OptionGrid>
                <ActionRow>
                  <GhostButton onClick={goBack} disabled={stepIndex === 0}>
                    Zurück
                  </GhostButton>
                  <PrimaryButton onClick={goNext} disabled={!side}>
                    Weiter
                  </PrimaryButton>
                </ActionRow>
              </StepCard>
            ) : null}

            {currentStep === "sauces" ? (
              <StepCard
                title="Wähle bis zu 3 Soßen"
                subtitle={`Du kannst bis zu ${Math.min(maxFreeSauces, item.flow.saucesIncluded)} Soßen kostenlos auswählen.`}
              >
                <OptionGrid>
                  {sauces.map((option) => {
                    const isActive = selectedSauces.some((entry) => entry.id === option.id);
                    const disabled =
                      !isActive &&
                      selectedSauces.length >= Math.min(maxFreeSauces, item.flow.saucesIncluded);
                    return (
                      <ChoiceButton
                        key={option.id}
                        label={option.name}
                        active={isActive}
                        disabled={disabled}
                        onClick={() => toggleSauce(option)}
                      />
                    );
                  })}
                </OptionGrid>
                <ActionRow>
                  <GhostButton onClick={goBack}>Zurück</GhostButton>
                  <PrimaryButton onClick={goNext}>Weiter</PrimaryButton>
                </ActionRow>
              </StepCard>
            ) : null}

            {currentStep === "drink" ? (
              <StepCard
                title="Getränk hinzufügen?"
                subtitle="Wähle optional einen Softdrink. Der Preis wird direkt zum Gesamtbetrag addiert."
              >
                <OptionGrid>
                  {drinks.map((entry) => (
                    <ChoiceButton
                      key={entry.id}
                      label={`${entry.name} · ${formatEuro(entry.price)}`}
                      active={drink?.id === entry.id}
                      onClick={() => setDrink(drink?.id === entry.id ? null : entry)}
                    />
                  ))}
                </OptionGrid>
                <ActionRow>
                  <GhostButton onClick={goBack}>Zurück</GhostButton>
                  <GhostButton onClick={goNext}>Ohne Getränk weiter</GhostButton>
                  <PrimaryButton onClick={goNext}>Weiter</PrimaryButton>
                </ActionRow>
              </StepCard>
            ) : null}

            {currentStep === "summary" ? (
              <StepCard title="Bestellübersicht" subtitle="Prüfe deine Auswahl und lege den Artikel in den Warenkorb.">
                <div style={{ ...styles.summaryBoxMobile, display: isCompact ? "grid" : "none" }}>
                  <SummaryList
                    itemName={item.name}
                    basePrice={basePrice}
                    side={side}
                    sauces={selectedSauces}
                    drink={drink}
                    total={total}
                  />
                </div>
                <ActionRow>
                  <GhostButton onClick={goBack}>Zurück</GhostButton>
                  <PrimaryButton onClick={addToCart}>In den Warenkorb</PrimaryButton>
                </ActionRow>
              </StepCard>
            ) : null}
          </div>

          <aside style={{ ...styles.summaryPanel, display: isCompact ? "none" : "block" }}>
            <div style={styles.summaryPanelInner}>
              <div style={styles.summaryKicker}>Live-Gesamtpreis</div>
              <SummaryList
                itemName={item.name}
                basePrice={basePrice}
                side={side}
                sauces={selectedSauces}
                drink={drink}
                total={total}
              />
            </div>
          </aside>
        </div>
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

const SummaryList: React.FC<{
  itemName: string;
  basePrice: number;
  side: { name: string; price: number } | null;
  sauces: MenuSauceOption[];
  drink: MenuDrinkItem | null;
  total: number;
}> = ({ itemName, basePrice, side, sauces, drink, total }) => (
  <div style={styles.summaryBox}>
    <SummaryRow label="Basis" value={itemName} amount={basePrice} />
    <SummaryRow label="Beilage" value={side?.name ?? "Keine"} amount={side?.price ?? 0} />
    <SummaryRow
      label="Soßen"
      value={sauces.length ? sauces.map((entry) => entry.name).join(", ") : "Keine"}
      amount={0}
    />
    <SummaryRow label="Getränk" value={drink?.name ?? "Kein Getränk"} amount={drink?.price ?? 0} />
    <SummaryRow label="Gesamt" value={formatEuro(total)} strong />
  </div>
);

const SummaryRow: React.FC<{ label: string; value: string; amount?: number; strong?: boolean }> = ({
  label,
  value,
  amount,
  strong,
}) => (
  <div style={styles.summaryRow}>
    <div>
      <div style={styles.summaryLabel}>{label}</div>
      <div style={strong ? styles.summaryStrong : styles.summaryValue}>{value}</div>
    </div>
    {typeof amount === "number" && !strong ? <div style={styles.summaryAmount}>{formatEuro(amount)}</div> : null}
  </div>
);

const OptionGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={styles.optionGrid}>{children}</div>
);

const ChoiceButton: React.FC<{
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ label, active, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      ...styles.choiceButton,
      ...(active ? styles.choiceButtonActive : {}),
      ...(disabled ? styles.choiceButtonDisabled : {}),
    }}
  >
    {label}
  </button>
);

const ActionRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={styles.actionRow}>{children}</div>
);

const GhostButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, children, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled} style={styles.ghostButton}>
    {children}
  </button>
);

const PrimaryButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, children, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled} style={styles.primaryButton}>
    {children}
  </button>
);

function stepLabel(step: StepKey) {
  switch (step) {
    case "side":
      return "Beilage";
    case "sauces":
      return "Soßen";
    case "drink":
      return "Getränk";
    case "summary":
      return "Übersicht";
    default:
      return step;
  }
}

function formatEuro(price: number) {
  return `${price.toFixed(2).replace(".", ",")} €`;
}

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
    maxWidth: 1080,
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
  modalGrid: {
    display: "grid",
    gap: 24,
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
    lineHeight: 1.7,
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
    lineHeight: 1.6,
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
  choiceButtonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
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
  summaryPanel: {
    position: "sticky",
    top: 0,
    alignSelf: "start",
  },
  summaryPanelInner: {
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    padding: 18,
  },
  summaryKicker: {
    color: "#ff8b8b",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: 12,
    marginBottom: 12,
    fontWeight: 800,
  },
  summaryBox: {
    display: "grid",
    gap: 12,
  },
  summaryBoxMobile: {
    marginTop: 16,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 4,
  },
  summaryValue: {
    color: "#fff",
    fontWeight: 700,
    lineHeight: 1.5,
  },
  summaryStrong: {
    color: "#ffb2a3",
    fontWeight: 900,
    fontSize: 18,
  },
  summaryAmount: {
    color: "#fff",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
};

export default DonerFlowModal;
