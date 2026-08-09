const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRJKbapQ3wTyiwvYt85MF0R75DLY4l7JuvpgoMJwkTXVn6aOxPQpSVIBJuZ4jwFuyoAwveWmfRFih6v/pub?gid=0&single=true&output=csv";

// ======================================================
// PARSE CSV
// ======================================================

function parseCSV(csv) {
  const lines = csv.trim().split(/\r?\n/);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0]
    .split(",")
    .map((header) =>
      header.trim().replace(/^"|"$/g, "")
    );

  console.log("HEADERS:", headers);

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i]
      .split(",")
      .map((value) =>
        value.trim().replace(/^"|"$/g, "")
      );

    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    rows.push(row);
  }

  return rows;
}

// ======================================================
// CONVERT ROW
// ======================================================

function convertRow(row) {
  console.log("RAW ROW:", row);

  return {
    date: row["Date"] || "",
    time: row["Time"] || "",

    // EXACT GOOGLE SHEET COLUMN NAMES
    gold22: Number(row["22KT Gold"]),
    gold18: Number(row["18KT Gold"]),
    silver: Number(row["Silver"]),
  };
}

// ======================================================
// PARSE DATE + TIME
// ======================================================

function parseDateTime(date, time) {
  if (!date) return null;

  const parts = date.split("/");

  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (time) {
    const timeParts = time.split(":");

    hours = Number(timeParts[0]) || 0;
    minutes = Number(timeParts[1]) || 0;
    seconds = Number(timeParts[2]) || 0;
  }

  const result = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    seconds
  );

  if (isNaN(result.getTime())) {
    return null;
  }

  return result;
}

// ======================================================
// MONTH KEY
// ======================================================

function getMonthKey(dateString) {
  if (!dateString) return null;

  const parts = dateString.split("/");

  if (parts.length !== 3) return null;

  const day = parts[0];
  const month = parts[1];
  const year = parts[2];

  return `${year}-${month}`;
}

// ======================================================
// MONTH NAME
// ======================================================

