"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, TruckIcon, Plus, Minus } from "lucide-react";
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

export default function NewTripModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [items, setItems] = useState<
    Array<{ id: string; name: string; quantity: number; unitPrice: number }>
  >([]);
  const [selectedItems, setSelectedItems] = useState<
    Array<{ id: string; quantity: number }>
  >([]);
  const [driver, setDriver] = useState("");
  const [vehicle, setVehicle] = useState("");

  // Mock data for the form
  const [drivers, setDrivers] = useState([
    { id: "d1", name: "Jane Smith" },
    { id: "d2", name: "John Doe" },
    { id: "d3", name: "Mike Johnson" },
  ]);

  const [vehicles, setVehicles] = useState([
    { id: "v1", name: "Truck #103" },
    { id: "v2", name: "Van #087" },
    { id: "v3", name: "Truck #105" },
  ]);

  useEffect(() => {
    // Fetch inventory items
    // This would be an API call in a real application
    setItems([
      { id: "i1", name: "Brake Pads", quantity: 100, unitPrice: 25 },
      { id: "i2", name: "Oil Filters", quantity: 80, unitPrice: 15 },
      { id: "i3", name: "Spark Plugs", quantity: 150, unitPrice: 8 },
      { id: "i4", name: "Headlight Bulbs", quantity: 60, unitPrice: 18 },
      { id: "i5", name: "Windshield Wipers", quantity: 45, unitPrice: 22 },
    ]);

    // Set up event listeners for the modal
    const modalTriggers = document.querySelectorAll(
      '[data-modal-trigger="new-trip"]'
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

  const handleAddItem = (itemId: string) => {
    if (!selectedItems.some((item) => item.id === itemId)) {
      setSelectedItems([...selectedItems, { id: itemId, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const item = items.find((i) => i.id === itemId);
    if (item && quantity > 0 && quantity <= item.quantity) {
      setSelectedItems(
        selectedItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the data for submission
    const tripData = {
      driver,
      vehicle,
      items: selectedItems.map((selectedItem) => {
        const item = items.find((i) => i.id === selectedItem.id);
        return {
          id: selectedItem.id,
          name: item?.name,
          quantity: selectedItem.quantity,
          unitPrice: item?.unitPrice,
          totalValue: selectedItem.quantity * (item?.unitPrice || 0),
        };
      }),
    };

    // This would be an API call in a real application
    console.log("Submitting trip data:", tripData);

    // Close the modal and reset form
    setIsOpen(false);
    setSelectedItems([]);
    setDriver("");
    setVehicle("");
  };

  const calculateTotalItems = () => {
    return selectedItems.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateTotalValue = () => {
    return selectedItems.reduce((total, selectedItem) => {
      const item = items.find((i) => i.id === selectedItem.id);
      return total + selectedItem.quantity * (item?.unitPrice || 0);
    }, 0);
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
          <h2 className="text-xl font-bold">Create New Truck Trip</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="driver">Driver</Label>
                <Select value={driver} onValueChange={setDriver} required>
                  <SelectTrigger id="driver">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select value={vehicle} onValueChange={setVehicle} required>
                  <SelectTrigger id="vehicle">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <Label>Add Items</Label>
              <Select onValueChange={handleAddItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select items to add" />
                </SelectTrigger>
                <SelectContent>
                  {items
                    .filter(
                      (item) => !selectedItems.some((si) => si.id === item.id)
                    )
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.quantity} available)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItems.length > 0 && (
              <div className="border rounded-md">
                <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 font-medium text-sm">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2">Available</div>
                  <div className="col-span-3">Quantity</div>
                  <div className="col-span-2 text-right">Value</div>
                </div>

                {selectedItems.map((selectedItem) => {
                  const item = items.find((i) => i.id === selectedItem.id);
                  if (!item) return null;

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 p-3 border-t items-center"
                    >
                      <div className="col-span-5 font-medium">{item.name}</div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        {item.quantity}
                      </div>
                      <div className="col-span-3 flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              selectedItem.quantity - 1
                            )
                          }
                          disabled={selectedItem.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={item.quantity}
                          value={selectedItem.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              Number.parseInt(e.target.value) || 1
                            )
                          }
                          className="h-7 mx-1 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              selectedItem.quantity + 1
                            )
                          }
                          disabled={selectedItem.quantity >= item.quantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="col-span-2 text-right">
                        {formatCurrency(selectedItem.quantity * item.unitPrice)}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-1 text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <div className="grid grid-cols-12 gap-2 p-3 border-t bg-gray-50">
                  <div className="col-span-5 font-medium">Total</div>
                  <div className="col-span-2"></div>
                  <div className="col-span-3 font-medium">
                    {calculateTotalItems()} items
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    {formatCurrency(calculateTotalValue())}
                  </div>
                </div>
              </div>
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
              disabled={!driver || !vehicle || selectedItems.length === 0}
            >
              <TruckIcon className="h-4 w-4 mr-2" />
              Create Trip
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
