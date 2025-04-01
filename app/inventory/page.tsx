"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Package, Plus, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import InventoryTable from "@/components/inventory/inventory-table";
import { Dialog } from "@/components/ui/dialog";
import AddInventoryItemModal from "../modals/add-inventory-item-modal";

export default function InventoryPage() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-gray-50">
      {isOpen && (
        <AddInventoryItemModal isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
      {/* Main content */}
      <div className="flex-1">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold">Inventory Management</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setIsOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Inventory Overview</CardTitle>
              <CardDescription>
                Manage your inventory items, stock levels, and categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search items..."
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="engine">Engine Parts</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="body">Body Parts</SelectItem>
                      <SelectItem value="suspension">Suspension</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <InventoryTable />
              </Suspense>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
