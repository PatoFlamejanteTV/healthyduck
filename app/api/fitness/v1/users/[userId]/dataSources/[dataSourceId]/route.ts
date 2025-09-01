import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/fitness/v1/users/{userId}/dataSources/{dataSourceId}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; dataSourceId: string }> },
) {
  try {
    const { userId, dataSourceId } = await params
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get specific data source
    const { data: dataSource, error } = await supabase
      .from("data_sources")
      .select("*")
      .eq("user_id", userId)
      .eq("data_stream_id", dataSourceId)
      .single()

    if (error || !dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    // Transform to Google Fit API format
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

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching data source:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/fitness/v1/users/{userId}/dataSources/{dataSourceId}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; dataSourceId: string }> },
) {
  try {
    const { userId, dataSourceId } = await params
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete data source (cascade will handle related data)
    const { error } = await supabase
      .from("data_sources")
      .delete()
      .eq("user_id", userId)
      .eq("data_stream_id", dataSourceId)

    if (error) {
      return NextResponse.json({ error: "Failed to delete data source" }, { status: 500 })
    }

    return NextResponse.json({ message: "Data source deleted successfully" })
  } catch (error) {
    console.error("Error deleting data source:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
