"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Edit, Trash, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";

type Vehicle = {
  id: string;
  name: string;
  type: string;
  licensePlate: string;
  status: "active" | "maintenance" | "inactive";
  assignedItems: number;
};

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const vehiclesCollection = collection(db, "vehicles");
      const vehiclesSnapshot = await getDocs(vehiclesCollection);

      // Get all active trips to determine assigned items
      const tripsCollection = collection(db, "trips");
      const activeTripsQuery = query(
        tripsCollection,
        where("status", "==", "out")
      );
      const tripsSnapshot = await getDocs(activeTripsQuery);

      // Map of vehicleId -> assignedItems
      const assignedItemsMap = new Map<string, number>();

      tripsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.vehicleId) {
          assignedItemsMap.set(
            data.vehicleId,
            (assignedItemsMap.get(data.vehicleId) || 0) + (data.totalItems || 0)
          );
        }
      });

      // Process vehicles
      const vehiclesList = vehiclesSnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data.name || "Unnamed Vehicle",
          type: data.type || "Unknown Type",
          licensePlate: data.licensePlate || "No Plate",
          status: data.status || "inactive",
          assignedItems: assignedItemsMap.get(doc.id) || 0,
        };
      });

      setVehicles(vehiclesList);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteDoc(doc(db, "vehicles", id));
        // Remove the vehicle from the state
        setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle. Please try again.");
      }
    }
  };

  const getStatusBadge = (status: Vehicle["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            Active
          </Badge>
        );
      case "maintenance":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Maintenance
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200"
          >
            Inactive
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        Loading...
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        No vehicles found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Vehicle</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{vehicle.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {vehicle.type}
                  </div>
                </div>
              </TableCell>
              <TableCell>{vehicle.licensePlate}</TableCell>
              <TableCell>{getStatusBadge(vehicle.status)}</TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete vehicle
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
