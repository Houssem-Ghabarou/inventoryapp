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

import { Skeleton } from "@/components/ui/skeleton";
import InventoryTable from "@/components/inventory/inventory-table";
import { InventoryItem } from "@/types/inventory";
import EditInventoryItemModal from "../modals/edit-inventory-item-modal";

export default function InventoryPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [finishedAdding, setFinishedAdding] = useState(0);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.sku.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isOpen && (
        <EditInventoryItemModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          setFinishedAdding={setFinishedAdding}
        />
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
                    onChange={handleSearch}
                  />
                </div>
              </div>

              <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <InventoryTable
                  items={filteredItems}
                  setItems={setItems}
                  finishedAdding={finishedAdding}
                  setFinishedAdding={setFinishedAdding}
                />
              </Suspense>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
