import { useState } from "react";

export default function DailyHistory({ daily }) {

  const [selectedMonth, setSelectedMonth] = useState(
    daily && daily.length > 0
      ? daily[0].date.substring(3)
      : ""
  );

  if (!daily || daily.length === 0) {
    return (
      <div className="section">
        <h2>Daily History</h2>
        <p>No daily data available.</p>
      </div>
    );
  }

  // ============================================
  // GET AVAILABLE MONTHS
  // ============================================

  const months = [
    ...new Set(
      daily.map((row) => {
        const parts = row.date.split("/");

        // MM/YYYY
        return `${parts[1]}/${parts[2]}`;
      })
    )
  ];

  // ============================================
  // FILTER SELECTED MONTH
  // ============================================

  const filteredDaily = daily.filter((row) => {

    const parts = row.date.split("/");

    const rowMonth =
      `${parts[1]}/${parts[2]}`;

    return rowMonth === selectedMonth;
  });

  // ============================================
  // MONTH LABEL
  // ============================================

  function getMonthLabel(monthYear) {

    const [month, year] =
      monthYear.split("/");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      1
    );

    return date.toLocaleString(
      "en-IN",
      {
        month: "long",
        year: "numeric"
      }
    );
  }

  // ============================================
  // GROWTH COLOR
  // ============================================

  function getGrowthClass(value) {

    if (value > 0) {
      return "growth-profit";
    }

    if (value < 0) {
      return "growth-loss";
    }

    return "growth-neutral";
  }

  // ============================================
  // FORMAT ₹
  // ============================================

  function formatGrowthRs(value) {

    if (
      value === null ||
      value === undefined
    ) {
      return "-";
    }

    if (value > 0) {
      return `+₹${value.toLocaleString("en-IN")}`;
    }

    if (value < 0) {
      return `-₹${Math.abs(value).toLocaleString("en-IN")}`;
    }

    return "₹0";
  }

  // ============================================
  // FORMAT %
  // ============================================

  function formatGrowthPercent(value) {

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    if (value > 0) {
      return `(+${value.toFixed(2)}%)`;
    }

    if (value < 0) {
      return `(${value.toFixed(2)}%)`;
    }

    return "(0.00%)";
  }

  // ============================================
  // RENDER
  // ============================================

  return (

    <section className="section">

      {/* ================================
          HEADER + DROPDOWN
      ================================= */}

      <div className="daily-header">

        <h2>
          Daily History
        </h2>

        <select
          value={selectedMonth}
          onChange={(e) =>
            setSelectedMonth(e.target.value)
          }
        >

          {months.map((month) => (

            <option
              key={month}
              value={month}
            >
              {getMonthLabel(month)}
            </option>

          ))}

        </select>

      </div>


      {/* ================================
          TABLE
      ================================= */}

      <div className="table-container">

        <table>

          <thead>

            <tr>

              <th>Date</th>

              <th>Time</th>

              <th>22KT Gold</th>

              <th>22KT Growth</th>

              <th>Silver</th>

              <th>Silver Growth</th>

            </tr>

          </thead>


          <tbody>

            {filteredDaily.map(
              (row, index) => {

                return (

                  <tr key={index}>

                    <td>
                      {row.date}
                    </td>

                    <td>
                      {row.time}
                    </td>


                    {/* 22KT */}

                    <td>
                      ₹
                      {row.gold22 !== null &&
                      !Number.isNaN(row.gold22)
                        ? row.gold22.toLocaleString(
                            "en-IN"
                          )
                        : "-"
                      }
                    </td>


                    <td
                      className={getGrowthClass(
                        row.gold22GrowthRs
                      )}
                    >

                      <strong>
                        {formatGrowthRs(
                          row.gold22GrowthRs
                        )}
                      </strong>

                      <br />

                      <small>
                        {formatGrowthPercent(
                          row.gold22GrowthPercent
                        )}
                      </small>

                    </td>


                    {/* 18KT */}

    


                    {/* SILVER */}

                    <td>
                      ₹
                      {row.silver !== null &&
                      !Number.isNaN(row.silver)
                        ? row.silver.toLocaleString(
                            "en-IN"
                          )
                        : "-"
                      }
                    </td>


                    <td
                      className={getGrowthClass(
                        row.silverGrowthRs
                      )}
                    >

                      <strong>
                        {formatGrowthRs(
                          row.silverGrowthRs
                        )}
                      </strong>

                      <br />

                      <small>
                        {formatGrowthPercent(
                          row.silverGrowthPercent
                        )}
                      </small>

                    </td>

                  </tr>

                );

              }
            )}

          </tbody>

        </table>

      </div>

    </section>

  );
}