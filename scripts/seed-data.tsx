"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export default function SeedData() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const seedCategories = async () => {
    setLoading(true);
    setMessage("Seeding categories...");

    const categories = [
      "Brakes",
      "Engine",
      "Electrical",
      "Exterior",
      "Suspension",
      "Transmission",
      "Cooling",
      "Accessories",
    ];

    try {
      const categoriesCollection = collection(db, "categories");

      // Check if categories already exist
      const snapshot = await getDocs(categoriesCollection);
      if (!snapshot.empty) {
        setMessage("Categories already exist. Skipping...");
        setLoading(false);
        return;
      }

      // Add categories
      for (const category of categories) {
        await addDoc(categoriesCollection, {
          name: category,
          createdAt: serverTimestamp(),
        });
      }

      setMessage("Categories seeded successfully!");
    } catch (error) {
      console.error("Error seeding categories:", error);
      setMessage("Error seeding categories. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const seedLocations = async () => {
    setLoading(true);
    setMessage("Seeding locations...");

    const locations = [
      "Rack A-01",
      "Rack A-02",
      "Rack B-01",
      "Rack B-02",
      "Rack C-01",
      "Rack C-02",
      "Warehouse 1",
      "Warehouse 2",
    ];

    try {
      const locationsCollection = collection(db, "locations");

      // Check if locations already exist
      const snapshot = await getDocs(locationsCollection);
      if (!snapshot.empty) {
        setMessage("Locations already exist. Skipping...");
        setLoading(false);
        return;
      }

      // Add locations
      for (const location of locations) {
        await addDoc(locationsCollection, {
          name: location,
          createdAt: serverTimestamp(),
        });
      }

      setMessage("Locations seeded successfully!");
    } catch (error) {
      console.error("Error seeding locations:", error);
      setMessage("Error seeding locations. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const seedDrivers = async () => {
    setLoading(true);
    setMessage("Seeding drivers...");

    const drivers = [
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "555-1234",
      },
      { name: "John Doe", email: "john.doe@example.com", phone: "555-5678" },
      {
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        phone: "555-9012",
      },
      {
        name: "Sarah Williams",
        email: "sarah.williams@example.com",
        phone: "555-3456",
      },
    ];

    try {
      const driversCollection = collection(db, "drivers");

      // Check if drivers already exist
      const snapshot = await getDocs(driversCollection);
      if (!snapshot.empty) {
        setMessage("Drivers already exist. Skipping...");
        setLoading(false);
        return;
      }

      // Add drivers
      for (const driver of drivers) {
        await addDoc(driversCollection, {
          ...driver,
          status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setMessage("Drivers seeded successfully!");
    } catch (error) {
      console.error("Error seeding drivers:", error);
      setMessage("Error seeding drivers. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const seedSampleInventory = async () => {
    setLoading(true);
    setMessage("Seeding sample inventory items...");

    const inventoryItems = [
      {
        name: "Brake Pads (Front)",
        sku: "BP-F-001",
        category: "Brakes",
        quantity: 45,
        minStock: 20,
        unitPrice: 25,
        location: "Rack A-01",
        description: "High-quality front brake pads for most vehicle models",
      },
      {
        name: "Oil Filter",
        sku: "OF-102",
        category: "Engine",
        quantity: 78,
        minStock: 30,
        unitPrice: 15,
        location: "Rack B-01",
        description: "Standard oil filters for regular maintenance",
      },
      {
        name: "Spark Plugs",
        sku: "SP-203",
        category: "Electrical",
        quantity: 120,
        minStock: 50,
        unitPrice: 8,
        location: "Rack C-01",
        description: "Standard spark plugs for most engines",
      },
      {
        name: "Windshield Wipers",
        sku: "WW-304",
        category: "Exterior",
        quantity: 15,
        minStock: 25,
        unitPrice: 22,
        location: "Warehouse 1",
        description: "All-weather windshield wipers",
      },
      {
        name: "Headlight Bulbs",
        sku: "HB-405",
        category: "Electrical",
        quantity: 32,
        minStock: 20,
        unitPrice: 18,
        location: "Rack C-02",
        description: "Standard headlight bulbs for most vehicles",
      },
    ];

    try {
      const inventoryCollection = collection(db, "inventory");

      // Check if inventory items already exist
      const snapshot = await getDocs(
        query(inventoryCollection, where("sku", "==", "BP-F-001"))
      );
      if (!snapshot.empty) {
        setMessage("Sample inventory items already exist. Skipping...");
        setLoading(false);
        return;
      }

      // Add inventory items
      for (const item of inventoryItems) {
        const totalValue = item.quantity * item.unitPrice;
        const stockStatus =
          item.quantity <= 0
            ? "out_of_stock"
            : item.quantity <= item.minStock
            ? "low_stock"
            : "in_stock";

        await addDoc(inventoryCollection, {
          ...item,
          totalValue,
          stockStatus,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setMessage("Sample inventory items seeded successfully!");
    } catch (error) {
      console.error("Error seeding inventory items:", error);
      setMessage("Error seeding inventory items. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const seedAllData = async () => {
    setLoading(true);
    setMessage("Seeding all data...");

    try {
      await seedCategories();
      await seedLocations();
      await seedDrivers();
      await seedSampleInventory();

      setMessage("All data seeded successfully!");
    } catch (error) {
      console.error("Error seeding data:", error);
      setMessage("Error seeding data. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md space-y-4">
      <h2 className="text-lg font-bold">Seed Initial Data</h2>
      <p className="text-sm text-muted-foreground">
        Use these buttons to seed initial data for your inventory system. This
        will create categories, locations, drivers, and sample inventory items.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={seedCategories}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          Seed Categories
        </Button>
        <Button
          onClick={seedLocations}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          Seed Locations
        </Button>
        <Button
          onClick={seedDrivers}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          Seed Drivers
        </Button>
        <Button
          onClick={seedSampleInventory}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          Seed Sample Inventory
        </Button>
        <Button onClick={seedAllData} disabled={loading} size="sm">
          Seed All Data
        </Button>
      </div>

      {message && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-sm">{message}</div>
      )}
    </div>
  );
}
