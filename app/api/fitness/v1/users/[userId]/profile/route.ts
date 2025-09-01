import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/fitness/v1/users/{userId}/profile
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

    // Get user profile
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get user statistics
    const [{ count: dataSourcesCount }, { count: dataPointsCount }, { count: sessionsCount }] = await Promise.all([
      supabase.from("data_sources").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("data_points").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("sessions").select("*", { count: "exact", head: true }).eq("user_id", userId),
    ])

    const response = {
      userId: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      statistics: {
        dataSourcesCount: dataSourcesCount || 0,
        dataPointsCount: dataPointsCount || 0,
        sessionsCount: sessionsCount || 0,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/fitness/v1/users/{userId}/profile
export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
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

    // Update profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        display_name: body.displayName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    const response = {
      userId: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
