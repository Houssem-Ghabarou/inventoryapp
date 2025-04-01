"use client"

import { useState, useEffect } from "react"
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertCircle, RotateCcw, DollarSign } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Activity = {
  id: string
  type: "in" | "out" | "adjustment" | "alert" | "return"
  item: string
  quantity: number
  value: number
  date: string
  user: string
  vehicle?: string
}

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setActivities([
        {
          id: "act-001",
          type: "in",
          item: "Brake Pads",
          quantity: 50,
          value: 1250,
          date: "2023-06-15 09:30",
          user: "John Doe",
          vehicle: "Truck #103",
        },
        {
          id: "act-002",
          type: "out",
          item: "Oil Filters",
          quantity: 25,
          value: 375,
          date: "2023-06-15 10:15",
          user: "Jane Smith",
          vehicle: "Van #087",
        },
        {
          id: "act-003",
          type: "return",
          item: "Oil Filters",
          quantity: 10,
          value: 150,
          date: "2023-06-15 18:30",
          user: "Jane Smith",
          vehicle: "Van #087",
        },
        {
          id: "act-004",
          type: "adjustment",
          item: "Spark Plugs",
          quantity: 15,
          value: 120,
          date: "2023-06-15 11:45",
          user: "Mike Johnson",
        },
        {
          id: "act-005",
          type: "alert",
          item: "Windshield Wipers",
          quantity: 5,
          value: 110,
          date: "2023-06-15 13:20",
          user: "System",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "in":
        return <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
      case "out":
        return <ArrowUpCircle className="h-4 w-4 text-blue-500" />
      case "return":
        return <RotateCcw className="h-4 w-4 text-purple-500" />
      case "adjustment":
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case "alert":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      default:
        return null
    }
  }

  const getActivityBadge = (type: Activity["type"]) => {
    switch (type) {
      case "in":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Stock In
          </Badge>
        )
      case "out":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Stock Out
          </Badge>
        )
      case "return":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Return
          </Badge>
        )
      case "adjustment":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Adjustment
          </Badge>
        )
      case "alert":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Low Stock
          </Badge>
        )
      default:
        return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[400px]">Loading...</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Vehicle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.type)}
                  {getActivityBadge(activity.type)}
                </div>
              </TableCell>
              <TableCell className="font-medium">{activity.item}</TableCell>
              <TableCell>{activity.quantity}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  {activity.value.toFixed(2)}
                </div>
              </TableCell>
              <TableCell>{activity.date}</TableCell>
              <TableCell>{activity.user}</TableCell>
              <TableCell>{activity.vehicle || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

