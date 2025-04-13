"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Truck, Package, Plus, Search, Filter, Download } from "lucide-react";
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
import VehiclesList from "@/components/vehicles/vehicles-list";
import VehiclesMap from "@/components/vehicles/vehicles-map";
import AddVehicleModal from "../modals/add-vehicle-item";

export default function VehiclesPage() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-1 ">
        {isOpen && <AddVehicleModal isOpen={isOpen} setIsOpen={setIsOpen} />}

        <header className="bg-white border-b px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold">Vehicle Management</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => setIsOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Vehicles Overview</CardTitle>
              <CardDescription>
                Manage your fleet and track vehicle assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search vehicles..."
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                  <Suspense
                    fallback={<Skeleton className="h-[500px] w-full" />}
                  >
                    <VehiclesList />
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
