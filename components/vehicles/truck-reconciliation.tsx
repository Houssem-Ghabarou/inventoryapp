"use client"

import { useState } from "react"
import { TruckIcon, RotateCcw, DollarSign, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface TruckReconciliationProps {
  referenceId: string
}

export default function TruckReconciliation({ referenceId }: TruckReconciliationProps) {
  const [loading, setLoading] = useState(false)

  // This would be fetched from an API in a real application
  const tripData = {
    reference: "TRK-001",
    vehicle: {
      name: "Truck #103",
      id: "v-001",
    },
    driver: {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    departure: {
      id: "txn-001",
      date: "2023-06-15 08:30",
      items: [
        { name: "Brake Pads", quantity: 50, unitPrice: 25, totalValue: 1250 },
        { name: "Oil Filters", quantity: 30, unitPrice: 15, totalValue: 450 },
        { name: "Spark Plugs", quantity: 40, unitPrice: 8, totalValue: 320 },
      ],
      totalItems: 120,
      totalValue: 2020,
    },
    return: {
      id: "txn-002",
      date: "2023-06-15 17:45",
      items: [
        { name: "Brake Pads", quantity: 20, unitPrice: 25, totalValue: 500 },
        { name: "Oil Filters", quantity: 10, unitPrice: 15, totalValue: 150 },
        { name: "Spark Plugs", quantity: 15, unitPrice: 8, totalValue: 120 },
      ],
      totalItems: 45,
      totalValue: 770,
    },
    sales: {
      items: [
        { name: "Brake Pads", quantity: 30, unitPrice: 25, totalValue: 750 },
        { name: "Oil Filters", quantity: 20, unitPrice: 15, totalValue: 300 },
        { name: "Spark Plugs", quantity: 25, unitPrice: 8, totalValue: 200 },
      ],
      totalItems: 75,
      totalValue: 1250,
    },
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <TruckIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {tripData.reference} - {tripData.vehicle.name}
            </h3>
            <p className="text-sm text-muted-foreground">Driver: {tripData.driver.name}</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Pending Reconciliation
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TruckIcon className="h-4 w-4 mr-2 text-blue-500" />
              Departure Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(tripData.departure.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tripData.departure.totalItems} items • {tripData.departure.date}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <RotateCcw className="h-4 w-4 mr-2 text-purple-500" />
              Return Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(tripData.return.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tripData.return.totalItems} items • {tripData.return.date}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-emerald-500" />
              Sales Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(tripData.sales.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{tripData.sales.totalItems} items sold</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Reconciliation</CardTitle>
          <CardDescription>Compare departure inventory with returns to calculate sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {tripData.departure.items.map((item, index) => {
              const returnItem = tripData.return.items.find((ri) => ri.name === item.name)
              const returnQty = returnItem ? returnItem.quantity : 0
              const soldQty = item.quantity - returnQty
              const soldValue = soldQty * item.unitPrice
              const returnValue = returnQty * item.unitPrice
              const soldPercentage = (soldQty / item.quantity) * 100

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <div className="text-sm text-muted-foreground">Unit Price: {formatCurrency(item.unitPrice)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Departure</div>
                      <div className="font-medium">{item.quantity} units</div>
                      <div className="text-xs">{formatCurrency(item.totalValue)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Return</div>
                      <div className="font-medium">{returnQty} units</div>
                      <div className="text-xs">{formatCurrency(returnValue)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Sold</div>
                      <div className="font-medium text-emerald-600">{soldQty} units</div>
                      <div className="text-xs text-emerald-600">{formatCurrency(soldValue)}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>Sold: {soldPercentage.toFixed(0)}%</span>
                      <span>100%</span>
                    </div>
                    <Progress value={soldPercentage} className="h-2" />
                  </div>

                  {index < tripData.departure.items.length - 1 && <Separator className="my-4" />}
                </div>
              )
            })}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full flex justify-between items-center">
            <div>
              <span className="font-medium">Total Sales</span>
              <div className="text-sm text-muted-foreground">
                {tripData.sales.totalItems} of {tripData.departure.totalItems} items sold
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-emerald-600">{formatCurrency(tripData.sales.totalValue)}</span>
            </div>
          </div>
          <Button className="w-full" size="lg">
            <CheckCircle className="mr-2 h-5 w-5" />
            Complete Reconciliation
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

