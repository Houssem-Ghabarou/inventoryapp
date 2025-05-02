"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash,
  ArrowUpDown,
  AlertCircle,
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import EditInventoryItemModal from "@/app/modals/edit-inventory-item-modal";
import { InventoryItem } from "@/types/inventory";

export default function InventoryTable({
  finishedAdding,
  setFinishedAdding,
  items,
  setItems,
}: {
  finishedAdding: number;
  setFinishedAdding: React.Dispatch<React.SetStateAction<number>>;
  items: InventoryItem[];
  setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof InventoryItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchInventoryItems();
  }, [finishedAdding]);

  const fetchInventoryItems = async () => {
    setLoading(true);
    try {
      const inventoryCollection = collection(db, "inventory");
      const q = query(inventoryCollection, orderBy("name"));
      const snapshot = await getDocs(q);

      const inventoryItems = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          sku: data.sku,
          category: data.category,
          quantity: data.quantity,
          minStock: data.minStock || 0,
          sellPrice: data.sellPrice || 0,
          totalSellPrice: data.totalSellPrice,
          unitPrice: data.unitPrice,
          totalValue: data.totalValue,
          lastUpdated: data.updatedAt
            ? new Date(data.updatedAt.seconds * 1000).toLocaleDateString()
            : "N/A",
        };
      });

      //@ts-ignore
      setItems(inventoryItems);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "inventory", id));
        // Remove the item from the state
        setItems(items.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item. Please try again.");
      }
    }
  };

  const handleSort = (column: keyof InventoryItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }

    return 0;
  });

  const getStockStatus = (item: InventoryItem) => {
    const percentage = (item.quantity / item.minStock) * 100;

    if (item.quantity <= item.minStock * 0.5) {
      return {
        status: "critical",
        badge: <Badge variant="destructive">Critical</Badge>,
        progressColor: "bg-red-500",
        percentage: percentage > 100 ? 100 : percentage,
      };
    } else if (item.quantity <= item.minStock) {
      return {
        status: "low",
        badge: (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Low
          </Badge>
        ),
        progressColor: "bg-amber-500",
        percentage: percentage > 100 ? 100 : percentage,
      };
    } else {
      return {
        status: "good",
        badge: (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Good
          </Badge>
        ),
        progressColor: "bg-emerald-500",
        percentage: 100,
      };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        Loading...
      </div>
    );
  }

  const handleEditItem = (id: string) => {
    setSelectedItemId(id);
    setEditOpen(true);
  };
  return (
    <div className="overflow-x-auto">
      {editOpen && (
        <EditInventoryItemModal
          isEditing={true}
          setFinishedAdding={setFinishedAdding}
          isOpen={editOpen}
          itemId={selectedItemId}
          onClose={() => setEditOpen(false)}
        />
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">
              <Button
                variant="ghost"
                onClick={() => handleSort("name")}
                className="-ml-4"
              >
                Item Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("category")}
                className="-ml-4"
              >
                Category
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("quantity")}
                className="-ml-4"
              >
                Quantity
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("unitPrice")}
                className="-ml-4"
              >
                Unit Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>

            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("totalValue")}
                className="-ml-4"
              >
                Total Value
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("unitPrice")}
                className="-ml-4"
              >
                Sell Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("totalSellPrice")}
                className="-ml-4"
              >
                Total Sell value
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Stock Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item) => {
            console.log(item, "item");
            const stockStatus = getStockStatus(item);
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.quantity}
                    {item.quantity <= item.minStock && (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {formatCurrency(item.unitPrice)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(item.totalValue)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {formatCurrency(item.sellPrice)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(item.totalSellPrice)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {stockStatus.badge}
                    <Progress
                      value={stockStatus.percentage}
                      className={`h-2 ${stockStatus.progressColor}`}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditItem(item?.id)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit item
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
