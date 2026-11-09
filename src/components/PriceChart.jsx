import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import "./PriceChart.css";

// Parse "DD/MM/YYYY" safely to Date object
function parseDateString(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("/").map(Number);
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return new Date(year, month - 1, day);
}

// Format date for X-Axis based on selected interval
function formatXAxisDate(dateStr, interval) {
  if (!dateStr) return "";
  const parts = dateStr.split("/").map(Number);
  if (parts.length !== 3) return dateStr;
  const [d, m, y] = parts;
  const dateObj = new Date(y, m - 1, d);

  if (interval === "10D" || interval === "1M") {
    return dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  if (interval === "3M") {
    return dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  return dateObj.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

// Format date for tooltip
function formatTooltipDate(item) {
  if (!item) return "";
  let formatted = item.date;
  if (item.dateObj) {
    formatted = item.dateObj.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }
  return item.time ? `${formatted} • ${item.time}` : formatted;
}

export default function PriceChart({ daily }) {
  const [selectedMetal, setSelectedMetal] = useState("gold22");
  const [interval, setInterval] = useState("1M");
  const [hoveredData, setHoveredData] = useState(null);

  // Available intervals
  const INTERVALS = [
    { key: "10D", label: "10D", name: "10 days" },
    { key: "1M", label: "1M", name: "1 month" },
    { key: "3M", label: "3M", name: "3 months" },
    { key: "1Y", label: "1Y", name: "1 year" },
    { key: "MAX", label: "Max", name: "all time" }
  ];

  // Metal choices
  const METALS = [
    { key: "gold22", label: "22KT Gold" },
    { key: "gold18", label: "18KT Gold" },
    { key: "silver", label: "Silver" },
    { key: "compare_gold", label: "Compare Gold" }
  ];

  // 1. Sort all raw data chronologically (oldest to newest: Left -> Right)
  const sortedData = useMemo(() => {
    if (!daily || daily.length === 0) return [];
    return [...daily]
      .map((item) => ({
        ...item,
        dateObj: parseDateString(item.date)
      }))
      .filter((item) => item.dateObj !== null)
      .sort((a, b) => a.dateObj - b.dateObj);
  }, [daily]);

  // 2. Filter data by selected interval
  const filteredData = useMemo(() => {
    if (sortedData.length === 0) return [];
    if (interval === "MAX") return sortedData;

    const latest = sortedData[sortedData.length - 1].dateObj;
    const cutoff = new Date(latest);

    if (interval === "10D") {
      cutoff.setDate(cutoff.getDate() - 10);
    } else if (interval === "1M") {
      cutoff.setMonth(cutoff.getMonth() - 1);
    } else if (interval === "3M") {
      cutoff.setMonth(cutoff.getMonth() - 3);
    } else if (interval === "1Y") {
      cutoff.setFullYear(cutoff.getFullYear() - 1);
    }

    const result = sortedData.filter((d) => d.dateObj >= cutoff);

    // Fallback if sparse dates in the chosen interval
    if (result.length < 2) {
      if (interval === "10D") return sortedData.slice(-10);
      if (interval === "1M") return sortedData.slice(-30);
      return sortedData;
    }

    return result;
  }, [sortedData, interval]);

  if (!daily || daily.length === 0 || sortedData.length === 0) {
    return (
      <div className="section">
        <h2>Price Chart</h2>
        <p>No chart data available.</p>
      </div>
    );
  }

  // Active data point for header stats (hovered point if mouse over chart, otherwise latest point)
  const latestItem = filteredData[filteredData.length - 1] || sortedData[sortedData.length - 1];
  const firstItem = filteredData[0] || sortedData[0];
  const activeItem = hoveredData || latestItem;

  // Single metal stats calculation
  const targetKey = selectedMetal === "compare_gold" ? "gold22" : selectedMetal;
  const currentPrice = Number(activeItem?.[targetKey] || 0);
  const basePrice = Number(firstItem?.[targetKey] || 0);
  const priceDiff = currentPrice - basePrice;
  const percentChange = basePrice > 0 ? (priceDiff / basePrice) * 100 : 0;
  const isPositive = priceDiff >= 0;

  // Dynamic Theme Colors: Green if price went up, Red if price went down (Google Finance style)
  const chartColor = isPositive ? "#26a69a" : "#ef5350";

  // Calculate dynamic Y-axis bounds to prevent squashing and leave breathing room
  const yDomain = (() => {
    const values = filteredData
      .map((d) => {
        if (selectedMetal === "compare_gold") {
          return [Number(d.gold22), Number(d.gold18)];
        }
        return [Number(d[selectedMetal])];
      })
      .flat()
      .filter((v) => Number.isFinite(v) && v > 0);

    if (values.length === 0) return [0, 100];
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const span = maxVal - minVal;
    const padding = span > 0 ? span * 0.15 : (maxVal * 0.05 || 10);
    return [
      Math.max(0, Math.floor(minVal - padding)),
      Math.ceil(maxVal + padding)
    ];
  })();

  const activeIntervalName = INTERVALS.find((i) => i.key === interval)?.name || "";

  return (
    <div className="section">
      <div className="finance-chart-card">
        {/* =========================================================
            TOP BAR: METAL SELECTOR & INTERVAL TABS
        ========================================================= */}
        <div className="chart-top-bar">
          {/* Metal Selector */}
          <div className="metal-pills">
            {METALS.map((m) => (
              <button
                key={m.key}
                className={`metal-pill ${selectedMetal === m.key ? "active" : ""}`}
                onClick={() => setSelectedMetal(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Interval Selector Tabs (Matching Google Finance) */}
          <div className="interval-tabs">
            {INTERVALS.map((item) => (
              <button
                key={item.key}
                className={`interval-tab ${interval === item.key ? "active" : ""}`}
                onClick={() => setInterval(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================
            PRICE SUMMARY HEADER (Updates in real-time on hover)
        ========================================================= */}
        <div className="chart-summary-bar">
          <div className="chart-price-display">
            <span className="chart-metal-label">
              {METALS.find((m) => m.key === selectedMetal)?.label} Price
            </span>
            <div className="chart-main-price">
              ₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="chart-change-row">
              <span className={isPositive ? "change-up" : "change-down"}>
                {isPositive ? "▲ +" : "▼ "}₹
                {Math.abs(priceDiff).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}{" "}
                ({isPositive ? "+" : ""}
                {percentChange.toFixed(2)}%)
              </span>
              <span className="change-period">
                {hoveredData ? `at ${formatTooltipDate(hoveredData)}` : `past ${activeIntervalName}`}
              </span>
            </div>
          </div>

          {hoveredData && (
            <div className="chart-hover-indicator">
              Hovering over chart data
            </div>
          )}
        </div>

        {/* =========================================================
            CHART VIEWPORT (AREA CHART WITH CLEAN GRADIENT, NO NOISE)
        ========================================================= */}
        <div className="chart-viewport">
          <ResponsiveContainer width="100%" height={380}>
            {selectedMetal === "compare_gold" ? (
              /* Multi-Line View for comparing 22KT & 18KT */
              <LineChart
                data={filteredData}
                onMouseMove={(e) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setHoveredData(e.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredData(null)}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#232734" />
                <XAxis
                  dataKey="date"
                  stroke="#787f8d"
                  tickLine={false}
                  axisLine={{ stroke: "#2a2e39" }}
                  tick={{ fill: "#787f8d", fontSize: 12 }}
                  tickFormatter={(val) => formatXAxisDate(val, interval)}
                  minTickGap={25}
                />
                <YAxis
                  domain={yDomain}
                  stroke="#787f8d"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#787f8d", fontSize: 12 }}
                  tickFormatter={(v) => v.toLocaleString("en-IN")}
                  orientation="left"
                />
                <Tooltip
                  cursor={{ stroke: "#64748b", strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="chart-custom-tooltip">
                        <div className="tooltip-date-line">{formatTooltipDate(p)}</div>
                        <div className="tooltip-multi-row">
                          <span>
                            <span className="tooltip-legend-dot" style={{ background: "#d4af37" }}></span>
                            22KT Gold:
                          </span>
                          <strong>₹{Number(p.gold22).toLocaleString("en-IN")}</strong>
                        </div>
                        <div className="tooltip-multi-row">
                          <span>
                            <span className="tooltip-legend-dot" style={{ background: "#818cf8" }}></span>
                            18KT Gold:
                          </span>
                          <strong>₹{Number(p.gold18).toLocaleString("en-IN")}</strong>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ color: "#9aa0a6", paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="gold22"
                  name="22KT Gold"
                  stroke="#d4af37"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#d4af37", stroke: "#ffffff", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="gold18"
                  name="18KT Gold"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#818cf8", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              /* Google Finance Style Single Metal Area Chart */
              <AreaChart
                data={filteredData}
                onMouseMove={(e) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setHoveredData(e.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredData(null)}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#232734" />
                <XAxis
                  dataKey="date"
                  stroke="#787f8d"
                  tickLine={false}
                  axisLine={{ stroke: "#2a2e39" }}
                  tick={{ fill: "#787f8d", fontSize: 12 }}
                  tickFormatter={(val) => formatXAxisDate(val, interval)}
                  minTickGap={25}
                />
                <YAxis
                  domain={yDomain}
                  stroke="#787f8d"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#787f8d", fontSize: 12 }}
                  tickFormatter={(v) => v.toLocaleString("en-IN")}
                  orientation="left"
                />
                <Tooltip
                  cursor={{ stroke: "#64748b", strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const p = payload[0].payload;
                    const val = payload[0].value;
                    return (
                      <div className="chart-custom-tooltip">
                        <div className="tooltip-price-line">
                          ₹{Number(val).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                        <div className="tooltip-date-line">{formatTooltipDate(p)}</div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetal}
                  stroke={chartColor}
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: chartColor,
                    stroke: "#ffffff",
                    strokeWidth: 2
                  }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}