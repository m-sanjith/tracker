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

export default function DailyHistory({ daily }) {
  // Extract latest date parts from first record
  const latestDateParts = daily?.[0]?.date ? daily[0].date.split("/") : null;
  const defaultYear = latestDateParts?.[2] || "2026";
  const defaultMonth = latestDateParts?.[1]?.padStart(2, "0") || "10";

  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [viewMode, setViewMode] = useState("auto"); // auto: cards on mobile, table on desktop

  // Extract distinct available years from daily dataset + current calendar year
  const availableYears = useMemo(() => {
    if (!daily || daily.length === 0) return [String(new Date().getFullYear())];
    const yearsSet = new Set();
    daily.forEach((r) => {
      if (r.date) {
        const parts = r.date.split("/");
        if (parts[2]) yearsSet.add(parts[2]);
      }
    });
    const curYear = new Date().getFullYear();
    yearsSet.add(String(curYear));
    yearsSet.add(String(curYear - 1));
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [daily]);

  // Which months have records in the selected year
  const monthsWithData = useMemo(() => {
    if (!daily) return new Set();
    const monthsSet = new Set();
    daily.forEach((r) => {
      if (r.date) {
        const parts = r.date.split("/");
        if (parts[2] === selectedYear && parts[1]) {
          monthsSet.add(parts[1].padStart(2, "0"));
        }
      }
    });
    return monthsSet;
  }, [daily, selectedYear]);

  if (!daily || daily.length === 0) {
    return (
      <section className="section" id="history">
        <div className="empty-state-card">
          <h3>Daily History</h3>
          <p>No daily data available.</p>
        </div>
      </section>
    );
  }

  // Filter daily records matching selected month and year
  const filteredDaily = daily.filter((row) => {
    if (!row.date) return false;
    const parts = row.date.split("/");
    return (
      parts[2] === selectedYear &&
      parts[1].padStart(2, "0") === selectedMonth.padStart(2, "0")
    );
  });

  const monthObj = MONTHS.find((m) => m.value === selectedMonth.padStart(2, "0"));
  const selectedMonthName = monthObj ? monthObj.label : selectedMonth;

  // Jump to latest available daily records
  const handleJumpToLatest = () => {
    if (daily && daily[0]?.date) {
      const parts = daily[0].date.split("/");
      setSelectedYear(parts[2]);
      setSelectedMonth(parts[1].padStart(2, "0"));
    }
  };

  function getGrowthBadge(valueRs, valuePercent) {
    if (valueRs === null || valueRs === undefined) return <span className="growth-empty">—</span>;
    const isUp = valueRs > 0;
    const isDown = valueRs < 0;
    const cls = isUp ? "badge-profit" : isDown ? "badge-loss" : "badge-neutral";
    const sign = isUp ? "+" : "";

    return (
      <div className={`table-growth-pill ${cls}`}>
        <span className="growth-rs">
          {sign}₹{valueRs.toLocaleString("en-IN")}
        </span>
        {valuePercent !== null && valuePercent !== undefined && (
          <span className="growth-pct">
            ({sign}{valuePercent.toFixed(2)}%)
          </span>
        )}
      </div>
    );
  }

  return (
    <section className="section daily-history-section" id="history">
      {/* SECTION HEADER WITH SEPARATE MONTH AND YEAR DROPDOWNS */}
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">Audit & Archive</span>
          <h2 className="section-heading">Daily Market Records</h2>
        </div>

        <div className="history-controls-bar">
          {/* VIEW SWITCHER (CARDS VS TABLE) */}
          <div className="view-mode-toggle" role="group" aria-label="Choose record view">
            <button
              type="button"
              className={`view-btn ${viewMode === "auto" || viewMode === "cards" ? "active" : ""}`}
              onClick={() => setViewMode(viewMode === "cards" ? "auto" : "cards")}
              title="Card view for phones and quick scanning"
            >
              Cards
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Full detailed spreadsheet table"
            >
              Table
            </button>
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
      </div>

      {/* =========================================================
          CONDITION 1: RECORDS EXIST FOR SELECTED MONTH & YEAR
      ========================================================= */}
      {filteredDaily.length > 0 ? (
        <>
          {/* VIEW 1: RESPONSIVE CARDS VIEW (PERFECT FOR MOBILE) */}
          <div className={`daily-cards-container ${viewMode === "table" ? "force-hidden" : ""}`}>
            {filteredDaily.map((row, index) => (
              <div key={`card-${index}`} className="history-record-card">
                <div className="record-card-top">
                  <div className="record-date-badge">
                    <span className="calendar-icon">📅</span>
                    <span className="record-date-text">{row.date}</span>
                    {row.time && <span className="record-time-text">• {row.time}</span>}
                  </div>
                </div>

                <div className="record-card-rates">
                  {/* 22KT Gold */}
                  <div className="record-rate-box">
                    <span className="rate-box-label">22KT Gold (1g)</span>
                    <div className="rate-box-val">
                      ₹{row.gold22 !== null && !Number.isNaN(row.gold22) ? row.gold22.toLocaleString("en-IN") : "—"}
                    </div>
                    <div className="rate-box-growth">
                      {getGrowthBadge(row.gold22GrowthRs, row.gold22GrowthPercent)}
                    </div>
                  </div>

                  {/* Silver */}
                  <div className="record-rate-box">
                    <span className="rate-box-label">Silver (1g)</span>
                    <div className="rate-box-val">
                      ₹{row.silver !== null && !Number.isNaN(row.silver) ? row.silver.toLocaleString("en-IN") : "—"}
                    </div>
                    <div className="rate-box-growth">
                      {getGrowthBadge(row.silverGrowthRs, row.silverGrowthPercent)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* VIEW 2: DESKTOP & FULL DATA SPREADSHEET TABLE */}
          <div className={`table-container-card ${viewMode === "cards" ? "force-hidden" : ""}`}>
            <div className="table-scroll-hint">
              <span>↔ Scroll horizontally to view full table on smaller screens</span>
            </div>

            <div className="table-responsive-wrapper">
              <table className="modern-data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>22KT Gold (1g)</th>
                    <th>22KT Day Change</th>
                    <th>Silver (1g)</th>
                    <th>Silver Day Change</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDaily.map((row, index) => (
                    <tr key={`table-${index}`}>
                      <td className="cell-date">{row.date}</td>
                      <td className="cell-time">{row.time || "—"}</td>
                      <td className="cell-rate cell-gold">
                        ₹{row.gold22 !== null && !Number.isNaN(row.gold22) ? row.gold22.toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="cell-growth">
                        {getGrowthBadge(row.gold22GrowthRs, row.gold22GrowthPercent)}
                      </td>
                      <td className="cell-rate cell-silver">
                        ₹{row.silver !== null && !Number.isNaN(row.silver) ? row.silver.toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="cell-growth">
                        {getGrowthBadge(row.silverGrowthRs, row.silverGrowthPercent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* =========================================================
            CONDITION 2: OUT OF RANGE (NO RECORDS FOR SELECTED PERIOD)
        ========================================================= */
        <div className="out-of-range-card">
          <div className="out-of-range-icon" aria-hidden="true">🔍</div>
          <h3>No Daily Records for {selectedMonthName} {selectedYear}</h3>
          <p>
            No bullion transactions or daily market prices were recorded in the system for this month.
            Choose another period or jump to the latest available entries.
          </p>
          <button className="reset-latest-btn" onClick={handleJumpToLatest}>
            View Latest Records ({defaultMonth}/{defaultYear})
          </button>
        </div>
      )}
    </section>
  );
}
