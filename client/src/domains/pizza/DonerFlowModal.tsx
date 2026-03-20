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

type StepKey = "side" | "sauces" | "drink" | "extra" | "summary";

const friesExtras = [
  { id: "none", name: "Keine Pommes", price: 0 },
  { id: "pommes-klein", name: "Pommes Klein", price: 3 },
  { id: "pommes-gross", name: "Pommes Gross", price: 5 },
];

const palette = {
  overlay: "rgba(42,31,24,0.34)",
  modalTop: "#F8F2EA",
  modalBottom: "#EFE3D3",
  card: "#FFFFFF",
  border: "#E5D6C2",
  text: "#2A1F18",
  secondaryText: "#5C4A3E",
  muted: "#8A7A6A",
  leather: "#8B5E3C",
  gold: "#C1863B",
};

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
    if (item.categoryId === "doener") nextSteps.push("extra");
    nextSteps.push("summary");
    return nextSteps;
  }, [item.categoryId, item.flow.drinkOptional, item.flow.saucesIncluded, item.flow.sideRequired]);

  const [stepIndex, setStepIndex] = React.useState(0);
  const [side, setSide] = React.useState<{ name: string; price: number } | null>(null);
  const [selectedSauces, setSelectedSauces] = React.useState<MenuSauceOption[]>([]);
  const [drink, setDrink] = React.useState<MenuDrinkItem | null>(null);
  const [extra, setExtra] = React.useState<{ name: string; price: number } | null>(null);
  const [isCompact, setIsCompact] = React.useState(() => window.innerWidth < 960);

  const currentStep = steps[stepIndex];
  const basePrice = item.price;
  const sidePrice = side?.price ?? 0;
  const drinkPrice = drink?.price ?? 0;
  const extraPrice = extra?.price ?? 0;
  const total = basePrice + sidePrice + drinkPrice + extraPrice;

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
        extra: extra?.price ? extra.name : undefined,
        extraPrice,
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
        <button style={styles.closeButton} onClick={onClose} aria-label="Schliessen">
          x
        </button>

        <div
          style={{
            ...styles.modalGrid,
            gridTemplateColumns: isCompact ? "1fr" : "minmax(0, 1.6fr) minmax(280px, 0.9fr)",
          }}
        >
          <div>
            <div
              style={{
                ...styles.progressRow,
                gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
              }}
            >
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
              <StepCard title="Waehle eine Beilage" subtitle="Bitte entscheide dich fuer Pommes oder Reis.">
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
                    Zurueck
                  </GhostButton>
                  <PrimaryButton onClick={goNext} disabled={!side}>
                    Weiter
                  </PrimaryButton>
                </ActionRow>
              </StepCard>
            ) : null}

            {currentStep === "sauces" ? (
              <StepCard
                title="Waehle bis zu 3 Sossen"
                subtitle={`Du kannst bis zu ${Math.min(maxFreeSauces, item.flow.saucesIncluded)} Sossen kostenlos auswaehlen.`}
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
                  <GhostButton onClick={goBack}>Zurueck</GhostButton>
                  <PrimaryButton onClick={goNext}>Weiter</PrimaryButton>
                </ActionRow>
              </StepCard>
            ) : null}

            {currentStep === "drink" ? (
              <StepCard
                title="Getraenk hinzufuegen?"
                subtitle="Waehle optional einen Softdrink. Der Preis wird direkt zum Gesamtbetrag addiert."
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
                  <GhostButton onClick={goBack}>Zurueck</GhostButton>
                  <GhostButton onClick={goNext}>Ohne Getraenk weiter</GhostButton>
                  <PrimaryButton onClick={goNext}>Weiter</PrimaryButton>
                </ActionRow>
              </StepCard>
            ) : null}

            {currentStep === "extra" ? (
              <StepCard
                title="Pommes dazu?"
                subtitle="Du kannst optional eine kleine oder grosse Portion Pommes zum Menue dazunehmen."
              >
                <OptionGrid>
                  {friesExtras.map((entry) => (
                    <ChoiceButton
                      key={entry.id}
                      label={entry.price ? `${entry.name} · ${formatEuro(entry.price)}` : entry.name}
                      active={(extra?.name ?? "Keine Pommes") === entry.name}
                      onClick={() =>
                        setExtra(entry.price ? { name: entry.name, price: entry.price } : null)
                      }
                    />
                  ))}
                </OptionGrid>
                <ActionRow>
                  <GhostButton onClick={goBack}>Zurueck</GhostButton>
                  <PrimaryButton onClick={goNext}>Weiter</PrimaryButton>
                </ActionRow>
              </StepCard>
            ) : null}

            {currentStep === "summary" ? (
              <StepCard title="Bestelluebersicht" subtitle="Pruefe deine Auswahl und lege den Artikel in den Warenkorb.">
                <div style={{ ...styles.summaryBoxMobile, display: isCompact ? "grid" : "none" }}>
                  <SummaryList
                    itemName={item.name}
                    basePrice={basePrice}
                    side={side}
                    extra={extra}
                    sauces={selectedSauces}
                    drink={drink}
                    total={total}
                  />
                </div>
                <ActionRow>
                  <GhostButton onClick={goBack}>Zurueck</GhostButton>
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
                extra={extra}
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
  extra: { name: string; price: number } | null;
  sauces: MenuSauceOption[];
  drink: MenuDrinkItem | null;
  total: number;
}> = ({ itemName, basePrice, side, extra, sauces, drink, total }) => (
  <div style={styles.summaryBox}>
    <SummaryRow label="Basis" value={itemName} amount={basePrice} />
    <SummaryRow label="Beilage" value={side?.name ?? "Keine"} amount={side?.price ?? 0} />
    <SummaryRow label="Extra" value={extra?.name ?? "Kein Extra"} amount={extra?.price ?? 0} />
    <SummaryRow
      label="Sossen"
      value={sauces.length ? sauces.map((entry) => entry.name).join(", ") : "Keine"}
      amount={0}
    />
    <SummaryRow label="Getraenk" value={drink?.name ?? "Kein Getraenk"} amount={drink?.price ?? 0} />
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
      return "Sossen";
    case "drink":
      return "Getraenk";
    case "extra":
      return "Extra";
    case "summary":
      return "Uebersicht";
    default:
      return step;
  }
}

