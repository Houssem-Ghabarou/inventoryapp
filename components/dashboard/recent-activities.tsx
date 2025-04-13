"use client";

import { useState, useEffect } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  AlertCircle,
  RotateCcw,
  DollarSign,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

type Activity = {
  id: string;
  type: "departure" | "return" | "sale" | "adjustment" | "alert";
  item: string;
  quantity: number;
  value: number;
  date: Timestamp;
  user: string;
  vehicle?: string;
};

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    setLoading(true);
    try {
      // Fetch recent transactions
      const transactionsCollection = collection(db, "transactions");
      const q = query(
        transactionsCollection,
        orderBy("date", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(q);

      const transactionActivities = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type:
            data.type === "departure"
              ? "departure"
              : data.type === "return"
              ? "return"
              : "sale",
          item:
            data.type === "departure"
              ? "Multiple Items"
              : data.type === "return"
              ? "Returned Items"
              : "Sold Items",
          quantity: data?.items,
          value: data.value,
          date: data.date,
          vehicle: data.vehicleName,
        };
      });

      // Check for low stock alerts
      const inventoryCollection = collection(db, "inventory");
      const inventoryQuery = query(
        inventoryCollection,
        orderBy("updatedAt", "desc"),
        limit(10)
      );
      const inventorySnapshot = await getDocs(inventoryQuery);

      const lowStockItems = inventorySnapshot.docs
        .filter((doc) => {
          const data = doc.data();
          return data.quantity <= data.minStock;
        })
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: "alert",
            item: data.name,
            quantity: data.quantity,
            value: data.totalValue,
            date: data.updatedAt,
            user: "System",
          };
        })
        .slice(0, 3); // Limit to 3 low stock alerts

      // Combine and sort all activities
      const allActivities = [...transactionActivities, ...lowStockItems]
        .sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return b.date.seconds - a.date.seconds;
        })
        .slice(0, 5); // Limit to 5 activities total

      //@ts-ignore
      setActivities(allActivities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "departure":
        return <ArrowUpCircle className="h-4 w-4 text-blue-500" />;
      case "return":
        return <RotateCcw className="h-4 w-4 text-purple-500" />;
      case "sale":
        return <ArrowDownCircle className="h-4 w-4 text-emerald-500" />;
      case "adjustment":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getActivityBadge = (type: Activity["type"]) => {
    switch (type) {
      case "departure":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Stock Out
          </Badge>
        );
      case "return":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Return
          </Badge>
        );
      case "sale":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Sale
          </Badge>
        );
      case "adjustment":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Adjustment
          </Badge>
        );
      case "alert":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Low Stock
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "N/A";

    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        Loading...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Vehicle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  {getActivityIcon(activity.type)}
                  {getActivityBadge(activity.type)}
                </div>
              </TableCell>
              <TableCell className="font-medium">{activity.item}</TableCell>
              <TableCell>{activity.quantity}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  {activity.value?.toFixed(2) || "0.00"}
                </div>
              </TableCell>
              <TableCell>{formatDate(activity.date)}</TableCell>
              <TableCell>{activity.user}</TableCell>
              <TableCell>{activity.vehicle || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
