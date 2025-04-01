"use client"

import { useState, useEffect } from "react"
import { TruckIcon, RotateCcw, DollarSign, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function TransactionsSummary() {
  const [summary, setSummary] = useState({
    activeTrucks: 0,
    totalDepartures: 0,
    totalReturns: 0,
    totalSales: 0,
    pendingReturns: 0,
    averageSalesPerTrip: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setSummary({
        activeTrucks: 3,
        totalDepartures: 12,
        totalReturns: 9,
        totalSales: 8450,
        pendingReturns: 3,
        averageSalesPerTrip: 938,
      })
      setLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[100px]">Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Trucks</p>
              <h3 className="text-2xl font-bold mt-1">{summary.activeTrucks}</h3>
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <span>{summary.pendingReturns} pending returns</span>
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Departures</p>
              <h3 className="text-2xl font-bold mt-1">{summary.totalDepartures}</h3>
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <span>{summary.totalReturns} returns recorded</span>
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <RotateCcw className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(summary.totalSales)}</h3>
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <span>From all reconciled trips</span>
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Sales Per Trip</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(summary.averageSalesPerTrip)}</h3>
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <span>Based on reconciled trips</span>
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

