"use client";

import { useRef, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function StockLevelChart() {
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    stockIn: [] as number[],
    stockOut: [] as number[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockLevelData();
  }, []);

  const fetchStockLevelData = async () => {
    setLoading(true);
    try {
      // Get the last 6 months
      const months = [];
      const stockIn = [];
      const stockOut = [];

      const today = new Date();

      for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = month.toLocaleString("default", { month: "short" });
        months.push(monthName);

        // Start of month
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const startTimestamp = Timestamp.fromDate(startOfMonth);

        // End of month
        const endOfMonth = new Date(
          month.getFullYear(),
          month.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        const endTimestamp = Timestamp.fromDate(endOfMonth);

        // Query for stock in (departures)
        const departuresQuery = query(
          collection(db, "transactions"),
          where("type", "==", "departure"),
          where("date", ">=", startTimestamp),
          where("date", "<=", endTimestamp)
        );

        const departuresSnapshot = await getDocs(departuresQuery);
        let monthStockIn = 0;

        departuresSnapshot.forEach((doc) => {
          const data = doc.data();
          monthStockIn += data.items || 0;
        });

        stockIn.push(monthStockIn);

        // Query for stock out (returns)
        const returnsQuery = query(
          collection(db, "transactions"),
          where("type", "in", ["return", "sale"]),
          where("date", ">=", startTimestamp),
          where("date", "<=", endTimestamp)
        );

        const returnsSnapshot = await getDocs(returnsQuery);
        let monthStockOut = 0;

        returnsSnapshot.forEach((doc) => {
          const data = doc.data();
          monthStockOut += data.items || 0;
        });

        stockOut.push(monthStockOut);
      }

      setChartData({
        labels: months,
        stockIn,
        stockOut,
      });
    } catch (error) {
      console.error("Error fetching stock level data:", error);
    } finally {
      setLoading(false);
    }
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Stock In",
        data: chartData.stockIn,
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
      {
        label: "Stock Out",
        data: chartData.stockOut,
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        Loading chart data...
      </div>
    );
  }

  return (
    <div className="h-[300px] ">
      <Bar ref={chartRef} data={data} options={options} />
    </div>
  );
}
