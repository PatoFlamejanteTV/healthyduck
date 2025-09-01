import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/fitness/v1/users/{userId}/dataSources/{dataSourceId}/datasets/{datasetId}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; dataSourceId: string; datasetId: string }> },
) {
  try {
    const { userId, dataSourceId, datasetId } = await params
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse dataset ID (format: startTimeNanos-endTimeNanos)
    const [startTimeNanos, endTimeNanos] = datasetId.split("-").map((t) => Number.parseInt(t))

    if (!startTimeNanos || !endTimeNanos) {
      return NextResponse.json({ error: "Invalid dataset ID format" }, { status: 400 })
    }

    // Get data source
    const { data: dataSource, error: dsError } = await supabase
      .from("data_sources")
      .select("id")
      .eq("user_id", userId)
      .eq("data_stream_id", dataSourceId)
      .single()

    if (dsError || !dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    // Get data points in the time range
    const { data: dataPoints, error } = await supabase
      .from("data_points")
      .select("*")
      .eq("user_id", userId)
      .eq("data_source_id", dataSource.id)
      .gte("start_time_nanos", startTimeNanos)
      .lte("end_time_nanos", endTimeNanos)
      .order("start_time_nanos", { ascending: true })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch data points" }, { status: 500 })
    }

    // Transform to HealthyDuck API format
    const transformedPoints = dataPoints.map((dp) => ({
      startTimeNanos: dp.start_time_nanos.toString(),
      endTimeNanos: dp.end_time_nanos.toString(),
      dataTypeName: dp.data_type_name,
      modifiedTimeMillis: Math.floor(dp.modified_time_nanos / 1000000).toString(),
      value:
        dp.int_val !== null
          ? [{ intVal: dp.int_val }]
          : dp.fp_val !== null
            ? [{ fpVal: dp.fp_val }]
            : dp.string_val !== null
              ? [{ stringVal: dp.string_val }]
              : dp.map_val !== null
                ? [{ mapVal: dp.map_val }]
                : [],
      originDataSourceId: dp.origin_data_source_id,
    }))

    const response = {
      dataSourceId: dataSourceId,
      maxEndTimeNs: endTimeNanos.toString(),
      minStartTimeNs: startTimeNanos.toString(),
      point: transformedPoints,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching dataset:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/fitness/v1/users/{userId}/dataSources/{dataSourceId}/datasets/{datasetId}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; dataSourceId: string; datasetId: string }> },
) {
  try {
    const { userId, dataSourceId, datasetId } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse dataset ID
    const [startTimeNanos, endTimeNanos] = datasetId.split("-").map((t) => Number.parseInt(t))

    if (!startTimeNanos || !endTimeNanos) {
      return NextResponse.json({ error: "Invalid dataset ID format" }, { status: 400 })
    }

    // Get data source
    const { data: dataSource, error: dsError } = await supabase
      .from("data_sources")
      .select("id")
      .eq("user_id", userId)
      .eq("data_stream_id", dataSourceId)
      .single()

    if (dsError || !dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    // Process data points from request
    const dataPoints = body.point || []
    const insertPromises = dataPoints.map(async (point: any) => {
      const value = point.value?.[0]

      return supabase.from("data_points").upsert({
        user_id: userId,
        data_source_id: dataSource.id,
        data_type_name: point.dataTypeName,
        start_time_nanos: Number.parseInt(point.startTimeNanos),
        end_time_nanos: Number.parseInt(point.endTimeNanos),
        modified_time_nanos: Number.parseInt(point.modifiedTimeMillis) * 1000000,
        int_val: value?.intVal || null,
        fp_val: value?.fpVal || null,
        string_val: value?.stringVal || null,
        map_val: value?.mapVal || null,
        origin_data_source_id: point.originDataSourceId,
      })
    })

    await Promise.all(insertPromises)

    return NextResponse.json({ message: "Data points updated successfully" })
  } catch (error) {
    console.error("Error updating dataset:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
