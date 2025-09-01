import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/fitness/v1/users/{userId}/sessions/{sessionId}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; sessionId: string }> },
) {
  try {
    const { userId, sessionId } = await params
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get specific session
    const { data: session, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("session_id", sessionId)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Transform to HealthyDuck API format
    const response = {
      id: session.session_id,
      name: session.name,
      description: session.description,
      startTimeMillis: session.start_time_millis.toString(),
      endTimeMillis: session.end_time_millis.toString(),
      modifiedTimeMillis: session.modified_time_millis.toString(),
      activityType: session.activity_type,
      application: session.application_package_name
        ? {
            packageName: session.application_package_name,
          }
        : undefined,
      activeTimeMillis: session.active_time_millis?.toString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/fitness/v1/users/{userId}/sessions/{sessionId}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; sessionId: string }> },
) {
  try {
    const { userId, sessionId } = await params
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

    // Update session
    const { data: session, error } = await supabase
      .from("sessions")
      .update({
        name: body.name,
        description: body.description,
        start_time_millis: Number.parseInt(body.startTimeMillis),
        end_time_millis: Number.parseInt(body.endTimeMillis),
        modified_time_millis: Date.now(),
        activity_type: body.activityType,
        application_package_name: body.application?.packageName,
        active_time_millis: body.activeTimeMillis ? Number.parseInt(body.activeTimeMillis) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("session_id", sessionId)
      .select()
      .single()

    if (error || !session) {
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
    }

    // Transform response to HealthyDuck API format
    const response = {
      id: session.session_id,
      name: session.name,
      description: session.description,
      startTimeMillis: session.start_time_millis.toString(),
      endTimeMillis: session.end_time_millis.toString(),
      modifiedTimeMillis: session.modified_time_millis.toString(),
      activityType: session.activity_type,
      application: session.application_package_name
        ? {
            packageName: session.application_package_name,
          }
        : undefined,
      activeTimeMillis: session.active_time_millis?.toString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error updating session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/fitness/v1/users/{userId}/sessions/{sessionId}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; sessionId: string }> },
) {
  try {
    const { userId, sessionId } = await params
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete session
    const { error } = await supabase.from("sessions").delete().eq("user_id", userId).eq("session_id", sessionId)

    if (error) {
      return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
    }

    return NextResponse.json({ message: "Session deleted successfully" })
  } catch (error) {
    console.error("Error deleting session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
