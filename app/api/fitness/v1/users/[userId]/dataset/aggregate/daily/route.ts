import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || user.id !== params.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "7")
    const dataType = searchParams.get("dataType") || "com.ultimatequack.step_count.delta"

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    const { data: dataPoints, error } = await supabase
      .from("data_points")
      .select(`
        *,
        data_sources!inner(data_type_name)
      `)
      .eq("data_sources.user_id", user.id)
      .eq("data_sources.data_type_name", dataType)
      .gte("start_time_nanos", startDate.getTime() * 1000000)
      .lte("end_time_nanos", endDate.getTime() * 1000000)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const dailyAggregates = aggregateByDay(dataPoints, days)

    return NextResponse.json({
      aggregates: dailyAggregates,
      dataType,
      period: `${days} days`,
    })
  } catch (error) {
    console.error("Daily aggregation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function aggregateByDay(dataPoints: any[], days: number) {
  const dailyData = new Map()

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayKey = date.toISOString().split("T")[0]
    dailyData.set(dayKey, { date: dayKey, value: 0, count: 0 })
  }

  dataPoints.forEach((point) => {
    const pointDate = new Date(point.start_time_nanos / 1000000)
    const dayKey = pointDate.toISOString().split("T")[0]

    if (dailyData.has(dayKey)) {
      const dayData = dailyData.get(dayKey)
      const values = point.value || []

      values.forEach((val: any) => {
        if (val.fpVal !== undefined) {
          dayData.value += val.fpVal
        } else if (val.intVal !== undefined) {
          dayData.value += val.intVal
        }
        dayData.count++
      })
    }
  })

  return Array.from(dailyData.values()).reverse()
}
