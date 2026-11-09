import { useState } from "react";

export default function DailyHistory({ daily }) {
  const [selectedMonth, setSelectedMonth] = useState(
    daily && daily.length > 0 ? daily[0].date.substring(3) : ""
  );
  // View toggle: 'cards' or 'table'
  const [viewMode, setViewMode] = useState("auto"); // auto: cards on mobile, table on desktop

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

  // Extract distinct MM/YYYY months
  const months = [
    ...new Set(
      daily.map((row) => {
        const parts = row.date.split("/");
        return `${parts[1]}/${parts[2]}`;
      })
    )
  ];

  // Filter daily records for selected month
  const filteredDaily = daily.filter((row) => {
    const parts = row.date.split("/");
    const rowMonth = `${parts[1]}/${parts[2]}`;
    return rowMonth === selectedMonth;
  });

  function getMonthLabel(monthYear) {
    const [month, year] = monthYear.split("/");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString("en-IN", {
      month: "long",
      year: "numeric"
    });
  }

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
      {/* SECTION HEADER */}
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

          {/* MONTH SELECTOR */}
          <div className="custom-select-wrap">
            <select
              className="modern-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {getMonthLabel(month)}
                </option>
              ))}
            </select>
            <span className="select-arrow" aria-hidden="true">▾</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          VIEW 1: RESPONSIVE CARDS VIEW (PERFECT FOR MOBILE)
      ========================================================= */}
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

      {/* =========================================================
          VIEW 2: DESKTOP & FULL DATA SPREADSHEET TABLE
      ========================================================= */}
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
    </section>
  );
}
