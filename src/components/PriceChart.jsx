import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";


export default function PriceChart({ daily }) {

  if (!daily || daily.length === 0) {
    return (
      <div className="section">
        <h2>Price Chart</h2>
        <p>No chart data available.</p>
      </div>
    );
  }


  return (
    <div className="section">

      <h2>Daily Price Chart</h2>

      <div className="chart-container">

        <ResponsiveContainer
          width="100%"
          height={400}
        >

          <LineChart data={daily}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
            />

            <YAxis />

            <Tooltip />

            <Legend />


            <Line
              type="monotone"
              dataKey="gold22"
              name="22KT Gold"
              stroke="#d4af37"
              strokeWidth={3}
            />


            <Line
              type="monotone"
              dataKey="gold18"
              name="18KT Gold"
              stroke="#8884d8"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>
        <br />
        <ResponsiveContainer
          width="100%"
          height={400}
        >

          <LineChart data={daily}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
            />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="silver"
              name="Silver"
              stroke="#aaaaaa"
              strokeWidth={3}
            />
            

          </LineChart>

        </ResponsiveContainer>
        

      </div>

    </div>
  );
}