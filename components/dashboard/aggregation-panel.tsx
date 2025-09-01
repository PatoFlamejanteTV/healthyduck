"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createBrowserClient } from "@/lib/supabase/client"

interface AggregationPanelProps {
  userId: string
}

export function AggregationPanel({ userId }: AggregationPanelProps) {
  const [aggregationData, setAggregationData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("7")
  const [selectedDataType, setSelectedDataType] = useState("com.google.step_count.delta")

  const supabase = createBrowserClient()

  const dataTypes = [
    { value: "com.google.step_count.delta", label: "Steps" },
    { value: "com.google.calories.expended", label: "Calories" },
    { value: "com.google.distance.delta", label: "Distance" },
    { value: "com.google.active_minutes", label: "Active Minutes" },
  ]

  const periods = [
    { value: "7", label: "Last 7 days" },
    { value: "14", label: "Last 14 days" },
    { value: "30", label: "Last 30 days" },
  ]

  useEffect(() => {
    fetchAggregationData()
  }, [selectedPeriod, selectedDataType])

  const fetchAggregationData = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/fitness/v1/users/${userId}/dataset/aggregate/daily?days=${selectedPeriod}&dataType=${selectedDataType}`,
      )
      const data = await response.json()

      if (response.ok) {
        setAggregationData(data.aggregates || [])
      }
    } catch (error) {
      console.error("Failed to fetch aggregation data:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalValue = aggregationData.reduce((sum, day) => sum + day.value, 0)
  const averageValue = aggregationData.length > 0 ? totalValue / aggregationData.length : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Data Aggregation
          <div className="flex gap-2">
            <Select value={selectedDataType} onValueChange={setSelectedDataType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
        <CardDescription>Aggregated fitness data over time periods</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{Math.round(totalValue).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{Math.round(averageValue).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Daily Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{aggregationData.length}</div>
            <div className="text-sm text-muted-foreground">Days</div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading aggregation data...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aggregationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [Math.round(value).toLocaleString(), selectedDataType.split(".").pop()]}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">
            Peak: {Math.round(Math.max(...aggregationData.map((d) => d.value))).toLocaleString()}
          </Badge>
          <Badge variant="secondary">
            Low: {Math.round(Math.min(...aggregationData.map((d) => d.value))).toLocaleString()}
          </Badge>
          <Badge variant="secondary">Active Days: {aggregationData.filter((d) => d.value > 0).length}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
