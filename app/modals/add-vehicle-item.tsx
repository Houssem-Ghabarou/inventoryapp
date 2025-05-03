"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, TruckIcon, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/auth-context";

export default function AddVehicleModal({
  isOpen,
  setIsOpen,
  finishedAdding,
  setFinishedAdding,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  finishedAdding: number;
  setFinishedAdding: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    licensePlate: "",
    status: "active",
    notes: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Vehicle types for the dropdown
  const vehicleTypes = [
    "Delivery Truck",
    "Cargo Van",
    "Pickup Truck",
    "Box Truck",
    "Semi-Truck",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      // Prepare the data for submission
      const vehicleData = {
        name: formData.name,
        type: formData.type,
        licensePlate: formData.licensePlate,
        status: formData.status,
        notes: formData.notes,
        createdBy: user?.id || "unknown",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add to Firestore
      const vehiclesCollection = collection(db, "vehicles");
      await addDoc(vehiclesCollection, vehicleData);

      setSuccess("Vehicle added successfully!");

      // Update the parent component to reflect the new vehicle
      setFinishedAdding((prev) => prev + 1);
      setIsOpen(false);
      // Reset form after successful submission
      setTimeout(() => {
        // setIsOpen(false);
        setFormData({
          name: "",
          type: "",
          licensePlate: "",
          status: "active",
          notes: "",
        });
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Error adding vehicle:", err);
      setError("Failed to add vehicle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateVehicleName = () => {
    // Generate a vehicle name based on the type and a random number
    if (formData.type) {
      const prefix = formData.type.includes("Truck") ? "Truck" : "Van";
      const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      setFormData((prev) => ({ ...prev, name: `${prefix} #${randomNum}` }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Add New Vehicle</h2>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vehicle Name*</Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateVehicleName}
                    disabled={!formData.type}
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Vehicle Type*</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  required
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate*</Label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status*</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional information about the vehicle..."
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-md flex items-center gap-3">
              <TruckIcon className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium">Vehicle Information</h3>
                <p className="text-sm text-muted-foreground">
                  Add this vehicle to your fleet to track inventory movements
                  and sales.
                </p>
              </div>
            </div>
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
                !formData.name ||
                !formData.type ||
                !formData.licensePlate
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
                  Save Vehicle
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
