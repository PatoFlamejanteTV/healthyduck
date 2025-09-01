import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/fitness/v1/users/{userId}/dataSources
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get data sources for the user
    const { data: dataSources, error } = await supabase
      .from("data_sources")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch data sources" }, { status: 500 })
    }

    // Transform to Google Fit API format
    const transformedDataSources = dataSources.map((ds) => ({
      dataStreamId: ds.data_stream_id,
      dataStreamName: ds.data_stream_name,
      type: ds.type,
      dataType: {
        name: ds.data_type_name,
        field: [], // Will be populated based on data type
      },
      device: ds.device_uid
        ? {
            uid: ds.device_uid,
            type: ds.device_type,
            manufacturer: ds.device_manufacturer,
            model: ds.device_model,
            version: ds.device_version,
          }
        : undefined,
      application: ds.application_package_name
        ? {
            packageName: ds.application_package_name,
            version: ds.application_version,
            detailsUrl: ds.application_details_url,
          }
        : undefined,
    }))

    return NextResponse.json({
      dataSource: transformedDataSources,
    })
  } catch (error) {
    console.error("Error fetching data sources:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/fitness/v1/users/{userId}/dataSources
export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
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

    // Validate required fields
    if (!body.dataStreamId || !body.dataStreamName || !body.type || !body.dataType?.name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert new data source
    const { data: dataSource, error } = await supabase
      .from("data_sources")
      .insert({
        user_id: userId,
        data_stream_id: body.dataStreamId,
        data_stream_name: body.dataStreamName,
        type: body.type,
        data_type_name: body.dataType.name,
        device_uid: body.device?.uid,
        device_type: body.device?.type,
        device_manufacturer: body.device?.manufacturer,
        device_model: body.device?.model,
        device_version: body.device?.version,
        application_package_name: body.application?.packageName,
        application_version: body.application?.version,
        application_details_url: body.application?.detailsUrl,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json({ error: "Data source already exists" }, { status: 409 })
      }
      return NextResponse.json({ error: "Failed to create data source" }, { status: 500 })
    }

    // Transform response to Google Fit API format
    const response = {
      dataStreamId: dataSource.data_stream_id,
      dataStreamName: dataSource.data_stream_name,
      type: dataSource.type,
      dataType: {
        name: dataSource.data_type_name,
        field: [],
      },
      device: dataSource.device_uid
        ? {
            uid: dataSource.device_uid,
            type: dataSource.device_type,
            manufacturer: dataSource.device_manufacturer,
            model: dataSource.device_model,
            version: dataSource.device_version,
          }
        : undefined,
      application: dataSource.application_package_name
        ? {
            packageName: dataSource.application_package_name,
            version: dataSource.application_version,
            detailsUrl: dataSource.application_details_url,
          }
        : undefined,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error creating data source:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
