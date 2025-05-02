"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, TruckIcon, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  collection,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/auth-context";

interface EditReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnId: string;
}

export default function EditReturnModal({
  isOpen,
  onClose,
  returnId,
}: EditReturnModalProps) {
  const [loading, setLoading] = useState(true);
  const [returnData, setReturnData] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && returnId) {
      fetchReturnData();
    }
  }, [isOpen, returnId]);

  const fetchReturnData = async () => {
    setLoading(true);
    try {
      const returnRef = doc(db, "transactions", returnId);
      const returnDoc = await getDoc(returnRef);

      if (!returnDoc.exists()) {
        setError("Return transaction not found");
        setLoading(false);
        return;
      }

      const data = returnDoc.data();
      setReturnData(data);

      // Set return items with quantities
      if (data.returnedItems && Array.isArray(data.returnedItems)) {
        setReturnItems(
          data.returnedItems.map((item: any) => ({
            ...item,
            editQuantity: item.quantityReturned,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching return data:", err);
      setError("Failed to load return data");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    const qty = Number.parseInt(value) || 0;
    const item = returnItems.find((i) => i.itemId === itemId);

    if (item && qty >= 0 && qty <= item.quantityOut) {
      setReturnItems(
        returnItems.map((i) =>
          i.itemId === itemId
            ? { ...i, editQuantity: qty, quantitySold: i.quantityOut - qty }
            : i
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      // Calculate updated totals
      let totalItemsReturned = 0;
      let totalValueReturned = 0;
      let totalItemsSold = 0;
      let totalValueSold = 0;

      const updatedReturnedItems = returnItems.map((item) => {
        const returnedQty = item.editQuantity;
        const soldQty = item.quantityOut - returnedQty;

        totalItemsReturned += returnedQty;
        totalValueReturned += returnedQty * item.unitPrice;
        totalItemsSold += soldQty;
        totalValueSold += soldQty * item.unitPrice;

        return {
          ...item,
          quantityReturned: returnedQty,
          quantitySold: soldQty,
          returnValue: returnedQty * item.unitPrice,
          soldValue: soldQty * item.unitPrice,
        };
      });

      // Update the return transaction
      const returnRef = doc(db, "transactions", returnId);
      await updateDoc(returnRef, {
        items: totalItemsReturned,
        value: totalValueReturned,
        returnedItems: updatedReturnedItems,
        updatedBy: user?.id || "unknown",
        updatedAt: serverTimestamp(),
      });

      // Check if there is a sale with the same returnId
      const transactionsSnapshot = await getDocs(
        collection(db, "transactions")
      );

      const matchingTransaction = transactionsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .find((transaction: any) => transaction.returnId === returnId);

      if (matchingTransaction) {
        // Update the matching sale transaction
        const saleRef = doc(db, "transactions", matchingTransaction.id);
        await updateDoc(saleRef, {
          items: totalItemsSold,
          value: totalValueSold,
          soldItems: updatedReturnedItems,
          updatedBy: user?.id || "unknown",
          updatedAt: serverTimestamp(),
        });
      }

      setSuccess("Return and associated sale updated successfully!");

      // Close modal after successful submission
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Error updating return or sale:", err);
      setError("Failed to update return or sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotals = () => {
    let totalItemsReturned = 0;
    let totalValueReturned = 0;
    let totalItemsSold = 0;
    let totalValueSold = 0;

    returnItems.forEach((item) => {
      const returnedQty = item.editQuantity;
      const soldQty = item.quantityOut - returnedQty;

      totalItemsReturned += returnedQty;
      totalValueReturned += returnedQty * item.unitPrice;
      totalItemsSold += soldQty;
      totalValueSold += soldQty * item.unitPrice;
    });

    return {
      totalItemsReturned,
      totalValueReturned,
      totalItemsSold,
      totalValueSold,
    };
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };

  if (!isOpen) return null;

  const summary = calculateTotals();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Edit Return</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <p>Loading return data...</p>
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

              {returnData && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium">
                        {returnData.reference} - {returnData.vehicleName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Return Date:{" "}
                        {returnData.date
                          ? new Date(
                              returnData.date.seconds * 1000
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Edit Return Items</h3>

                {returnItems.map((item) => {
                  const returnedQty = item.editQuantity;
                  const soldQty = item.quantityOut - returnedQty;
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
                          <div className="font-medium">{item.quantityOut}</div>
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
                            max={item.quantityOut}
                            value={returnedQty}
                            onChange={(e) =>
                              handleQuantityChange(item.itemId, e.target.value)
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
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Return
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
