"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

type CategorySummary = {
  name: string
  count: number
  percentage: number
}

export default function InventorySummary() {
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setCategories([
        { name: "Engine Parts", count: 423, percentage: 34 },
        { name: "Electrical Components", count: 287, percentage: 23 },
        { name: "Body Parts", count: 198, percentage: 16 },
        { name: "Suspension", count: 156, percentage: 12 },
        { name: "Accessories", count: 184, percentage: 15 },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-[300px]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.name} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{category.name}</span>
            <span className="text-sm text-muted-foreground">{category.count} items</span>
          </div>
          <Progress value={category.percentage} className="h-2" />
        </div>
      ))}
    </div>
  )
}

