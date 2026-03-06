import React from "react";
import { useLanguage } from "../../context/LanguageContext";

export interface CategoryItem {
  id: string;
  icon: string;
  color: string;
}

const labels = {
  en: {
    all: "All",
    Seiko: "Seiko",
    Tissot: "Tissot",
    Automatic: "Automatic",
    Sport: "Sport",
    Classic: "Classic",
  },
  de: {
    all: "Alle",
    Seiko: "Seiko",
    Tissot: "Tissot",
    Automatic: "Automatik",
    Sport: "Sport",
    Classic: "Klassisch",
  },
} as const;

const CircularCategoryBar = ({
  categories,
  activeCategory,
  onChange,
}: {
  categories: CategoryItem[];
  activeCategory: string;
  onChange: (category: string) => void;
}) => {
  const { language } = useLanguage();
  const t = labels[language];

  return (
    <section className="container py-4">
      <div className="d-flex gap-4 overflow-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="bg-transparent border-0 p-0"
            onClick={() => onChange(cat.id)}
            style={{ minWidth: 88, textAlign: "center", scrollSnapAlign: "center" }}
          >
            <div
              className="d-flex align-items-center justify-content-center mx-auto shadow-sm"
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                fontSize: 26,
                border: activeCategory === cat.id ? "none" : "1px solid #e8e5df",
                background: activeCategory === cat.id ? "#1a1a1a" : "#fff",
                color: activeCategory === cat.id ? "#F9F9F7" : cat.color,
                transform: activeCategory === cat.id ? "translateY(-2px)" : "none",
                transition: "all .2s ease",
              }}
            >
              {cat.icon}
            </div>
            <div className="mt-2" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
              {t[cat.id as keyof typeof t]}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CircularCategoryBar;

