export default function PriceCards({ current }) {
  if (!current) return null;

  const formatPrice = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "—";
    }
    return Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calcSubPrice = (pricePerGram, multiplier) => {
    if (!pricePerGram || Number.isNaN(Number(pricePerGram))) return null;
    return (Number(pricePerGram) * multiplier).toLocaleString("en-IN", {
      maximumFractionDigits: 0
    });
  };

  return (
    <section className="price-cards-section" id="prices">
      <div className="price-cards-grid">
        {/* =========================================================
            22KT GOLD CARD
        ========================================================= */}
        <div className="asset-card asset-card-gold22">
          <div className="card-top">
            <div className="metal-badge badge-gold">
              <span className="badge-dot"></span>
              916 Hallmarked
            </div>
            <span className="metal-purity-tag">91.6% Pure</span>
          </div>

          <div className="card-body">
            <h3 className="asset-title">22KT Gold</h3>
            <div className="asset-rate-wrap">
              <span className="currency-symbol">₹</span>
              <span className="asset-rate">{formatPrice(current.gold22)}</span>
              <span className="rate-unit">/ 1 gram</span>
            </div>
          </div>

          <div className="card-footer-metrics">
            <div className="sub-metric">
              <span className="sub-metric-label">8g (1 Pavan)</span>
              <span className="sub-metric-val">
                ₹{calcSubPrice(current.gold22, 8) || "—"}
              </span>
            </div>
            <div className="metric-divider"></div>
            <div className="sub-metric">
              <span className="sub-metric-label">10 grams</span>
              <span className="sub-metric-val">
                ₹{calcSubPrice(current.gold22, 10) || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            18KT GOLD CARD
        ========================================================= */}
        <div className="asset-card asset-card-gold18">
          <div className="card-top">
            <div className="metal-badge badge-gold18">
              <span className="badge-dot"></span>
              750 Hallmarked
            </div>
            <span className="metal-purity-tag">75.0% Pure</span>
          </div>

          <div className="card-body">
            <h3 className="asset-title">18KT Gold</h3>
            <div className="asset-rate-wrap">
              <span className="currency-symbol">₹</span>
              <span className="asset-rate">{formatPrice(current.gold18)}</span>
              <span className="rate-unit">/ 1 gram</span>
            </div>
          </div>

          <div className="card-footer-metrics">
            <div className="sub-metric">
              <span className="sub-metric-label">8g (1 Pavan)</span>
              <span className="sub-metric-val">
                ₹{calcSubPrice(current.gold18, 8) || "—"}
              </span>
            </div>
            <div className="metric-divider"></div>
            <div className="sub-metric">
              <span className="sub-metric-label">10 grams</span>
              <span className="sub-metric-val">
                ₹{calcSubPrice(current.gold18, 10) || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            SILVER CARD
        ========================================================= */}
        <div className="asset-card asset-card-silver">
          <div className="card-top">
            <div className="metal-badge badge-silver">
              <span className="badge-dot"></span>
              999 Fine Silver
            </div>
            <span className="metal-purity-tag">99.9% Pure</span>
          </div>

          <div className="card-body">
            <h3 className="asset-title">Silver</h3>
            <div className="asset-rate-wrap">
              <span className="currency-symbol">₹</span>
              <span className="asset-rate">{formatPrice(current.silver)}</span>
              <span className="rate-unit">/ 1 gram</span>
            </div>
          </div>

          <div className="card-footer-metrics">
            <div className="sub-metric">
              <span className="sub-metric-label">10 grams</span>
              <span className="sub-metric-val">
                ₹{calcSubPrice(current.silver, 10) || "—"}
              </span>
            </div>
            <div className="metric-divider"></div>
            <div className="sub-metric">
              <span className="sub-metric-label">1 Kilogram</span>
              <span className="sub-metric-val">
                ₹{calcSubPrice(current.silver, 1000) || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
