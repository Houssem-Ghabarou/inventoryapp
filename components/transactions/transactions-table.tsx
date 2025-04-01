"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, TruckIcon, RotateCcw, FileText, ArrowRightLeft } from "lucide-react"
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

type Transaction = {
  id: string
  type: "departure" | "return"
  reference: string
  date: string
  items: {
    name: string
    quantity: number
    unitPrice: number
    totalValue: number
  }[]
  totalItems: number
  totalValue: number
  user: {
    name: string
    avatar?: string
  }
  vehicle: {
    name: string
    id: string
  }
  relatedTransactionId?: string
  notes?: string
  status: "open" | "closed" | "reconciled"
}

interface TransactionsTableProps {
  type: "all" | "departure" | "return"
}

export default function TransactionsTable({ type }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      const allTransactions = [
        {
          id: "txn-001",
          type: "departure",
          reference: "TRK-001",
          date: "2023-06-15 08:30",
          items: [
            { name: "Brake Pads", quantity: 50, unitPrice: 25, totalValue: 1250 },
            { name: "Oil Filters", quantity: 30, unitPrice: 15, totalValue: 450 },
            { name: "Spark Plugs", quantity: 40, unitPrice: 8, totalValue: 320 },
          ],
          totalItems: 120,
          totalValue: 2020,
          user: {
            name: "Jane Smith",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          vehicle: {
            name: "Truck #103",
            id: "v-001",
          },
          notes: "Morning delivery route",
          status: "open",
        },
        {
          id: "txn-002",
          type: "return",
          reference: "TRK-001",
          date: "2023-06-15 17:45",
          relatedTransactionId: "txn-001",
          items: [
            { name: "Brake Pads", quantity: 20, unitPrice: 25, totalValue: 500 },
            { name: "Oil Filters", quantity: 10, unitPrice: 15, totalValue: 150 },
            { name: "Spark Plugs", quantity: 15, unitPrice: 8, totalValue: 120 },
          ],
          totalItems: 45,
          totalValue: 770,
          user: {
            name: "Jane Smith",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          vehicle: {
            name: "Truck #103",
            id: "v-001",
          },
          notes: "End of day return - Sold 75 items worth $1,250",
          status: "reconciled",
        },
        {
          id: "txn-003",
          type: "departure",
          reference: "TRK-002",
          date: "2023-06-15 09:15",
          items: [
            { name: "Headlight Bulbs", quantity: 30, unitPrice: 18, totalValue: 540 },
            { name: "Windshield Wipers", quantity: 25, unitPrice: 22, totalValue: 550 },
            { name: "Air Fresheners", quantity: 50, unitPrice: 5, totalValue: 250 },
          ],
          totalItems: 105,
          totalValue: 1340,
          user: {
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          vehicle: {
            name: "Van #087",
            id: "v-002",
          },
          notes: "City center deliveries",
          status: "open",
        },
        {
          id: "txn-004",
          type: "departure",
          reference: "TRK-003",
          date: "2023-06-14 08:00",
          items: [
            { name: "Brake Pads", quantity: 40, unitPrice: 25, totalValue: 1000 },
            { name: "Air Filters", quantity: 35, unitPrice: 12, totalValue: 420 },
            { name: "Motor Oil", quantity: 25, unitPrice: 30, totalValue: 750 },
          ],
          totalItems: 100,
          totalValue: 2170,
          user: {
            name: "Mike Johnson",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          vehicle: {
            name: "Truck #105",
            id: "v-003",
          },
          notes: "Northern route delivery",
          status: "open",
        },
        {
          id: "txn-005",
          type: "return",
          reference: "TRK-003",
          date: "2023-06-14 18:30",
          relatedTransactionId: "txn-004",
          items: [
            { name: "Brake Pads", quantity: 15, unitPrice: 25, totalValue: 375 },
            { name: "Air Filters", quantity: 10, unitPrice: 12, totalValue: 120 },
            { name: "Motor Oil", quantity: 5, unitPrice: 30, totalValue: 150 },
          ],
          totalItems: 30,
          totalValue: 645,
          user: {
            name: "Mike Johnson",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          vehicle: {
            name: "Truck #105",
            id: "v-003",
          },
          notes: "End of day return - Sold 70 items worth $1,525",
          status: "reconciled",
        },
      ]

      // Filter transactions based on the selected type
      let filteredTransactions = allTransactions
      if (type !== "all") {
        filteredTransactions = allTransactions.filter((t) => t.type === type)
      }

      setTransactions(filteredTransactions)
      setLoading(false)
    }, 1000)
  }, [type])

  const getTypeBadge = (transactionType: Transaction["type"]) => {
    switch (transactionType) {
      case "departure":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Departure
          </Badge>
        )
      case "return":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Return
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (transactionType: Transaction["type"]) => {
    switch (transactionType) {
      case "departure":
        return <TruckIcon className="h-4 w-4 text-blue-500" />
      case "return":
        return <RotateCcw className="h-4 w-4 text-purple-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Open
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Closed
          </Badge>
        )
      case "reconciled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Reconciled
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
    return <div className="flex items-center justify-center h-[500px]">Loading...</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className={transaction.type === "return" ? "bg-purple-50/30" : ""}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(transaction.type)}
                  {getTypeBadge(transaction.type)}
                </div>
              </TableCell>
              <TableCell className="font-medium">{transaction.reference}</TableCell>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{transaction.totalItems} items</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {transaction.items.map((item) => `${item.name} (${item.quantity})`).join(", ")}
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{formatCurrency(transaction.totalValue)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={transaction.user.avatar} alt={transaction.user.name} />
                    <AvatarFallback>{transaction.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{transaction.user.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <TruckIcon className="h-4 w-4 text-muted-foreground" />
                  {transaction.vehicle.name}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
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
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                    {transaction.type === "departure" && transaction.status === "open" && (
                      <DropdownMenuItem>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Record Return
                      </DropdownMenuItem>
                    )}
                    {transaction.type === "departure" && transaction.status === "open" && (
                      <DropdownMenuItem>
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Reconcile
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>Print receipt</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Void transaction</DropdownMenuItem>
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

