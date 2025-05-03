"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, TruckIcon, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/auth-context";

type TripItem = {
  sellPrice: number;
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
};

type Trip = {
  tripeItems: TripItem[];
  id: string;
  reference: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  departureDate: any;
  status: string;
  items: number;
  totalItems: number;
  totalValue: number;
  sellPrice: number;
  totalSellPrice: number;
};

export default function RecordReturnModal({
  isOpen,
  setIsOpen,
  setFinishedAdding,
  finishedAdding,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFinishedAdding: React.Dispatch<React.SetStateAction<number>>;
  finishedAdding: number;
}) {
  const [tripId, setTripId] = useState("");
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [returnItems, setReturnItems] = useState<Record<string, number>>({});
  const [summary, setSummary] = useState({
    totalItemsReturned: 0,
    totalValueReturned: 0,
    totalItemsSold: 0,
    totalValueSold: 0,
    totalInitialValue: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchActiveTrips();
  }, []);

  const fetchActiveTrips = async () => {
    setLoading(true);
    try {
      // Query trips with status "out"
      const transactionsCollection = collection(db, "transactions");
      const q = query(transactionsCollection, where("status", "==", "open"));
      const transactionSnap = await getDocs(q);

      const tripsList = transactionSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          reference: data.reference,
          vehicleId: data.vehicleId,
          vehicleName: data.vehicleName,
          tripeItems: Array.isArray(data.tripeItems) ? data.tripeItems : [],
          departureDate: data.createdAt,
          status: data.status,
          items: data.items,
          totalItems: data.totalItems,
          totalValue: data.totalValue,
        };
      });

      //@ts-ignore
      setTrips(tripsList);
    } catch (err) {
      console.error("Error fetching active trips:", err);
      setError("Failed to load active trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      setLoading(true);
      // Find the selected trip from the trips array
      const trip = trips.find((t) => t.id === tripId);
      setSelectedTrip(trip || null);

      // Initialize return items with 0
      if (trip) {
        const initialReturnItems: Record<string, number> = {};
        trip.tripeItems.forEach((item) => {
          initialReturnItems[item.itemId] = 0;
        });
        setReturnItems(initialReturnItems);
      }
      setLoading(false);
    } else {
      setSelectedTrip(null);
      setReturnItems({});
    }
  }, [tripId, trips]);

  useEffect(() => {
    if (!selectedTrip) return;

    let totalItemsReturned = 0;
    let totalValueReturned = 0;
    let totalItemsSold = 0;
    let totalValueSold = 0;
    let totalInitialValue = 0;

    selectedTrip.tripeItems.forEach((item) => {
      const returnedQty = returnItems[item.itemId] || 0;
      const soldQty = item.quantity - returnedQty;

      totalItemsReturned += returnedQty;
      totalValueReturned += returnedQty * item.unitPrice;
      (totalInitialValue += soldQty * item.unitPrice),
        (totalItemsSold += soldQty);
      totalValueSold += soldQty * item.sellPrice;
    });

    setSummary({
      totalItemsReturned,
      totalValueReturned,
      totalItemsSold,
      totalValueSold,
      totalInitialValue,
    });
  }, [returnItems, selectedTrip]);

  const handleReturnChange = (itemId: string, value: string) => {
    const qty = Number.parseInt(value) || 0;
    const item = selectedTrip?.tripeItems.find((i) => i.itemId === itemId);

    if (item && qty <= item.quantity) {
      setReturnItems((prev) => ({
        ...prev,
        [itemId]: qty,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!selectedTrip) {
      setError("No trip selected");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare the return data
      const returnedItems = selectedTrip.tripeItems.map((item) => {
        const returnedQty = returnItems[item.itemId] || 0;
        const soldQty = item.quantity - returnedQty;
        return {
          itemId: item.itemId,
          name: item.name,
          quantityOut: item.quantity,
          quantityReturned: returnedQty,
          quantitySold: soldQty,
          unitPrice: item.unitPrice,
          sellPrice: item.sellPrice,
          returnValue: returnedQty * item.unitPrice,
          soldValue: soldQty * item.sellPrice,
          value: item.totalValue,
        };
      });

      // Create a return transaction - INDEPENDENT TRANSACTION RECORD
      const transactionData = {
        type: "return",
        reference: `RET-${selectedTrip.reference}`,
        tripId: selectedTrip.id,
        date: serverTimestamp(),
        items: summary.totalItemsReturned,
        value: summary.totalValueReturned,
        vehicleId: selectedTrip.vehicleId,
        vehicleName: selectedTrip.vehicleName,
        status: "completed",
        returnedItems: returnedItems,
        createdBy: user?.id || "unknown",
        createdAt: serverTimestamp(),
      };

      const transactionsCollection = collection(db, "transactions");
      const returned = await addDoc(transactionsCollection, transactionData);

      // Update inventory quantities for returned items
      for (const [itemId, quantity] of Object.entries(returnItems)) {
        if (quantity > 0) {
          // Get current inventory quantity
          const itemRef = doc(db, "inventory", itemId);
          const itemDoc = await getDoc(itemRef);

          if (itemDoc.exists()) {
            const currentQuantity = itemDoc.data().quantity || 0;
            const unitPrice = itemDoc.data().unitPrice || 0;
            const newQuantity = currentQuantity + quantity;
            const newTotalValue = newQuantity * unitPrice;

            // Update with returned quantity
            await updateDoc(itemRef, {
              quantity: newQuantity,
              totalValue: newTotalValue,
              stockStatus:
                newQuantity <= 0
                  ? "out_of_stock"
                  : newQuantity <= (itemDoc.data().minStock || 0)
                  ? "low_stock"
                  : "in_stock",
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      // Create a sales transaction record if there were sales
      if (summary.totalItemsSold > 0) {
        const salesTransactionData = {
          returnId: returned.id,
          type: "sale",
          reference: `SALE-${selectedTrip.reference}`,
          tripId: selectedTrip.id,
          date: serverTimestamp(),
          items: summary.totalItemsSold,
          value: summary.totalInitialValue,
          totalSellPrice: summary.totalValueSold,
          vehicleId: selectedTrip.vehicleId,
          vehicleName: selectedTrip.vehicleName,
          status: "completed",
          soldItems: returnedItems.map((item) => {
            return {
              itemId: item.itemId,
              name: item.name,
              quantity: item.quantitySold,
              unitPrice: item.unitPrice,
              sellPrice: item.sellPrice,
              totalSaleValue: item.soldValue,
              value: item.value,
            };
          }),
          createdBy: user?.id || "unknown",
          createdAt: serverTimestamp(),
        };

        await addDoc(transactionsCollection, salesTransactionData);
      }

      // Create a sales document to save historical transactions
      const salesDocumentData = {
        tripId: selectedTrip.id,
        reference: `SALE-${selectedTrip.reference}`,
        date: serverTimestamp(),
        totalItemsSold: summary.totalItemsSold,
        totalValueSold: summary.totalValueSold,
        totalItemsReturned: summary.totalItemsReturned,
        totalValueReturned: summary.totalValueReturned,
        soldItems: returnedItems.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          quantitySold: item.quantitySold,
          unitPrice: item.unitPrice,
          totalValue: item.soldValue,
        })),
        returnedItems: returnedItems.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          quantityReturned: item.quantityReturned,
          unitPrice: item.unitPrice,
          totalValue: item.returnValue,
        })),
        createdBy: user?.id || "unknown",
        createdAt: serverTimestamp(),
      };

      const salesCollection = collection(db, "sales");
      await addDoc(salesCollection, salesDocumentData);
      ///update open transaction to completed
      const tripRef = doc(db, "transactions", selectedTrip.id);
      await updateDoc(tripRef, {
        status: "completed",
        updatedAt: serverTimestamp(),
      });

      setSuccess("Return recorded successfully!");

      setFinishedAdding((prev) => prev + 1);

      setIsOpen(false);
      // Reset form after successful submission
      setTimeout(() => {
        // setIsOpen(false);
        setTripId("");
        setSelectedTrip(null);
        setReturnItems({});
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Error recording return:", err);
      setError("Failed to record return. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Record Truck Return</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert
                variant="default"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="trip">Select Trip</Label>
              <Select value={tripId} onValueChange={setTripId} required>
                <SelectTrigger id="trip">
                  <SelectValue
                    placeholder={
                      loading
                        ? "Loading trips..."
                        : "Select a trip to record return"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.reference} - {trip.vehicleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading && (
              <div className="py-8 text-center">
                <p>Loading trip details...</p>
              </div>
            )}

            {!loading && selectedTrip && (
              <>
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium">
                        {selectedTrip.reference} - {selectedTrip.vehicleName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Departure:{" "}
                        {selectedTrip.departureDate
                          ? new Date(
                              selectedTrip.departureDate.seconds * 1000
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Return Items</h3>

                  {selectedTrip.tripeItems.map((item) => {
                    const returnedQty = returnItems[item.itemId] || 0;
                    const soldQty = item.quantity - returnedQty;
                    const soldValue = soldQty * item.sellPrice;

                    return (
                      <div key={item.itemId} className="space-y-2">
                        <div className="flex justify-between">
                          <Label
                            htmlFor={`item-${item.itemId}`}
                            className="font-medium"
                          >
                            {item.name}
                          </Label>
                          <span className="text-sm text-muted-foreground">
                            Unit Price: {formatCurrency(item.unitPrice)}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-4 items-center">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Departed With
                            </Label>
                            <div className="font-medium">{item.quantity}</div>
                          </div>

                          <div>
                            <Label
                              htmlFor={`item-${item.itemId}`}
                              className="text-xs text-muted-foreground"
                            >
                              Returned
                            </Label>
                            <Input
                              id={`item-${item.itemId}`}
                              type="number"
                              min="0"
                              max={item.quantity}
                              value={returnedQty}
                              onChange={(e) =>
                                handleReturnChange(item.itemId, e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Sold
                            </Label>
                            <div className="font-medium text-emerald-600">
                              {soldQty}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Sales Value
                            </Label>
                            <div className="font-medium text-emerald-600">
                              {formatCurrency(soldValue)}
                            </div>
                          </div>
                        </div>

                        <Separator className="my-2" />
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Items Returned:</div>
                    <div className="text-right font-medium">
                      {summary.totalItemsReturned}
                    </div>

                    <div>Value Returned:</div>
                    <div className="text-right font-medium">
                      {formatCurrency(summary.totalValueReturned)}
                    </div>

                    <div>Items Sold:</div>
                    <div className="text-right font-medium text-emerald-600">
                      {summary.totalItemsSold}
                    </div>

                    <div>Sales Value:</div>
                    <div className="text-right font-medium text-emerald-600">
                      {formatCurrency(summary.totalValueSold)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 p-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedTrip ||
                Object.keys(returnItems).length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Return
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
