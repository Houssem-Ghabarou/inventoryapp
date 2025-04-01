"use client"

import { useState } from "react"
import { CheckCircle, Truck } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface VehicleReconciliationProps {
  vehicleId: string
}

export default function VehicleReconciliation({ vehicleId }: VehicleReconciliationProps) {
  const [loading, setLoading] = useState(false)

  // This would be fetched from an API in a real application
  const vehicleData = {
    id: "v-002",
    name: "Van #087",
    driver: {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    exitTransaction: {
      id: "txn-002",
      reference: "REQ-5678",
      date: "2023-06-15 10:15",
      items: [
        { name: "Oil Filters", quantity: 25, unitPrice: 15, totalValue: 375 },
        { name: "Spark Plugs", quantity: 40, unitPrice: 8, totalValue: 320 },
        { name: "Brake Pads", quantity: 20, unitPrice: 25, totalValue: 500 },
      ],
      totalItems: 85,
      totalValue: 1195,
    },
    returnedItems: [
      { name: "Oil Filters", quantity: 10, unitPrice: 15, totalValue: 150 },
      { name: "Spark Plugs", quantity: 15, unitPrice: 8, totalValue: 120 },
      { name: "Brake Pads", quantity: 5, unitPrice: 25, totalValue: 125 },
    ],
    totalReturnedItems: 30,
    totalReturnedValue: 395,
    totalSoldItems: 55,
    totalSoldValue: 800,
    salesProfit: 320,
    profitMargin: 40,
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
            <Truck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{vehicleData.name}</h3>
            <p className="text-sm text-muted-foreground">Driver: {vehicleData.driver.name}</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Pending Reconciliation
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Exit Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(vehicleData.exitTransaction.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{vehicleData.exitTransaction.totalItems} items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Returned Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(vehicleData.totalReturnedValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{vehicleData.totalReturnedItems} items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sales Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(vehicleData.totalSoldValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{vehicleData.totalSoldItems} items</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Details</CardTitle>
          <CardDescription>Compare exit inventory with returns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehicleData.exitTransaction.items.map((item, index) => {
              const returnedItem = vehicleData.returnedItems.find((ri) => ri.name === item.name)
              const returnedQty = returnedItem ? returnedItem.quantity : 0
              const soldQty = item.quantity - returnedQty
              const soldValue = soldQty * item.unitPrice
              const returnedValue = returnedQty * item.unitPrice
              const soldPercentage = (soldQty / item.quantity) * 100

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <div className="text-sm text-muted-foreground">
                        Exit: {item.quantity} | Returned: {returnedQty} | Sold: {soldQty}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{formatCurrency(soldValue)}</span>
                      <div className="text-sm text-muted-foreground">{formatCurrency(item.unitPrice)} per unit</div>
                    </div>
                  </div>
                  <Progress value={soldPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Returned: {formatCurrency(returnedValue)}</span>
                    <span>Sold: {formatCurrency(soldValue)}</span>
                  </div>
                  {index < vehicleData.exitTransaction.items.length - 1 && <Separator className="my-2" />}
                </div>
              )
            })}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full flex justify-between items-center">
            <div>
              <span className="font-medium">Total Sales Profit</span>
              <div className="text-sm text-muted-foreground">Profit Margin: {vehicleData.profitMargin}%</div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-emerald-600">{formatCurrency(vehicleData.salesProfit)}</span>
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

