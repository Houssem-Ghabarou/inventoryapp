"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Edit, Trash, Package, MapPin, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Vehicle = {
  id: string
  name: string
  type: string
  licensePlate: string
  status: "active" | "maintenance" | "inactive"
  driver: {
    name: string
    avatar?: string
  }
  currentLocation: string
  lastActive: string
  assignedItems: number
}

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setVehicles([
        {
          id: "v-001",
          name: "Truck #103",
          type: "Delivery Truck",
          licensePlate: "ABC-1234",
          status: "active",
          driver: {
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          currentLocation: "Warehouse A",
          lastActive: "10 minutes ago",
          assignedItems: 42,
        },
        {
          id: "v-002",
          name: "Van #087",
          type: "Cargo Van",
          licensePlate: "XYZ-5678",
          status: "active",
          driver: {
            name: "Jane Smith",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          currentLocation: "Distribution Center",
          lastActive: "25 minutes ago",
          assignedItems: 18,
        },
        {
          id: "v-003",
          name: "Truck #105",
          type: "Delivery Truck",
          licensePlate: "DEF-9012",
          status: "maintenance",
          driver: {
            name: "Mike Johnson",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          currentLocation: "Service Center",
          lastActive: "2 days ago",
          assignedItems: 0,
        },
        {
          id: "v-004",
          name: "Van #092",
          type: "Cargo Van",
          licensePlate: "GHI-3456",
          status: "inactive",
          driver: {
            name: "Unassigned",
          },
          currentLocation: "Warehouse B",
          lastActive: "5 days ago",
          assignedItems: 0,
        },
        {
          id: "v-005",
          name: "Truck #110",
          type: "Delivery Truck",
          licensePlate: "JKL-7890",
          status: "active",
          driver: {
            name: "Sarah Williams",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          currentLocation: "Customer Site",
          lastActive: "5 minutes ago",
          assignedItems: 35,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: Vehicle["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Active
          </Badge>
        )
      case "maintenance":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Maintenance
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
            Inactive
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[500px]">Loading...</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Vehicle</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Assigned Items</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{vehicle.name}</div>
                  <div className="text-sm text-muted-foreground">{vehicle.type}</div>
                </div>
              </TableCell>
              <TableCell>{vehicle.licensePlate}</TableCell>
              <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={vehicle.driver.avatar} alt={vehicle.driver.name} />
                    <AvatarFallback>{vehicle.driver.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{vehicle.driver.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {vehicle.currentLocation}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {vehicle.lastActive}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {vehicle.assignedItems}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Assign items</DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit vehicle
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
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
  )
}

