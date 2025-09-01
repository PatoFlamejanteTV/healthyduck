"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface DataDistribution {
  name: string
  value: number
  color: string
}

interface DataDistributionChartProps {
  data: DataDistribution[]
}

export function DataDistributionChart({ data }: DataDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Data Distribution
        </CardTitle>
        <CardDescription>Breakdown of your fitness data types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                          <span className="font-medium">{data.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {data.value} data points ({((data.value / data.total) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {payload?.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-muted-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
