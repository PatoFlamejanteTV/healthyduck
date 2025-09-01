import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { aggregateBy, bucketByTime, startTimeMillis, endTimeMillis, dataTypeName, dataSourceId } = body

    let query = supabase
      .from("data_points")
      .select(`
        *,
        data_sources!inner(*)
      `)
      .eq("data_sources.user_id", user.id)
      .gte("start_time_nanos", startTimeMillis * 1000000)
      .lte("end_time_nanos", endTimeMillis * 1000000)

    if (dataTypeName) {
      query = query.eq("data_sources.data_type_name", dataTypeName)
    }

    if (dataSourceId) {
      query = query.eq("data_source_id", dataSourceId)
    }

    const { data: dataPoints, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const buckets = aggregateDataPoints(dataPoints, bucketByTime, aggregateBy)

    return NextResponse.json({
      bucket: buckets,
    })
  } catch (error) {
    console.error("Aggregation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function aggregateDataPoints(dataPoints: any[], bucketByTime: any, aggregateBy: any[]) {
  const bucketDurationMillis = bucketByTime.durationMillis
  const buckets: any[] = []

  const groupedData = new Map()

  dataPoints.forEach((point) => {
    const startTime = Math.floor(point.start_time_nanos / 1000000)
    const bucketStart = Math.floor(startTime / bucketDurationMillis) * bucketDurationMillis

    if (!groupedData.has(bucketStart)) {
      groupedData.set(bucketStart, [])
    }
    groupedData.get(bucketStart).push(point)
  })

  for (const [bucketStart, points] of groupedData) {
    const bucketEnd = bucketStart + bucketDurationMillis

    const aggregatedValues = aggregateBy.map((agg: any) => {
      const dataTypeName = agg.dataTypeName
      const aggregationType = agg.dataSourceId ? "sum" : "sum" // Default to sum

      const relevantPoints = points.filter((p: any) => p.data_sources.data_type_name === dataTypeName)

      let aggregatedValue = 0

      relevantPoints.forEach((point: any) => {
        const values = point.value || []
        values.forEach((val: any) => {
          if (val.fpVal !== undefined) {
            aggregatedValue += val.fpVal
          } else if (val.intVal !== undefined) {
            aggregatedValue += val.intVal
          }
        })
      })

      return {
        dataTypeName,
        value: [
          {
            fpVal: aggregatedValue,
          },
        ],
      }
    })

    buckets.push({
      startTimeMillis: bucketStart,
      endTimeMillis: bucketEnd,
      dataset: [
        {
          point: aggregatedValues.map((val) => ({
            dataTypeName: val.dataTypeName,
            startTimeNanos: bucketStart * 1000000,
            endTimeNanos: bucketEnd * 1000000,
            value: val.value,
          })),
        },
      ],
    })
  }

  return buckets
}
