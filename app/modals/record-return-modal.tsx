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
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
};

type Trip = {
  id: string;
  reference: string;
  vehicleId: string;
  vehicleName: string;
  driverId: string;
  driverName: string;
  departureDate: any;
  status: string;
  items: TripItem[];
  totalItems: number;
  totalValue: number;
};

export default function RecordReturnModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
      const tripsCollection = collection(db, "trips");
      console.log(tripsCollection);
      const q = query(tripsCollection, where("status", "==", "out"));
      const tripsSnapshot = await getDocs(q);

      const tripsList = tripsSnapshot.docs.map((doc) => ({
        id: doc.id,
        reference: doc.data().reference,
        vehicleId: doc.data().vehicleId,
        vehicleName: doc.data().vehicleName,
        driverId: doc.data().driverId,
        driverName: doc.data().driverName,
        departureDate: doc.data().departureDate,
        status: doc.data().status,
        items: doc.data().items,
        totalItems: doc.data().totalItems,
        totalValue: doc.data().totalValue,
      }));

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
        trip.items.forEach((item) => {
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

    selectedTrip.items.forEach((item) => {
      const returnedQty = returnItems[item.itemId] || 0;
      const soldQty = item.quantity - returnedQty;

      totalItemsReturned += returnedQty;
      totalValueReturned += returnedQty * item.unitPrice;

      totalItemsSold += soldQty;
      totalValueSold += soldQty * item.unitPrice;
    });

    setSummary({
      totalItemsReturned,
      totalValueReturned,
      totalItemsSold,
      totalValueSold,
    });
  }, [returnItems, selectedTrip]);

  const handleReturnChange = (itemId: string, value: string) => {
    const qty = Number.parseInt(value) || 0;
    const item = selectedTrip?.items.find((i) => i.itemId === itemId);

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
      const returnedItems = selectedTrip.items.map((item) => {
        const returnedQty = returnItems[item.itemId] || 0;
        const soldQty = item.quantity - returnedQty;
        return {
          itemId: item.itemId,
          name: item.name,
          quantityOut: item.quantity,
          quantityReturned: returnedQty,
          quantitySold: soldQty,
          unitPrice: item.unitPrice,
          returnValue: returnedQty * item.unitPrice,
          soldValue: soldQty * item.unitPrice,
        };
      });

      // Update the trip status
      const tripRef = doc(db, "trips", selectedTrip.id);
      await updateDoc(tripRef, {
        status: "returned",
        returnDate: serverTimestamp(),
        returnedItems: returnedItems,
        totalItemsReturned: summary.totalItemsReturned,
        totalValueReturned: summary.totalValueReturned,
        totalItemsSold: summary.totalItemsSold,
        totalValueSold: summary.totalValueSold,
        updatedAt: serverTimestamp(),
      });

      // Create a return transaction
      const transactionData = {
        type: "return",
        reference: selectedTrip.reference,
        tripId: selectedTrip.id,
        date: serverTimestamp(),
        items: summary.totalItemsReturned,
        value: summary.totalValueReturned,
        driverId: selectedTrip.driverId,
        driverName: selectedTrip.driverName,
        vehicleId: selectedTrip.vehicleId,
        vehicleName: selectedTrip.vehicleName,
        status: "open",
        createdBy: user?.id || "unknown",
        createdAt: serverTimestamp(),
      };

      const transactionsCollection = collection(db, "transactions");
      await addDoc(transactionsCollection, transactionData);

      // Update inventory quantities for returned items
      for (const [itemId, quantity] of Object.entries(returnItems)) {
        if (quantity > 0) {
          // Get current inventory quantity
          const itemRef = doc(db, "inventory", itemId);
          const itemDoc = await getDoc(itemRef);

          if (itemDoc.exists()) {
            const currentQuantity = itemDoc.data().quantity || 0;
            // Update with returned quantity
            await updateDoc(itemRef, {
              quantity: currentQuantity + quantity,
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      setSuccess("Return recorded successfully!");

      // Reset form after successful submission
      setTimeout(() => {
        setIsOpen(false);
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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
                      {trip.reference} - {trip.vehicleName} ({trip.driverName})
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
                        Driver: {selectedTrip.driverName}
                      </p>
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

                  {selectedTrip.items.map((item) => {
                    const returnedQty = returnItems[item.itemId] || 0;
                    const soldQty = item.quantity - returnedQty;
                    const soldValue = soldQty * item.unitPrice;

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
