"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, TruckIcon, Plus, Minus, AlertCircle } from "lucide-react";
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
  getDocs,
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

type Driver = {
  id: string;
  name: string;
};

type Vehicle = {
  id: string;
  name: string;
  status: string;
};

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
}

export default function EditTripModal({
  isOpen,
  onClose,
  tripId,
}: EditTripModalProps) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    Array<{ id: string; quantity: number }>
  >([]);
  const [vehicle, setVehicle] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalTripData, setOriginalTripData] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && tripId) {
      fetchData();
    }
  }, [isOpen, tripId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch trip data
      const tripRef = doc(db, "transactions", tripId);
      const tripDoc = await getDoc(tripRef);

      if (!tripDoc.exists()) {
        setError("Trip not found");
        setLoading(false);
        return;
      }

      const tripData = tripDoc.data();
      setOriginalTripData(tripData);

      setVehicle(tripData.vehicleId || "");

      // Set selected items
      const tripItems = tripData.tripeItems || [];
      const selectedItemsData = tripItems.map((item: TripItem) => ({
        id: item.itemId,
        quantity: item.quantity,
      }));
      setSelectedItems(selectedItemsData);

      // Fetch inventory items
      const itemsCollection = collection(db, "inventory");
      const itemsSnapshot = await getDocs(itemsCollection);
      const itemsList = itemsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        quantity: doc.data().quantity,
        unitPrice: doc.data().unitPrice,
      }));
      setItems(itemsList);

      // Fetch vehicles (only active ones)
      const vehiclesCollection = collection(db, "vehicles");
      const vehiclesSnapshot = await getDocs(vehiclesCollection);
      const vehiclesList = vehiclesSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          status: doc.data().status,
        }))
        .filter(
          (vehicle) =>
            vehicle.status === "active" || vehicle.id === tripData.vehicleId
        );
      setVehicles(vehiclesList);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
    if (item) {
      const limitedQuantity = Math.min(quantity, item.quantity); // Limit to available quantity
      if (limitedQuantity > 0) {
        setSelectedItems(
          selectedItems.map((i) =>
            i.id === itemId ? { ...i, quantity: limitedQuantity } : i
          )
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      // Prepare the trip data
      const tripItems = selectedItems.map((selectedItem) => {
        const item = items.find((i) => i.id === selectedItem.id);
        return {
          itemId: selectedItem.id,
          name: item?.name || "",
          quantity: selectedItem.quantity,
          unitPrice: item?.unitPrice || 0,
          totalValue: selectedItem.quantity * (item?.unitPrice || 0),
        };
      });

      const totalItems = tripItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalValue = tripItems.reduce(
        (sum, item) => sum + item.totalValue,
        0
      );

      const tripData = {
        vehicleId: vehicle,
        vehicleName: vehicles.find((v) => v.id === vehicle)?.name || "",
        tripeItems: tripItems,
        items: totalItems,
        totalItems,
        totalValue,
        updatedBy: user?.id || "unknown",
        updatedAt: serverTimestamp(),
      };

      // Update in Firestore
      const tripRef = doc(db, "transactions", tripId);
      await updateDoc(tripRef, tripData);

      // Update inventory quantities
      for (const selectedItem of selectedItems) {
        const item = items.find((i) => i.id === selectedItem.id);
        const originalItem = originalTripData.tripeItems.find(
          (i: TripItem) => i.itemId === selectedItem.id
        );

        if (item) {
          const originalQuantity = originalItem ? originalItem.quantity : 0;
          const quantityDifference = selectedItem.quantity - originalQuantity;
          const newQuantity = Math.max(item.quantity - quantityDifference, 0); // Ensure no negative quantities

          if (newQuantity < 0) {
            setError(`Insufficient inventory for item: ${item.name}`);
            return;
          }

          const itemRef = doc(db, "inventory", selectedItem.id);
          await updateDoc(itemRef, {
            quantity: newQuantity,
            updatedAt: serverTimestamp(),
          });
        }
      }
      // Update inventory totalValue
      for (const selectedItem of selectedItems) {
        const item = items.find((i) => i.id === selectedItem.id);
        const originalItem = originalTripData.tripeItems.find(
          (i: TripItem) => i.itemId === selectedItem.id
        );

        if (item) {
          const originalQuantity = originalItem ? originalItem.quantity : 0;
          const quantityDifference = selectedItem.quantity - originalQuantity;
          const newQuantity = Math.max(item.quantity - quantityDifference, 0); // Ensure no negative quantities
          const oldTotalValue = item.quantity * item.unitPrice;
          const newTotalValue = newQuantity * item.unitPrice;

          if (newQuantity < 0) {
            setError(`Insufficient inventory for item: ${item.name}`);
            return;
          }

          const itemRef = doc(db, "inventory", selectedItem.id);
          await updateDoc(itemRef, {
            quantity: newQuantity,
            totalValue: newTotalValue,
            updatedAt: serverTimestamp(),
          });

          console.log(
            `Item: ${item.name}, Old Total Value: ${oldTotalValue}, New Total Value: ${newTotalValue}`
          );
        }
      }

      setSuccess("Transaction updated successfully!");

      // Close modal after successful submission
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Error updating trip:", err);
      setError("Failed to update trip. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          <h2 className="text-xl font-bold">Edit Trip</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <p>Loading trip data...</p>
          </div>
        ) : (
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

              <div className="grid  gap-4">
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
                        (item) =>
                          !selectedItems.some((si) => si.id === item.id) &&
                          item.quantity > 0
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
                        <div className="col-span-5 font-medium">
                          {item.name}
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {item.quantity - selectedItem.quantity}
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
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="col-span-2 text-right">
                          {formatCurrency(
                            selectedItem.quantity * item.unitPrice
                          )}
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || !vehicle || selectedItems.length === 0
                }
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <TruckIcon className="h-4 w-4 mr-2" />
                    Update Trip
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
