import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/fitness/v1/users/{userId}/sessions
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const startTime = searchParams.get("startTime")
    const endTime = searchParams.get("endTime")
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Build query
    let query = supabase.from("sessions").select("*").eq("user_id", userId)

    // Add time filters if provided
    if (startTime) {
      query = query.gte("start_time_millis", Number.parseInt(startTime))
    }
    if (endTime) {
      query = query.lte("end_time_millis", Number.parseInt(endTime))
    }

    const { data: sessions, error } = await query.order("start_time_millis", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
    }

    // Transform to HealthyDuck API format
    const transformedSessions = sessions.map((session) => ({
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
    }))

    return NextResponse.json({
      session: transformedSessions,
    })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/fitness/v1/users/{userId}/sessions
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
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
    if (!body.id || !body.startTimeMillis || !body.endTimeMillis || body.activityType === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert new session
    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        user_id: userId,
        session_id: body.id,
        name: body.name,
        description: body.description,
        start_time_millis: Number.parseInt(body.startTimeMillis),
        end_time_millis: Number.parseInt(body.endTimeMillis),
        modified_time_millis: Number.parseInt(body.modifiedTimeMillis) || Date.now(),
        activity_type: body.activityType,
        application_package_name: body.application?.packageName,
        active_time_millis: body.activeTimeMillis ? Number.parseInt(body.activeTimeMillis) : null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json({ error: "Session already exists" }, { status: 409 })
      }
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
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

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
