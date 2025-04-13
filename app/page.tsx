import { Suspense } from "react";
import Link from "next/link";
import {
  BarChart3,
  Package,
  Truck,
  ArrowDownUp,
  History,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InventorySummary from "@/components/dashboard/inventory-summary";
import RecentActivities from "@/components/dashboard/recent-activities";
import StockLevelChart from "@/components/dashboard/stock-level-chart";
import FinancialMetrics from "@/components/dashboard/financial-metrics";
import DashboardStats from "@/components/dashboard/dashboard-stats";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Dashboard</h2>
          </div>
        </header>

        <main className="p-6">
          {/* Stats overview */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Skeleton className="h-[120px] w-full" />
                <Skeleton className="h-[120px] w-full" />
                <Skeleton className="h-[120px] w-full" />
                <Skeleton className="h-[120px] w-full" />
              </div>
            }
          >
            <DashboardStats />
          </Suspense>

          {/* Financial metrics */}
          {/* <Card className="mb-8">
            <CardHeader>
              <CardTitle>Financial Metrics</CardTitle>
              <CardDescription>
                Overview of sales and inventory value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <FinancialMetrics />
              </Suspense>
            </CardContent>
          </Card> */}

          {/* Charts and tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
                <CardDescription>
                  Overview of current inventory levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                  <StockLevelChart />
                </Suspense>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Inventory Summary</CardTitle>
                <CardDescription>Top categories by value</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                  <InventorySummary />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Recent activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest inventory transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <RecentActivities />
              </Suspense>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
