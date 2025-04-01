"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, TruckIcon, Save } from "lucide-react";
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

export default function RecordReturnModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [tripId, setTripId] = useState("");
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<Record<string, number>>({});
  const [summary, setSummary] = useState({
    totalItemsReturned: 0,
    totalValueReturned: 0,
    totalItemsSold: 0,
    totalValueSold: 0,
  });

  useEffect(() => {
    // Set up event listeners for the modal
    const modalTriggers = document.querySelectorAll(
      '[data-modal-trigger="record-return"]'
    );
    modalTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => setIsOpen(true));
    });

    // Clean up
    return () => {
      modalTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", () => setIsOpen(true));
      });
    };
  }, []);

  useEffect(() => {
    // Fetch active trips
    // This would be an API call in a real application
    setTrips([
      {
        id: "trip-001",
        reference: "TRK-001",
        vehicle: {
          name: "Truck #103",
          id: "v-001",
        },
        driver: {
          name: "Jane Smith",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        departureDate: "Today, 08:30 AM",
        items: [
          {
            id: "item-1",
            name: "Brake Pads",
            quantity: 50,
            unitPrice: 25,
            totalValue: 1250,
          },
          {
            id: "item-2",
            name: "Oil Filters",
            quantity: 30,
            unitPrice: 15,
            totalValue: 450,
          },
          {
            id: "item-3",
            name: "Spark Plugs",
            quantity: 40,
            unitPrice: 8,
            totalValue: 320,
          },
        ],
        totalItems: 120,
        totalValue: 2020,
      },
      {
        id: "trip-003",
        reference: "TRK-003",
        vehicle: {
          name: "Truck #105",
          id: "v-003",
        },
        driver: {
          name: "Mike Johnson",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        departureDate: "Yesterday, 08:00 AM",
        items: [
          {
            id: "item-4",
            name: "Brake Pads",
            quantity: 40,
            unitPrice: 25,
            totalValue: 1000,
          },
          {
            id: "item-5",
            name: "Air Filters",
            quantity: 35,
            unitPrice: 12,
            totalValue: 420,
          },
          {
            id: "item-6",
            name: "Motor Oil",
            quantity: 25,
            unitPrice: 30,
            totalValue: 750,
          },
        ],
        totalItems: 100,
        totalValue: 2170,
      },
    ]);
  }, []);

  useEffect(() => {
    if (tripId) {
      setLoading(true);
      // Simulate API call to get trip details
      setTimeout(() => {
        const trip = trips.find((t) => t.id === tripId);
        setSelectedTrip(trip);

        // Initialize return items with 0
        if (trip) {
          const initialReturnItems: Record<string, number> = {};
          trip.items.forEach((item: any) => {
            initialReturnItems[item.id] = 0;
          });
          setReturnItems(initialReturnItems);
        }

        setLoading(false);
      }, 500);
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

    selectedTrip.items.forEach((item: any) => {
      const returnedQty = returnItems[item.id] || 0;
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
    const item = selectedTrip?.items.find((i: any) => i.id === itemId);

    if (item && qty <= item.quantity) {
      setReturnItems((prev) => ({
        ...prev,
        [itemId]: qty,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the data for submission
    const returnData = {
      tripId,
      items: Object.entries(returnItems).map(([itemId, quantity]) => {
        const item = selectedTrip.items.find((i: any) => i.id === itemId);
        return {
          id: itemId,
          name: item?.name,
          quantity,
          unitPrice: item?.unitPrice,
          totalValue: quantity * (item?.unitPrice || 0),
        };
      }),
      summary,
    };

    // This would be an API call in a real application
    console.log("Submitting return data:", returnData);

    // Close the modal and reset form
    setIsOpen(false);
    setTripId("");
    setSelectedTrip(null);
    setReturnItems({});
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
            <div>
              <Label htmlFor="trip">Select Trip</Label>
              <Select value={tripId} onValueChange={setTripId} required>
                <SelectTrigger id="trip">
                  <SelectValue placeholder="Select a trip to record return" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.reference} - {trip.vehicle.name} ({trip.driver.name}
                      )
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
                        {selectedTrip.reference} - {selectedTrip.vehicle.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Driver: {selectedTrip.driver.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Departure: {selectedTrip.departureDate}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Return Items</h3>

                  {selectedTrip.items.map((item: any) => {
                    const returnedQty = returnItems[item.id] || 0;
                    const soldQty = item.quantity - returnedQty;
                    const soldValue = soldQty * item.unitPrice;

                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex justify-between">
                          <Label
                            htmlFor={`item-${item.id}`}
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
                              htmlFor={`item-${item.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              Returned
                            </Label>
                            <Input
                              id={`item-${item.id}`}
                              type="number"
                              min="0"
                              max={item.quantity}
                              value={returnedQty}
                              onChange={(e) =>
                                handleReturnChange(item.id, e.target.value)
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
              disabled={!selectedTrip || Object.keys(returnItems).length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Return
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
