import { useState } from "react";

export default function MonthlySummary({ monthly }) {

  // IMPORTANT: Hook must be called before any return
  const [selectedMonth, setSelectedMonth] = useState("");

  // No data
  if (!monthly || monthly.length === 0) {
    return (
      <div className="section">
        <h2>Monthly High / Low</h2>
        <p>No monthly data available.</p>
      </div>
    );
  }

  // Select latest month automatically
  const currentMonth =
    selectedMonth || monthly[0].month;

  const selectedData = monthly.find(
    (month) => month.month === currentMonth
  );

  const money = (value) => {

    if (value === null || value === undefined) {
      return "—";
    }

    const number = Number(value);

    if (number < 0) {
      return `-₹${Math.abs(number).toLocaleString("en-IN")}`;
    }

    return `₹${number.toLocaleString("en-IN")}`;
  };


  const growthClass = (value) => {

    if (value > 0) {
      return "growth profit";
    }

    if (value < 0) {
      return "growth loss";
    }

    return "growth neutral";
  };


  const percentage = (value) => {

    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return "0.00%";
    }

    const number = Number(value);

    if (number > 0) {
      return `+${number.toFixed(2)}%`;
    }

    return `${number.toFixed(2)}%`;
  };


  return (
    <div className="section">

      {/* HEADER */}

      <div className="monthly-header">

        <h2>Monthly High Report</h2>

        <select
          value={currentMonth}
          onChange={(e) =>
            setSelectedMonth(e.target.value)
          }
        >

          {monthly.map((month) => (

            <option
              key={month.month}
              value={month.month}
            >
              {month.label}
            </option>

          ))}

        </select>

      </div>


      {/* SELECTED MONTH */}

      {selectedData && (

        <div className="month-card">

          <h3>{selectedData.label}</h3>


          {/* =========================
              22KT GOLD
          ========================= */}

          <div className="metal-section">

            <h4>22KT Gold</h4>

            <div className="high-low-grid">

              <div>

                <span>Highest</span>

                <strong>
                  {money(selectedData.gold22High)}
                </strong>

                <small>
                  {selectedData.gold22HighDate}
                </small>

              </div>


              <div>

                <span>Lowest</span>

                <strong>
                  {money(selectedData.gold22Low)}
                </strong>

                <small>
                  {selectedData.gold22LowDate}
                </small>

              </div>

            </div>


            <div
              className={growthClass(
                selectedData.gold22GrowthAmount
              )}
            >

              <span>Monthly Growth</span>

              <strong>
                {money(
                  selectedData.gold22GrowthAmount
                )}
              </strong>

              <b>
                (
                {percentage(
                  selectedData.gold22GrowthPercentage
                )}
                )
              </b>

            </div>

          </div>


          {/* =========================
              18KT GOLD
          ========================= */}


          {/* =========================
              SILVER
          ========================= */}

          <div className="metal-section">

            <h4>Silver</h4>

            <div className="high-low-grid">

              <div>

                <span>Highest</span>

                <strong>
                  {money(selectedData.silverHigh)}
                </strong>

                <small>
                  {selectedData.silverHighDate}
                </small>

              </div>


              <div>

                <span>Lowest</span>

                <strong>
                  {money(selectedData.silverLow)}
                </strong>

                <small>
                  {selectedData.silverLowDate}
                </small>

              </div>

            </div>


            <div
              className={growthClass(
                selectedData.silverGrowthAmount
              )}
            >

              <span>Monthly Growth</span>

              <strong>
                {money(
                  selectedData.silverGrowthAmount
                )}
              </strong>

              <b>
                (
                {percentage(
                  selectedData.silverGrowthPercentage
                )}
                )
              </b>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}