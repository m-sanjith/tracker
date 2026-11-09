import { useState, useMemo } from "react";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
];

export default function MonthlySummary({ monthly }) {
  // Extract latest month & year from data
  const latestMonthKey = monthly?.[0]?.month || "2026-10";
  const [defaultYear, defaultMonth] = latestMonthKey.split("-");

  const [selectedYear, setSelectedYear] = useState(defaultYear || "2026");
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth || "10");

  // Extract distinct available years from dataset + current calendar year
  const availableYears = useMemo(() => {
    if (!monthly || monthly.length === 0) return [String(new Date().getFullYear())];
    const yearsSet = new Set(monthly.map((m) => m.month.split("-")[0]));
    const curYear = new Date().getFullYear();
    yearsSet.add(String(curYear));
    yearsSet.add(String(curYear - 1));
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [monthly]);

  // Which months have data in the selected year
  const monthsWithData = useMemo(() => {
    if (!monthly) return new Set();
    return new Set(
      monthly
        .filter((m) => m.month.split("-")[0] === selectedYear)
        .map((m) => m.month.split("-")[1].padStart(2, "0"))
    );
  }, [monthly, selectedYear]);

  if (!monthly || monthly.length === 0) {
    return (
      <div className="section" id="monthly">
        <div className="empty-state-card">
          <h3>Monthly High / Low Report</h3>
          <p>No monthly data currently available.</p>
        </div>
      </div>
    );
  }

  // Find record for selected month and year
  const selectedData = monthly.find((m) => {
    const [y, mth] = m.month.split("-");
    return y === selectedYear && mth.padStart(2, "0") === selectedMonth.padStart(2, "0");
  });

  const monthObj = MONTHS.find((m) => m.value === selectedMonth.padStart(2, "0"));
  const selectedMonthName = monthObj ? monthObj.label : selectedMonth;

  // Jump to latest available recorded month
  const handleJumpToLatest = () => {
    if (monthly && monthly[0]) {
      const [y, m] = monthly[0].month.split("-");
      setSelectedYear(y);
      setSelectedMonth(m.padStart(2, "0"));
    }
  };

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
      {/* SECTION HEADER WITH SEPARATE MONTH AND YEAR DROPDOWNS */}
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">Monthly Analytics</span>
          <h2 className="section-heading">High / Low Price Benchmark</h2>
        </div>

        {/* SEPARATE MONTH & YEAR SELECTORS */}
        <div className="filter-dropdowns-group">
          {/* Month Selector */}
          <div className="custom-select-wrap select-month">
            <select
              className="modern-select"
              value={selectedMonth.padStart(2, "0")}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Select Month"
            >
              {MONTHS.map((m) => {
                const hasData = monthsWithData.has(m.value);
                return (
                  <option key={m.value} value={m.value}>
                    {m.label} {hasData ? "•" : ""}
                  </option>
                );
              })}
            </select>
            <span className="select-arrow" aria-hidden="true">▾</span>
          </div>

          {/* Year Selector */}
          <div className="custom-select-wrap select-year">
            <select
              className="modern-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              aria-label="Select Year"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <span className="select-arrow" aria-hidden="true">▾</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          CONDITION 1: DATA AVAILABLE FOR SELECTED MONTH & YEAR
      ========================================================= */}
      {selectedData ? (
        <div className="monthly-card-wrapper">
          <div className="monthly-summary-titlebar">
            <h3>Performance Report: {selectedData.label || `${selectedMonthName} ${selectedYear}`}</h3>
            <span className="report-badge">Official Monthly Range</span>
          </div>

          <div className="metal-summary-grid">
            {/* 22KT GOLD */}
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

            {/* SILVER */}
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
      ) : (
        /* =========================================================
            CONDITION 2: OUT OF RANGE (NO RECORDS FOR SELECTED PERIOD)
        ========================================================= */
        <div className="out-of-range-card">
          <div className="out-of-range-icon" aria-hidden="true">📅</div>
          <h3>No Monthly Records for {selectedMonthName} {selectedYear}</h3>
          <p>
            Official bullion market recordings are not available for this period.
            Please choose another month or return to the most recent records.
          </p>
          <button className="reset-latest-btn" onClick={handleJumpToLatest}>
            View Latest Available ({monthly[0]?.label || "Latest Month"})
          </button>
        </div>
      )}
    </section>
  );
}
