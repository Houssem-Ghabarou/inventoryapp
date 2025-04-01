"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type VehicleLocation = {
  id: string
  name: string
  type: string
  status: "active" | "maintenance" | "inactive"
  position: {
    x: number
    y: number
  }
  lastUpdated: string
}

export default function VehiclesMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLocation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setVehicles([
        {
          id: "v-001",
          name: "Truck #103",
          type: "Delivery Truck",
          status: "active",
          position: { x: 30, y: 40 },
          lastUpdated: "10 minutes ago",
        },
        {
          id: "v-002",
          name: "Van #087",
          type: "Cargo Van",
          status: "active",
          position: { x: 60, y: 25 },
          lastUpdated: "25 minutes ago",
        },
        {
          id: "v-003",
          name: "Truck #105",
          type: "Delivery Truck",
          status: "maintenance",
          position: { x: 75, y: 60 },
          lastUpdated: "2 days ago",
        },
        {
          id: "v-004",
          name: "Van #092",
          type: "Cargo Van",
          status: "inactive",
          position: { x: 45, y: 70 },
          lastUpdated: "5 days ago",
        },
        {
          id: "v-005",
          name: "Truck #110",
          type: "Delivery Truck",
          status: "active",
          position: { x: 20, y: 80 },
          lastUpdated: "5 minutes ago",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: VehicleLocation["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-500"
      case "maintenance":
        return "bg-amber-500"
      case "inactive":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[500px]">Loading map...</div>
  }

  return (
    <div className="relative h-[500px] bg-gray-100 rounded-lg overflow-hidden border">
      {/* Simplified map representation */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=500&width=800')] bg-cover bg-center opacity-30"></div>

      {/* Map grid lines */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`col-${i}`} className="border-r border-gray-300"></div>
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`row-${i}`} className="border-b border-gray-300"></div>
        ))}
      </div>

      {/* Vehicle markers */}
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110"
          style={{ left: `${vehicle.position.x}%`, top: `${vehicle.position.y}%` }}
          onClick={() => setSelectedVehicle(vehicle)}
        >
          <div className="flex flex-col items-center">
            <div className={`p-1 rounded-full ${getStatusColor(vehicle.status)}`}>
              <Truck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-full shadow-sm mt-1">{vehicle.name}</span>
          </div>
        </div>
      ))}

      {/* Location markers */}
      <div className="absolute left-[15%] top-[20%]">
        <div className="flex flex-col items-center">
          <div className="p-1 rounded-full bg-blue-500">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-full shadow-sm mt-1">Warehouse A</span>
        </div>
      </div>

      <div className="absolute left-[65%] top-[30%]">
        <div className="flex flex-col items-center">
          <div className="p-1 rounded-full bg-blue-500">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-full shadow-sm mt-1">
            Distribution Center
          </span>
        </div>
      </div>

      <div className="absolute left-[80%] top-[60%]">
        <div className="flex flex-col items-center">
          <div className="p-1 rounded-full bg-blue-500">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-full shadow-sm mt-1">Service Center</span>
        </div>
      </div>

      <div className="absolute left-[40%] top-[75%]">
        <div className="flex flex-col items-center">
          <div className="p-1 rounded-full bg-blue-500">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-full shadow-sm mt-1">Warehouse B</span>
        </div>
      </div>

      {/* Selected vehicle info */}
      {selectedVehicle && (
        <Card className="absolute bottom-4 right-4 w-64 shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{selectedVehicle.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedVehicle.type}</p>
              </div>
              <Badge
                variant="outline"
                className={`
                  ${selectedVehicle.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                  ${selectedVehicle.status === "maintenance" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                  ${selectedVehicle.status === "inactive" ? "bg-gray-100 text-gray-700 border-gray-200" : ""}
                `}
              >
                {selectedVehicle.status.charAt(0).toUpperCase() + selectedVehicle.status.slice(1)}
              </Badge>
            </div>
            <div className="mt-2 text-sm">
              <p>Last updated: {selectedVehicle.lastUpdated}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

