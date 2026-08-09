import { useEffect, useState } from "react";

import PriceCards from "./components/PriceCards";
import MonthlySummary from "./components/MonthlySummary";
import PriceChart from "./components/PriceChart";
import DailyHistory from "./components/DailyHistory";

import "./App.css";


export default function App() {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  // ==================================================
  // FETCH DASHBOARD DATA
  // ==================================================

  useEffect(() => {

    fetch(
  `${import.meta.env.VITE_API_URL}/api/dashboard`
)

      .then((response) => {

        if (!response.ok) {

          throw new Error(
            "Failed to fetch dashboard data"
          );

        }

        return response.json();

      })

      .then((result) => {

        console.log(
          "Backend data:",
          result
        );

        setData(result);

        setLoading(false);

      })

      .catch((error) => {

        console.error(
          "Dashboard error:",
          error
        );

        setError(
          error.message
        );

        setLoading(false);

      });

  }, []);


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (
      <div className="loading">

        Loading DCNM Price Tracker...

      </div>
    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error) {

    return (
      <div className="error">

        <h2>
          Unable to load dashboard
        </h2>

        <p>
          {error}
        </p>

        <p>
          Make sure your backend is running at:
        </p>

        <strong>
          http://localhost:3001
        </strong>

      </div>
    );

  }


  // ==================================================
  // NO DATA
  // ==================================================

  if (
    !data ||
    !data.current
  ) {

    return (
      <div className="error">

        <h2>
          No dashboard data available
        </h2>

        <p>
          Please check whether the backend
          is running on port 3001.
        </p>

      </div>
    );

  }


  // ==================================================
  // DASHBOARD
  // ==================================================

  return (

    <div className="app">


      {/* ============================================
          HEADER
      ============================================ */}

      <header className="header">

        <h1>
          DCNM Price Tracker
        </h1>

      </header>


      {/* ============================================
          CURRENT PRICES
      ============================================ */}

      <PriceCards
        current={data.current}
      />


      {/* ============================================
          LAST RECORDED
      ============================================ */}

      <div className="last-recorded">

        <span>
          Last Recorded
        </span>

        <strong>
          Date: {data.current.date}
        </strong>

        <strong>
          Time: {data.current.time}
        </strong>

      </div>


      {/* ============================================
          MONTHLY SUMMARY
      ============================================ */}

      <MonthlySummary
        monthly={
          data.monthly || []
        }
      />


      {/* ============================================
          PRICE CHART
      ============================================ */}

      <PriceChart
        daily={
          data.daily || []
        }
      />


      {/* ============================================
          DAILY HISTORY
      ============================================ */}

      <DailyHistory
        daily={
          data.daily || []
        }
      />


    </div>

  );

}