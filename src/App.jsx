import { useEffect, useState, useCallback } from "react";
import PriceCards from "./components/PriceCards";
import MonthlySummary from "./components/MonthlySummary";
import PriceChart from "./components/PriceChart";
import DailyHistory from "./components/DailyHistory";
import "./App.css";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // ==================================================
  // FETCH DASHBOARD DATA
  // ==================================================
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetch("https://tracker-wdva.onrender.com/api/dashboard")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data from server.");
        }
        return response.json();
      })
      .then((result) => {
        setData(result);
        setError(null);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error("Dashboard refresh error:", err);
        setError(err.message);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetch("https://tracker-wdva.onrender.com/api/dashboard")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data from server.");
        }
        return response.json();
      })
      .then((result) => {
        if (!isMounted) return;
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Dashboard error:", err);
        setError(err.message);
        setLoading(false);
      });

    // Scroll listener for back-to-top button
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==================================================
  // LOADING STATE
  // ==================================================
  if (loading) {
    return (
      <div className="state-screen">
        <div className="loader-box">
          <div className="gold-spinner"></div>
          <h2>Loading DCNM Price Tracker</h2>
          <p>Connecting to live market records...</p>
        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR STATE
  // ==================================================
  if (error || !data || !data.current) {
    return (
      <div className="state-screen">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Connect to Live Feed</h2>
          <p>{error || "No dashboard data currently available."}</p>
          <button className="retry-btn" onClick={() => { setLoading(true); handleRefresh(); }}>
            🔄 Try Reconnecting
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // MAIN DASHBOARD
  // ==================================================
  return (
    <div className="app-shell">
      {/* =========================================================
          1. STICKY PROFESSIONAL HEADER / NAVBAR
      ========================================================= */}
      <header className="site-navbar">
        <div className="navbar-container">
          <a href="#top" className="navbar-brand" aria-label="DCNM Home">
            <span className="brand-emblem">D</span>
            <div className="brand-text-group">
              <span className="brand-title">DCNM</span>
              <span className="brand-subtitle">Bullion Tracker</span>
            </div>
          </a>

          {/* QUICK NAVIGATION LINKS */}
          <nav className="navbar-links" aria-label="Page navigation">
            <a href="#prices" className="nav-link">Live Rates</a>
            <a href="#chart" className="nav-link">Price Chart</a>
            <a href="#monthly" className="nav-link">Monthly High/Low</a>
            <a href="#history" className="nav-link">Daily Archive</a>
          </nav>

          {/* STATUS PILL & REFRESH ACTION */}
          <div className="navbar-actions">
            <div className="live-status-pill" title="Server feed active">
              <span className="pulsing-dot"></span>
              <span className="status-text">Market Live</span>
            </div>

            <button
              className={`refresh-btn ${refreshing ? "spinning" : ""}`}
              onClick={handleRefresh}
              aria-label="Refresh price feed"
              title="Click to refresh market rates"
              disabled={refreshing}
            >
              <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span className="refresh-label">{refreshing ? "Updating..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM / QUICK NAVIGATION BAR */}
      <div className="mobile-quick-nav">
        <a href="#prices" className="quick-nav-item">Rates</a>
        <a href="#chart" className="quick-nav-item">Chart</a>
        <a href="#monthly" className="quick-nav-item">Monthly</a>
        <a href="#history" className="quick-nav-item">History</a>
      </div>

      <main className="dashboard-content" id="top">
        {/* =========================================================
            2. HERO TITLE & LIVE METADATA
        ========================================================= */}
        <section className="dashboard-hero">
          <div className="hero-badge">
            <span>Official Daily Market Intelligence</span>
          </div>
          <h1 className="hero-headline">
            Gold & Silver <span className="gold-gradient-text">Live Price Tracker</span>
          </h1>
          <p className="hero-subtext">
            Track real-time 22KT and 18KT gold rates, silver prices, technical performance, and monthly volatility benchmarks.
          </p>

          {/* STATUS BANNER */}
          <div className="last-recorded-banner">
            <div className="recorded-item">
              <span className="rec-icon">📅</span>
              <span className="rec-label">Last Recorded:</span>
              <strong>{data.current.date}</strong>
            </div>
            <div className="rec-sep">•</div>
            <div className="recorded-item">
              <span className="rec-icon">⏰</span>
              <span className="rec-label">Time:</span>
              <strong>{data.current.time}</strong>
            </div>
            <div className="rec-sep">•</div>
            <div className="recorded-item source-badge">
              <span className="rec-icon">🔒</span>
              <span>DCNM Verified Records</span>
            </div>
          </div>
        </section>

        {/* =========================================================
            3. LIVE PRICE CARDS
        ========================================================= */}
        <PriceCards current={data.current} />

        {/* =========================================================
            4. INTERACTIVE GOOGLE FINANCE CHART (WITH INTERVALS)
        ========================================================= */}
        <div id="chart">
          <PriceChart daily={data.daily || []} />
        </div>

        {/* =========================================================
            5. MONTHLY HIGH / LOW SUMMARY REPORT
        ========================================================= */}
        <MonthlySummary monthly={data.monthly || []} />

        {/* =========================================================
            6. DAILY ARCHIVE & HISTORY
        ========================================================= */}
        <DailyHistory daily={data.daily || []} />
      </main>

      {/* =========================================================
          7. PROFESSIONAL FOOTER (Like Lakshana Portfolio)
      ========================================================= */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <span className="brand-emblem-small">D</span>
              <strong>DCNM Jewellers</strong>
            </div>
            <p className="footer-tagline">
              Excellence in Gold & Silver bullion tracking. Designed for accuracy, transparency, and effortless market monitoring on mobile and desktop.
            </p>
          </div>

          <div className="footer-nav-col">
            <h4>Quick Jump</h4>
            <div className="footer-links">
              <a href="#prices">Live Prices</a>
              <a href="#chart">Interactive Chart</a>
              <a href="#monthly">Monthly Benchmarks</a>
              <a href="#history">Daily Records Archive</a>
            </div>
          </div>

          <div className="footer-info-col">
            <h4>Market Disclaimer</h4>
            <p className="footer-disclaimer">
              Bullion rates are subject to market fluctuations. Rates displayed are based on official DCNM records updated daily.
            </p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>© {new Date().getFullYear()} DCNM Price Tracker • Built with Precision</span>
          <span className="footer-credit">Crafted for seamless mobile & desktop experience</span>
        </div>
      </footer>

      {/* =========================================================
          8. BACK TO TOP FLOATING BUTTON
      ========================================================= */}
      {showBackToTop && (
        <button
          className="back-to-top-btn"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Scroll back to top"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
