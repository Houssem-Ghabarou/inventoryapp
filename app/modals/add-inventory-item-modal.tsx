"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Package } from "lucide-react";
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
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/auth-context";

export default function AddInventoryItemModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    minStock: "",
    unitPrice: "",
    location: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Categories for the dropdown
  const [categories, setCategories] = useState<string[]>([
    "Brakes",
    "Engine",
    "Electrical",
    "Exterior",
    "Suspension",
    "Transmission",
    "Cooling",
    "Accessories",
  ]);

  // Locations for the dropdown
  const [locations, setLocations] = useState<string[]>([
    "Rack A-01",
    "Rack A-02",
    "Rack B-01",
    "Rack B-02",
    "Rack C-01",
    "Rack C-02",
    "Warehouse 1",
    "Warehouse 2",
  ]);

  useEffect(() => {
    // Set up event listeners for the modal
    const modalTriggers = document.querySelectorAll(
      '[data-modal-trigger="add-inventory-item"]'
    );
    modalTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        setIsOpen(true);
        fetchCategoriesAndLocations();
      });
    });

    // Clean up
    return () => {
      modalTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", () => setIsOpen(true));
      });
    };
  }, []);

  const fetchCategoriesAndLocations = async () => {
    try {
      // Fetch categories from Firestore
      const categoriesCollection = collection(db, "categories");
      const categoriesSnapshot = await getDocs(categoriesCollection);
      if (!categoriesSnapshot.empty) {
        const categoriesList = categoriesSnapshot.docs.map(
          (doc) => doc.data().name
        );
        setCategories(categoriesList);
      }

      // Fetch locations from Firestore
      const locationsCollection = collection(db, "locations");
      const locationsSnapshot = await getDocs(locationsCollection);
      if (!locationsSnapshot.empty) {
        const locationsList = locationsSnapshot.docs.map(
          (doc) => doc.data().name
        );
        setLocations(locationsList);
      }
    } catch (err) {
      console.error("Error fetching categories and locations:", err);
      // Keep using the default values if there's an error
    }
  };

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
      // Calculate total value
      const quantity = Number.parseInt(formData.quantity) || 0;
      const unitPrice = Number.parseFloat(formData.unitPrice) || 0;
      const totalValue = quantity * unitPrice;

      // Prepare the data for submission
      const itemData = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        quantity: quantity,
        minStock: Number.parseInt(formData.minStock) || 0,
        unitPrice: unitPrice,
        totalValue: totalValue,
        location: formData.location,
        description: formData.description,
        stockStatus:
          quantity <= 0
            ? "out_of_stock"
            : quantity <= (Number.parseInt(formData.minStock) || 0)
            ? "low_stock"
            : "in_stock",
        createdBy: user?.id || "unknown",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add to Firestore
      const inventoryCollection = collection(db, "inventory");
      await addDoc(inventoryCollection, itemData);

      setSuccess("Inventory item added successfully!");

      // Reset form after successful submission
      setTimeout(() => {
        setIsOpen(false);
        setFormData({
          name: "",
          sku: "",
          category: "",
          quantity: "",
          minStock: "",
          unitPrice: "",
          location: "",
          description: "",
        });
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Error adding inventory item:", err);
      setError("Failed to add inventory item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSKU = () => {
    // Generate a simple SKU based on the item name and a random number
    if (formData.name) {
      const prefix = formData.name.substring(0, 2).toUpperCase();
      const randomNum = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      setFormData((prev) => ({ ...prev, sku: `${prefix}-${randomNum}` }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Add New Inventory Item</h2>
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
                <Label htmlFor="name">Item Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU*</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSKU}
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Storage Location*</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) =>
                    handleSelectChange("location", value)
                  }
                  required
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity*</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Minimum Stock</Label>
                <Input
                  id="minStock"
                  name="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price ($)*</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total Value:</div>
                <div className="text-right font-medium">
                  $
                  {(
                    (Number.parseFloat(formData.unitPrice) || 0) *
                    (Number.parseInt(formData.quantity) || 0)
                  ).toFixed(2)}
                </div>

                <div>Stock Status:</div>
                <div className="text-right font-medium">
                  {Number.parseInt(formData.quantity) > 0
                    ? "In Stock"
                    : "Out of Stock"}
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-md flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium">Inventory Management</h3>
                <p className="text-sm text-muted-foreground">
                  Add this item to your inventory to track stock levels and
                  movements.
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
                !formData.sku ||
                !formData.category ||
                !formData.quantity ||
                !formData.unitPrice ||
                !formData.location
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
                  Save Item
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
