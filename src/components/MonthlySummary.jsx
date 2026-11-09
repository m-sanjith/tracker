import { useState } from "react";

export default function MonthlySummary({ monthly }) {
  const [selectedMonth, setSelectedMonth] = useState("");

  if (!monthly || monthly.length === 0) {
    return (
      <div className="section" id="monthly">
        <div className="empty-state-card">
          <h3>Monthly High / Low Report</h3>
          <p>No monthly data available.</p>
        </div>
      </div>
    );
  }

  // Default to the most recent month
  const currentMonth = selectedMonth || monthly[0].month;
  const selectedData = monthly.find((m) => m.month === currentMonth) || monthly[0];

  const formatMoney = (val) => {
    if (val === null || val === undefined) return "—";
    const num = Number(val);
    if (num < 0) return `-₹${Math.abs(num).toLocaleString("en-IN")}`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const formatPercentage = (val) => {
    if (val === null || val === undefined || Number.isNaN(Number(val))) {
      return "0.00%";
    }
    const num = Number(val);
    return num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
  };

  const getGrowthBadge = (growthAmount, growthPercent) => {
    const isUp = growthAmount > 0;
    const isDown = growthAmount < 0;
    const cls = isUp ? "growth-pill-up" : isDown ? "growth-pill-down" : "growth-pill-neutral";
    const symbol = isUp ? "▲ +" : isDown ? "▼ -" : "● ";

    return (
      <div className={`monthly-growth-pill ${cls}`}>
        <span className="growth-pill-amount">
          {symbol}₹{Math.abs(Number(growthAmount) || 0).toLocaleString("en-IN")}
        </span>
        <span className="growth-pill-percent">
          ({formatPercentage(growthPercent)})
        </span>
      </div>
    );
  };

  return (
    <section className="section monthly-report-section" id="monthly">
      {/* SECTION HEADER */}
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">Monthly Analytics</span>
          <h2 className="section-heading">High / Low Price Benchmark</h2>
        </div>

        {/* CUSTOM STYLED MONTH SELECTOR */}
        <div className="custom-select-wrap">
          <select
            className="modern-select"
            value={currentMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthly.map((m) => (
              <option key={m.month} value={m.month}>
                {m.label}
              </option>
            ))}
          </select>
          <span className="select-arrow" aria-hidden="true">▾</span>
        </div>
      </div>

      {/* MONTH SUMMARY REPORT CARD */}
      <div className="monthly-card-wrapper">
        <div className="monthly-summary-titlebar">
          <h3>Performance Report: {selectedData.label}</h3>
          <span className="report-badge">Official Monthly Range</span>
        </div>

        <div className="metal-summary-grid">
          {/* =========================================================
              22KT GOLD MONTHLY HIGHLIGHT
          ========================================================= */}
          <div className="metal-summary-card gold-border">
            <div className="summary-card-header">
              <div className="metal-pill-badge gold">22KT Gold (916)</div>
              {getGrowthBadge(selectedData.gold22GrowthAmount, selectedData.gold22GrowthPercentage)}
            </div>

            <div className="high-low-tiles">
              {/* Highest */}
              <div className="hl-tile hl-highest">
                <div className="hl-icon-label">
                  <span className="hl-icon">📈</span>
                  <span className="hl-label">Highest Rate</span>
                </div>
                <div className="hl-price">{formatMoney(selectedData.gold22High)}</div>
                <div className="hl-date">
                  Recorded: {selectedData.gold22HighDate || "—"}
                </div>
              </div>

              {/* Lowest */}
              <div className="hl-tile hl-lowest">
                <div className="hl-icon-label">
                  <span className="hl-icon">📉</span>
                  <span className="hl-label">Lowest Rate</span>
                </div>
                <div className="hl-price">{formatMoney(selectedData.gold22Low)}</div>
                <div className="hl-date">
                  Recorded: {selectedData.gold22LowDate || "—"}
                </div>
              </div>
            </div>

            <div className="hl-footer-note">
              <span>Monthly Volatility Spread:</span>
              <strong>
                ₹{selectedData.gold22High && selectedData.gold22Low
                  ? (Number(selectedData.gold22High) - Number(selectedData.gold22Low)).toLocaleString("en-IN")
                  : "—"}
              </strong>
            </div>
          </div>

          {/* =========================================================
              SILVER MONTHLY HIGHLIGHT
          ========================================================= */}
          <div className="metal-summary-card silver-border">
            <div className="summary-card-header">
              <div className="metal-pill-badge silver">Silver (999)</div>
              {getGrowthBadge(selectedData.silverGrowthAmount, selectedData.silverGrowthPercentage)}
            </div>

            <div className="high-low-tiles">
              {/* Highest */}
              <div className="hl-tile hl-highest">
                <div className="hl-icon-label">
                  <span className="hl-icon">📈</span>
                  <span className="hl-label">Highest Rate</span>
                </div>
                <div className="hl-price">{formatMoney(selectedData.silverHigh)}</div>
                <div className="hl-date">
                  Recorded: {selectedData.silverHighDate || "—"}
                </div>
              </div>

              {/* Lowest */}
              <div className="hl-tile hl-lowest">
                <div className="hl-icon-label">
                  <span className="hl-icon">📉</span>
                  <span className="hl-label">Lowest Rate</span>
                </div>
                <div className="hl-price">{formatMoney(selectedData.silverLow)}</div>
                <div className="hl-date">
                  Recorded: {selectedData.silverLowDate || "—"}
                </div>
              </div>
            </div>

            <div className="hl-footer-note">
              <span>Monthly Volatility Spread:</span>
              <strong>
                ₹{selectedData.silverHigh && selectedData.silverLow
                  ? (Number(selectedData.silverHigh) - Number(selectedData.silverLow)).toLocaleString("en-IN")
                  : "—"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
