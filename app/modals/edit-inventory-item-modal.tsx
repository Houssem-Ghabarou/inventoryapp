"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { X, Save, AlertCircle, Plus } from "lucide-react";
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
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/auth-context";
import { formatInputNumber } from "@/utils/formatInputNumber";

type InventoryItemData = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  description: string;

  sellPrice: number;
  totalSellPrice: number;
};

interface EditInventoryItemModalProps {
  isEditing?: boolean;
  isOpen: boolean;
  onClose: () => void;
  itemId?: string;
  setFinishedAdding: React.Dispatch<React.SetStateAction<number>>;
}

export default function EditInventoryItemModal({
  isEditing,
  isOpen,
  onClose,
  itemId,
  setFinishedAdding,
}: EditInventoryItemModalProps) {
  const [formData, setFormData] = useState<InventoryItemData>({
    id: "",
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    minStock: 0,
    unitPrice: 0,
    description: "",
    sellPrice: 0,
    totalSellPrice: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const newCategoryInputRef = useRef<HTMLInputElement>(null);

  // Categories for the dropdown
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    if (isOpen && itemId) {
      fetchItemData();
    }
  }, [isOpen, itemId]);

  const fetchCategories = async () => {
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
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Keep using the default values if there's an error
    }
  };

  const fetchItemData = async () => {
    setLoading(true);
    try {
      if (!itemId) {
        setLoading(false);
        return;
      }

      const itemRef = doc(db, "inventory", itemId);
      const itemDoc = await getDoc(itemRef);

      if (itemDoc.exists()) {
        const data = itemDoc.data();
        setFormData({
          id: itemId || "",
          name: data.name || "",
          sku: data.sku || "",
          category: data.category || "",
          quantity: data.quantity || 0,
          minStock: data.minStock || 0,
          unitPrice: data.unitPrice || 0,
          description: data.description || "",
          sellPrice: data.sellPrice || 0,
          totalSellPrice: data.totalSellPrice || 0,
        });
      } else {
        setError("Item not found");
      }
    } catch (err) {
      console.error("Error fetching item data:", err);
      setError("Failed to load item data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      // Add the new category to Firestore
      const categoriesCollection = collection(db, "categories");
      await addDoc(categoriesCollection, {
        name: newCategory.trim(),
        createdAt: serverTimestamp(),
      });

      // Update the local categories list
      setCategories([...categories, newCategory.trim()]);

      // Set the form data to use the new category
      setFormData((prev) => ({ ...prev, category: newCategory.trim() }));

      // Reset the new category state
      setNewCategory("");
      setIsAddingCategory(false);
    } catch (err) {
      console.error("Error adding new category:", err);
      setError("Failed to add new category. Please try again.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // // Allow input with digits, a single comma or period, and optional decimals
    // if (/^\d*[.,]?\d*$/.test(value) || value === "") {
    //   // Replace , with . before saving
    //   const formattedValue = value.replace(/,/g, ".");

    const formattedValue = formatInputNumber(value, "TND");
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    // }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateRandomSKU = () => {
    const randomSKU = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData((prev) => ({ ...prev, sku: randomSKU }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      // Calculate total value
      const totalValue = formData.quantity * formData.unitPrice;
      const totalSellPrice = formData.quantity * formData.sellPrice;
      const sellPrice = formData.sellPrice || 0;

      // Prepare the data for submission
      const itemData = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        quantity: Number(formData.quantity),
        minStock: Number(formData.minStock),
        unitPrice: Number(formData.unitPrice),
        totalSellPrice: totalSellPrice,
        sellPrice: Number(sellPrice),
        totalValue: totalValue,
        description: formData.description,
        stockStatus:
          formData.quantity <= 0
            ? "out_of_stock"
            : formData.quantity <= formData.minStock
            ? "low_stock"
            : "in_stock",
        updatedBy: user?.id || "unknown",
        updatedAt: serverTimestamp(),
      };

      // Update in Firestore
      if (isEditing) {
        //@ts-ignore
        const itemRef = doc(db, "inventory", itemId);
        await updateDoc(itemRef, itemData);
        setSuccess("Inventory item updated successfully!");
      } else {
        // Add to Firestore
        const inventoryCollection = collection(db, "inventory");
        await addDoc(inventoryCollection, itemData);

        setSuccess("Inventory item added successfully!");
      }

      setFinishedAdding((prev) => prev + 1);

      onClose();
    } catch (err) {
      console.error("Error updating inventory item:", err);
      setError("Failed to update inventory item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">
            {isEditing ? "Edit Inventory Item" : "Add Inventory Item"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p>Loading item data...</p>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sku">SKU*</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomSKU}
                      className="text-sm"
                    >
                      Generate
                    </Button>
                  </div>

                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                {isAddingCategory ? (
                  <div className="flex gap-2">
                    <Input
                      ref={newCategoryInputRef}
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category"
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={!newCategory.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingCategory(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select
                      value={formData.category}
                      onValueChange={(value) => {
                        if (value === "add_new") {
                          setIsAddingCategory(true);
                          setTimeout(() => {
                            newCategoryInputRef.current?.focus();
                          }, 100);
                        } else {
                          handleSelectChange("category", value);
                        }
                      }}
                      required
                    >
                      <SelectTrigger id="category" className="flex-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                        <SelectItem value="add_new" className="text-primary">
                          <div className="flex items-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Add new category
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity*</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity || ""}
                    onChange={handleNumberChange}
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
                    step="1"
                    value={formData.minStock || ""}
                    onChange={handleNumberChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (TND)*</Label>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="string"
                    min="0"
                    step="1"
                    value={formData.unitPrice || ""}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellPrice">sell Price (TND)*</Label>
                  <Input
                    id="sellPrice"
                    name="sellPrice"
                    type="string"
                    min="0"
                    step="1"
                    value={formData.sellPrice || ""}
                    onChange={handleNumberChange}
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
                    TND{(formData.unitPrice * formData.quantity).toFixed(2)}
                  </div>

                  <div>Stock Status:</div>
                  <div className="text-right font-medium">
                    {formData.quantity > 0
                      ? formData.quantity <= formData.minStock
                        ? "Low Stock"
                        : "In Stock"
                      : "Out of Stock"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.name ||
                  !formData.sku ||
                  !formData.category
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
                    {isEditing ? "Update Item" : "Add Item"}
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
