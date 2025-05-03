"use client";

import { Suspense, useState } from "react";
import {
  ArrowDownUp,
  Package,
  TruckIcon,
  Search,
  Filter,
  Download,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionsTable from "@/components/transactions/transactions-table";
import TransactionsSummary from "@/components/transactions/transactions-summary";
import RecordReturnModal from "../modals/record-return-modal";
import NewTripModal from "../modals/new-trip-modal";
export default function TransactionsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [departureOpen, setDepartureOpen] = useState(false);
  const [finishedAdding, setFinishedAdding] = useState(0);
  const [searchQ, setSearchQ] = useState("");
  return (
    <div className="flex min-h-screen bg-gray-50">
      {isOpen && (
        <RecordReturnModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setFinishedAdding={setFinishedAdding}
          finishedAdding={finishedAdding}
        />
      )}

      {departureOpen && (
        <NewTripModal
          isOpen={departureOpen}
          setIsOpen={setDepartureOpen}
          setFinishedAdding={setFinishedAdding}
          finishedAdding={finishedAdding}
        />
      )}
      {/* Sidebar */}
      {/* Main content */}
      <div className="flex-1">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold">Truck Tracking</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setDepartureOpen(true)}
              >
                <TruckIcon className="h-4 w-4 mr-2" />
                New Departure
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setIsOpen(true)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Record Return
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Financial Summary */}
          {/* <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Sales Summary</CardTitle>
              <CardDescription>
                Overview of truck departures and returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
                <TransactionsSummary />
              </Suspense>
            </CardContent>
          </Card> */}

          {/* Transactions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Truck Transactions</CardTitle>
              <CardDescription>
                Track all truck departures and returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by reference ,price (example :260==> 260DT) or vehicle..."
                    className="pl-8"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Transactions</TabsTrigger>
                  <TabsTrigger value="sale">Sales</TabsTrigger>
                  <TabsTrigger value="departure">Departures</TabsTrigger>
                  <TabsTrigger value="return">Returns</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <Suspense
                    fallback={<Skeleton className="h-[500px] w-full" />}
                  >
                    <TransactionsTable
                      searchQ={searchQ}
                      type="all"
                      setFinishedAdding={setFinishedAdding}
                      finishedAdding={finishedAdding}
                    />
                  </Suspense>
                </TabsContent>
                <TabsContent value="sale">
                  <Suspense
                    fallback={<Skeleton className="h-[500px] w-full" />}
                  >
                    <TransactionsTable
                      searchQ={searchQ}
                      type="sale"
                      setFinishedAdding={setFinishedAdding}
                      finishedAdding={finishedAdding}
                    />
                  </Suspense>
                </TabsContent>
                <TabsContent value="departure">
                  <Suspense
                    fallback={<Skeleton className="h-[500px] w-full" />}
                  >
                    <TransactionsTable
                      searchQ={searchQ}
                      type="departure"
                      setFinishedAdding={setFinishedAdding}
                      finishedAdding={finishedAdding}
                    />
                  </Suspense>
                </TabsContent>
                <TabsContent value="return">
                  <Suspense
                    fallback={<Skeleton className="h-[500px] w-full" />}
                  >
                    <TransactionsTable
                      searchQ={searchQ}
                      type="return"
                      setFinishedAdding={setFinishedAdding}
                      finishedAdding={finishedAdding}
                    />
                  </Suspense>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
