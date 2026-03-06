import React, { useEffect, useMemo, useState } from "react";
import { Watch } from "../../types";

function p95(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(0.95 * (sorted.length - 1));
  return sorted[idx];
}

const PerformanceMetricsPanel = ({ watches }: { watches: Watch[] }) => {
  const [samples, setSamples] = useState<{ api: number; image: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const apiDurations = resources
        .filter((r) => r.name.includes("/api/"))
        .map((r) => r.duration)
        .filter((n) => Number.isFinite(n));
      const imageDurations = resources
        .filter((r) => r.initiatorType === "img")
        .map((r) => r.duration)
        .filter((n) => Number.isFinite(n));

      const apiP95 = Number(p95(apiDurations).toFixed(1));
      const imageP95 = Number(p95(imageDurations).toFixed(1));
      setSamples((prev) => [...prev.slice(-11), { api: apiP95, image: imageP95 }]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const latest = samples[samples.length - 1] || { api: 0, image: 0 };
  const lowStock = useMemo(() => watches.filter((w) => Number(w.stock_quantity) < 3), [watches]);
  const maxY = Math.max(120, ...samples.map((s) => Math.max(s.api, s.image)));

  return (
    <section className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.8rem", margin: 0 }}>Admin Performance Metrics</h2>
        <span className="badge text-bg-dark">Live P95</span>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="p-3 rounded-4 border bg-white h-100">
            <div className="small text-uppercase text-muted">API P95 Latency</div>
            <div className="display-6 fw-bold" style={{ color: latest.api > 300 ? "#dc3545" : "#1a1a1a" }}>
              {latest.api || 0} ms
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="p-3 rounded-4 border bg-white h-100">
            <div className="small text-uppercase text-muted">Image Asset P95</div>
            <div className="display-6 fw-bold" style={{ color: latest.image > 100 ? "#dc3545" : "#1a1a1a" }}>
              {latest.image || 0} ms
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="p-3 rounded-4 border bg-white">
            <div className="small text-uppercase text-muted mb-2">P95 Timeline</div>
            <div className="d-flex align-items-end gap-2" style={{ height: 160 }}>
              {samples.length === 0 && <div className="text-muted small">Collecting samples...</div>}
              {samples.map((s, i) => (
                <div key={i} className="d-flex flex-column justify-content-end align-items-center gap-1">
                  <div style={{ width: 8, height: `${(s.api / maxY) * 120}px`, background: "#1a1a1a", borderRadius: 8 }} />
                  <div style={{ width: 8, height: `${(s.image / maxY) * 120}px`, background: "#D4AF37", borderRadius: 8 }} />
                </div>
              ))}
            </div>
            <div className="mt-2 small text-muted">Black = API, Gold = Image</div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="p-3 rounded-4 border bg-white h-100">
            <div className="small text-uppercase text-muted mb-2">Low Stock Alerts</div>
            {lowStock.length === 0 && <div className="text-success small">No low stock alerts.</div>}
            {lowStock.length > 0 && (
              <ul className="list-group list-group-flush">
                {lowStock.map((w) => (
                  <li key={w.watch_id} className="list-group-item px-0 d-flex justify-content-between">
                    <span>{w.watch_name}</span>
                    <span className="badge text-bg-danger">{w.stock_quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformanceMetricsPanel;

