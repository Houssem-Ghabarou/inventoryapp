"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

type CategorySummary = {
  name: string;
  count: number;
  percentage: number;
  value: number;
};

export default function InventorySummary() {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorySummary();
  }, []);

  const fetchCategorySummary = async () => {
    setLoading(true);
    try {
      // Get all inventory items
      const inventoryCollection = collection(db, "inventory");
      const inventorySnapshot = await getDocs(inventoryCollection);

      // Group by category
      const categoryMap = new Map<string, { count: number; value: number }>();
      let totalValue = 0;

      inventorySnapshot.forEach((doc) => {
        const data = doc.data();
        const category = data.category;
        const value = data.totalValue || 0;
        const count = data.quantity || 0;

        if (category) {
          const existing = categoryMap.get(category) || { count: 0, value: 0 };
          categoryMap.set(category, {
            count: existing.count + count,
            value: existing.value + value,
          });
          totalValue += value;
        }
      });

      // Convert to array and calculate percentages
      const categoriesArray = Array.from(categoryMap.entries())
        .map(([name, { count, value }]) => ({
          name,
          count,
          value,
          percentage:
            totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 categories

      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error fetching category summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        Loading...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        No inventory data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.name} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{category.name}</span>
            <span className="text-sm text-muted-foreground">
              {category.count} items
            </span>
          </div>
          <Progress value={category.percentage} className="h-2" />
        </div>
      ))}
    </div>
  );
}