function formatEuro(price: number) {
  return `${price.toFixed(2).replace(".", ",")} EUR`;
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: palette.overlay,
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
    background: `linear-gradient(180deg, ${palette.modalTop} 0%, ${palette.modalBottom} 100%)`,
    border: `1px solid ${palette.border}`,
    boxShadow: "0 28px 80px rgba(42,31,24,0.18)",
    padding: "28px 24px",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    border: `1px solid ${palette.border}`,
    borderRadius: 999,
    background: "rgba(255,255,255,0.86)",
    color: palette.text,
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
    border: `1px solid ${palette.border}`,
    display: "grid",
    placeItems: "center",
    color: palette.muted,
    fontWeight: 800,
    background: "#FFF9F3",
  },
  progressDotActive: {
    background: palette.leather,
    color: "#fff",
    border: "none",
  },
  progressLabel: {
    fontSize: 12,
    color: palette.muted,
    textAlign: "center",
  },
  header: {
    marginBottom: 20,
  },
  kicker: {
    color: palette.gold,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  },
  title: {
    color: palette.text,
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
  },
  description: {
    color: palette.secondaryText,
    margin: "10px 0 0",
    lineHeight: 1.7,
  },
  stepTitle: {
    color: palette.text,
    fontSize: 24,
    margin: "0 0 6px",
    fontWeight: 800,
  },
  stepSubtitle: {
    color: palette.secondaryText,
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
    border: `1px solid ${palette.border}`,
    background: palette.card,
    color: palette.text,
    textAlign: "left",
    padding: "14px 16px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(42,31,24,0.06)",
    transition: "all 0.25s ease",
  },
  choiceButtonActive: {
    border: `1px solid ${palette.leather}`,
    background: "#F8EFE5",
    boxShadow: "0 12px 26px rgba(139,94,60,0.14)",
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
    border: `1px solid ${palette.leather}`,
    background: "transparent",
    color: palette.leather,
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryButton: {
    minHeight: 52,
    padding: "0 22px",
    borderRadius: 999,
    border: "none",
    background: palette.leather,
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(139,94,60,0.18)",
  },
  summaryPanel: {
    position: "sticky",
    top: 0,
    alignSelf: "start",
  },
  summaryPanelInner: {
    borderRadius: 24,
    border: `1px solid ${palette.border}`,
    background: "rgba(255,255,255,0.88)",
    padding: 18,
    boxShadow: "0 12px 30px rgba(42,31,24,0.08)",
  },
  summaryKicker: {
    color: palette.gold,
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
    color: palette.muted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 4,
  },
  summaryValue: {
    color: palette.text,
    fontWeight: 700,
    lineHeight: 1.5,
  },
  summaryStrong: {
    color: palette.leather,
    fontWeight: 900,
    fontSize: 18,
  },
  summaryAmount: {
    color: palette.text,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
};

export default DonerFlowModal;