function getMonthName(monthKey) {
  const [year, month] = monthKey.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

// ======================================================
// DAILY GROWTH
// ======================================================

function calculateDailyGrowth(dailyData) {

  // OLD -> NEW
  const sorted = [...dailyData].sort((a, b) => {

    const dateA = parseDateTime(
      a.date,
      a.time
    );

    const dateB = parseDateTime(
      b.date,
      b.time
    );

    if (!dateA || !dateB) return 0;

    return dateA - dateB;
  });

  let previous = null;

  const result = sorted.map((row) => {

    const current = {
      ...row,

      gold22GrowthRs: null,
      gold22GrowthPercent: null,

      gold18GrowthRs: null,
      gold18GrowthPercent: null,

      silverGrowthRs: null,
      silverGrowthPercent: null,
    };

    // ================================================
    // 22KT GOLD
    // ================================================

    if (
      previous &&
      !Number.isNaN(row.gold22) &&
      !Number.isNaN(previous.gold22) &&
      previous.gold22 !== 0
    ) {

      const growth =
        row.gold22 - previous.gold22;

      current.gold22GrowthRs = growth;

      current.gold22GrowthPercent =
        Number(
          ((growth / previous.gold22) * 100)
            .toFixed(2)
        );
    }

    // ================================================
    // 18KT GOLD
    // ================================================

    if (
      previous &&
      !Number.isNaN(row.gold18) &&
      !Number.isNaN(previous.gold18) &&
      previous.gold18 !== 0
    ) {

      const growth =
        row.gold18 - previous.gold18;

      current.gold18GrowthRs = growth;

      current.gold18GrowthPercent =
        Number(
          ((growth / previous.gold18) * 100)
            .toFixed(2)
        );
    }

    // ================================================
    // SILVER
    // ================================================

    if (
      previous &&
      !Number.isNaN(row.silver) &&
      !Number.isNaN(previous.silver) &&
      previous.silver !== 0
    ) {

      const growth =
        row.silver - previous.silver;

      current.silverGrowthRs = growth;

      current.silverGrowthPercent =
        Number(
          ((growth / previous.silver) * 100)
            .toFixed(2)
        );
    }

    previous = row;

    return current;
  });

  // NEW -> OLD
  return result.reverse();
}

// ======================================================
// MONTHLY SUMMARY
// ======================================================

function calculateMonthlySummary(daily) {

  const monthlyMap = {};

  const today = new Date();

  today.setHours(
    23,
    59,
    59,
    999
  );

  // ====================================================
  // GROUP BY MONTH
  // ====================================================

  for (const row of daily) {

    const parsedDate =
      parseDateTime(
        row.date,
        row.time
      );

    if (!parsedDate) continue;

    if (parsedDate > today) continue;

    const monthKey =
      getMonthKey(row.date);

    if (!monthKey) continue;

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = [];
    }

    monthlyMap[monthKey].push({
      ...row,
      rowDate: parsedDate,
    });
  }

  const monthly = [];

  // ====================================================
  // PROCESS MONTHS
  // ====================================================

  for (const monthKey of Object.keys(monthlyMap)) {

    const rows =
      monthlyMap[monthKey];

    // OLD -> NEW
    rows.sort(
      (a, b) =>
        a.rowDate - b.rowDate
    );

    const first = rows[0];

    const last =
      rows[rows.length - 1];

    // ==================================================
    // FIND HIGH
    // ==================================================

    function findHigh(field) {

      let high = null;

      for (const row of rows) {

        if (Number.isNaN(row[field])) {
          continue;
        }

        if (
          high === null ||
          row[field] > high[field]
        ) {
          high = row;
        }
      }

      return high;
    }

    // ==================================================
    // FIND LOW
    // ==================================================

    function findLow(field) {

      let low = null;

      for (const row of rows) {

        if (Number.isNaN(row[field])) {
          continue;
        }

        if (
          low === null ||
          row[field] < low[field]
        ) {
          low = row;
        }
      }

      return low;
    }

    // ==================================================
    // GROWTH
    // ==================================================

    function growth(start, end) {

      if (
        Number.isNaN(start) ||
        Number.isNaN(end)
      ) {

        return {
          amount: null,
          percentage: null,
        };
      }

      const difference =
        end - start;

      if (start === 0) {

        return {
          amount: difference,
          percentage: 0,
        };
      }

      const percentage =
        (difference / start) * 100;

      return {
        amount: difference,

        percentage:
          Number(
            percentage.toFixed(2)
          ),
      };
    }

    // ==================================================
    // HIGH / LOW
    // ==================================================

    const gold22High =
      findHigh("gold22");

    const gold22Low =
      findLow("gold22");

    const gold18High =
      findHigh("gold18");

    const gold18Low =
      findLow("gold18");

    const silverHigh =
      findHigh("silver");

    const silverLow =
      findLow("silver");

    // ==================================================
    // GROWTH
    // ==================================================

    const gold22Growth =
      growth(
        first.gold22,
        last.gold22
      );

    const gold18Growth =
      growth(
        first.gold18,
        last.gold18
      );

    const silverGrowth =
      growth(
        first.silver,
        last.silver
      );

    // ==================================================
    // MONTH OBJECT
    // ==================================================

    monthly.push({

      month: monthKey,

      label:
        getMonthName(monthKey),

      // ==========================
      // 22KT GOLD
      // ==========================

      gold22High:
        gold22High
          ? gold22High.gold22
          : null,

      gold22HighDate:
        gold22High
          ? gold22High.date
          : null,

      gold22Low:
        gold22Low
          ? gold22Low.gold22
          : null,

      gold22LowDate:
        gold22Low
          ? gold22Low.date
          : null,

      // ==========================
      // 18KT GOLD
      // ==========================

      gold18High:
        gold18High
          ? gold18High.gold18
          : null,

      gold18HighDate:
        gold18High
          ? gold18High.date
          : null,

      gold18Low:
        gold18Low
          ? gold18Low.gold18
          : null,

      gold18LowDate:
        gold18Low
          ? gold18Low.date
          : null,

      // ==========================
      // SILVER
      // ==========================

      silverHigh:
        silverHigh
          ? silverHigh.silver
          : null,

      silverHighDate:
        silverHigh
          ? silverHigh.date
          : null,

      silverLow:
        silverLow
          ? silverLow.silver
          : null,

      silverLowDate:
        silverLow
          ? silverLow.date
          : null,

      // ==========================
      // MONTHLY GROWTH
      // ==========================

      gold22GrowthAmount:
        gold22Growth.amount,

      gold22GrowthPercentage:
        gold22Growth.percentage,

      gold18GrowthAmount:
        gold18Growth.amount,

      gold18GrowthPercentage:
        gold18Growth.percentage,

      silverGrowthAmount:
        silverGrowth.amount,

      silverGrowthPercentage:
        silverGrowth.percentage,
    });
  }

  // NEWEST MONTH FIRST
  monthly.sort(
    (a, b) =>
      b.month.localeCompare(a.month)
  );

  return monthly;
}

// ======================================================
// DASHBOARD API
// ======================================================

app.get(
  "/api/dashboard",
  async (req, res) => {

    try {

      console.log(
        "\nFetching Google Sheet..."
      );

      // =================================================
      // FETCH SHEET
      // =================================================

      const response =
        await fetch(SHEET_URL);

      if (!response.ok) {

        throw new Error(
          `Google Sheet returned ${response.status}`
        );
      }

      const csv =
        await response.text();

      console.log(
        "GOOGLE SHEET CSV:"
      );


      // =================================================
      // PARSE
      // =================================================

      const rows =
        parseCSV(csv);

      console.log(
        "PARSED ROWS:",
        rows
      );

      // =================================================
      // CONVERT
      // =================================================

      const dailyData =
        rows
          .map(convertRow)
          .filter(
            (row) => row.date
          );

      console.log(
        "DAILY DATA:",
        dailyData
      );

      // =================================================
      // DEBUG 18KT
      // =================================================

      console.log(
        "18KT GOLD VALUES:",
        dailyData.map(
          (row) => row.gold18
        )
      );

      // =================================================
      // DAILY GROWTH
      // =================================================

      const dailyWithGrowth =
        calculateDailyGrowth(
          dailyData
        );

      // =================================================
      // CURRENT
      // =================================================

      const current =
        dailyWithGrowth.length > 0
          ? dailyWithGrowth[0]
          : null;

      // =================================================
      // MONTHLY
      // =================================================

      const monthly =
        calculateMonthlySummary(
          dailyData
        );

      // =================================================
      // RESPONSE
      // =================================================

      res.json({

        success: true,

        current,

        monthly,

        daily:
          dailyWithGrowth,
      });

    } catch (error) {

      console.error(
        "ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          error.message,
      });
    }
  }
);

// ======================================================
// START SERVER
// ======================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Backend running on port ${PORT}`
    );
  }
);