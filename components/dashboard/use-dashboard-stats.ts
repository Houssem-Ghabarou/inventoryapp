"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    inventoryValue: 0,
    totalSales: 0,
    activeVehicles: 0,
    todaySales: 0,
    itemsChange: 0,
    valueChange: 0,
    vehiclesChange: 0,
    salesChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch total items and inventory value
      const inventoryCollection = collection(db, "inventory");
      const inventorySnapshot = await getDocs(inventoryCollection);

      //sales doc
      const salesCollection = collection(db, "sales");
      const salesSnapshot = await getDocs(salesCollection);
      let totalItems = 0;
      let inventoryValue = 0;
      let totalSales = 0;

      inventorySnapshot.forEach((doc) => {
        const data = doc.data();
        totalItems += data.quantity || 0;
        inventoryValue += data.totalValue || 0;
      });

      salesSnapshot.forEach((doc) => {
        const data = doc.data();
        totalSales += data.totalValueSold || 0;
      });
      // Fetch active vehicles
      const vehiclesCollection = collection(db, "vehicles");
      const activeVehiclesQuery = query(
        vehiclesCollection,
        where("status", "==", "active")
      );
      const activeVehiclesSnapshot = await getDocs(activeVehiclesQuery);
      const activeVehicles = activeVehiclesSnapshot.size;

      // Calculate today's sales based on the provided sales data
      const todaySales: number = salesSnapshot.docs.reduce(
        (acc: number, doc) => {
          const data = doc.data();
          const saleDate = new Date(data.date.seconds * 1000); // Convert Firestore timestamp to JavaScript Date
          const today = new Date();
          if (
            saleDate.getDate() === today.getDate() &&
            saleDate.getMonth() === today.getMonth() &&
            saleDate.getFullYear() === today.getFullYear()
          ) {
            return acc + (data.totalValueSold || 0);
          }
          return acc;
        },
        0
      );

      setStats({
        totalItems,
        inventoryValue,
        activeVehicles,
        todaySales,
        itemsChange: Math.floor(Math.random() * 20) - 10,
        valueChange: Math.floor(Math.random() * 20) - 10,
        vehiclesChange: Math.floor(Math.random() * 5),
        salesChange: Math.floor(Math.random() * 20) - 10,
        totalSales,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
};
