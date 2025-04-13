"use client";

import { useRef, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function FinancialMetrics() {
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    salesRevenue: [] as number[],
    inventoryValue: [] as number[],
    profitMargin: [] as number[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Get the last 6 months
      const months = [];
      const salesRevenue = [];
      const inventoryValue = [];
      const profitMargin = [];

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

        // Query for sales
        const salesQuery = query(
          collection(db, "transactions"),
          where("type", "==", "sale"),
          where("date", ">=", startTimestamp),
          where("date", "<=", endTimestamp)
        );

        const salesSnapshot = await getDocs(salesQuery);
        let monthSales = 0;

        salesSnapshot.forEach((doc) => {
          const data = doc.data();
          monthSales += data.value || 0;
        });

        salesRevenue.push(monthSales);

        // For inventory value, we'll use a mock progression for now
        // In a real app, you would need historical inventory snapshots
        const baseInventoryValue = 85000 + i * 8000;
        inventoryValue.push(baseInventoryValue);

        // Calculate profit margin (30% of sales for this example)
        const profit = monthSales * 0.3;
        profitMargin.push(profit);
      }

      setChartData({
        labels: months,
        salesRevenue,
        inventoryValue,
        profitMargin,
      });
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Sales Revenue",
        data: chartData.salesRevenue,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Inventory Value",
        data: chartData.inventoryValue,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Profit Margin",
        data: chartData.profitMargin,
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        fill: true,
        tension: 0.4,
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
        beginAtZero: false,
        ticks: {
          callback: (value: any) => "$" + value.toLocaleString(),
        },
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
    <div className="h-[300px]">
      <Line
        ref={chartRef as React.MutableRefObject<ChartJS<"line"> | null>}
        data={data}
        options={options}
      />
    </div>
  );
}
