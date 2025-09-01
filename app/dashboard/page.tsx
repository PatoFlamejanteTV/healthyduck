import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Heart, Target, TrendingUp, Database, Settings, Plus, BarChart3, Users, Clock } from "lucide-react"
import { ActivityChart } from "@/components/charts/activity-chart"
import { DataDistributionChart } from "@/components/charts/data-distribution-chart"
import { WeeklySummaryChart } from "@/components/charts/weekly-summary-chart"
import { ProgressChart } from "@/components/charts/progress-chart"
import { AggregationPanel } from "@/components/dashboard/aggregation-panel"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile and stats
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get actual counts from database
  const [{ count: dataSourcesCount }, { count: dataPointsCount }, { count: sessionsCount }, { count: dataSetsCount }] =
    await Promise.all([
      supabase.from("data_sources").select("*", { count: "exact", head: true }).eq("user_id", data.user.id),
      supabase.from("data_points").select("*", { count: "exact", head: true }).eq("user_id", data.user.id),
      supabase.from("sessions").select("*", { count: "exact", head: true }).eq("user_id", data.user.id),
      supabase.from("data_sets").select("*", { count: "exact", head: true }).eq("user_id", data.user.id),
    ])

  // Get recent sessions
  const { data: recentSessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", data.user.id)
    .order("start_time_millis", { ascending: false })
    .limit(5)

  // Get recent data sources
  const { data: recentDataSources } = await supabase
    .from("data_sources")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  const activityData = [
    { date: "Mon", steps: 8500, calories: 320, distance: 6.2 },
    { date: "Tue", steps: 12000, calories: 450, distance: 8.5 },
    { date: "Wed", steps: 6800, calories: 280, distance: 5.1 },
    { date: "Thu", steps: 15000, calories: 580, distance: 11.2 },
    { date: "Fri", steps: 9200, calories: 380, distance: 7.3 },
    { date: "Sat", steps: 18000, calories: 720, distance: 14.5 },
    { date: "Sun", steps: 11500, calories: 460, distance: 8.8 },
  ]

  const dataDistribution = [
    { name: "Steps", value: dataPointsCount ? Math.floor(dataPointsCount * 0.4) : 40, color: "hsl(var(--primary))" },
    {
      name: "Heart Rate",
      value: dataPointsCount ? Math.floor(dataPointsCount * 0.25) : 25,
      color: "hsl(var(--chart-1))",
    },
    { name: "Calories", value: dataPointsCount ? Math.floor(dataPointsCount * 0.2) : 20, color: "hsl(var(--chart-2))" },
    {
      name: "Distance",
      value: dataPointsCount ? Math.floor(dataPointsCount * 0.15) : 15,
      color: "hsl(var(--chart-3))",
    },
  ]

  const weeklyData = [
    {
      day: "Mon",
      sessions: sessionsCount ? Math.floor(sessionsCount * 0.1) : 1,
      dataPoints: dataPointsCount ? Math.floor(dataPointsCount * 0.15) : 15,
    },
    {
      day: "Tue",
      sessions: sessionsCount ? Math.floor(sessionsCount * 0.2) : 2,
      dataPoints: dataPointsCount ? Math.floor(dataPointsCount * 0.18) : 18,
    },
    {
      day: "Wed",
      sessions: sessionsCount ? Math.floor(sessionsCount * 0.15) : 1,
      dataPoints: dataPointsCount ? Math.floor(dataPointsCount * 0.12) : 12,
    },
    {
      day: "Thu",
      sessions: sessionsCount ? Math.floor(sessionsCount * 0.25) : 2,
      dataPoints: dataPointsCount ? Math.floor(dataPointsCount * 0.22) : 22,
    },
    {
      day: "Fri",
      sessions: sessionsCount ? Math.floor(sessionsCount * 0.15) : 1,
      dataPoints: dataPointsCount ? Math.floor(dataPointsCount * 0.16) : 16,
    },
    {
      day: "Sat",
      sessions: sessionsCount ? Math.floor(sessionsCount * 0.1) : 1,
      dataPoints: dataPointsCount ? Math.floor(dataPointsCount * 0.1) : 10,
    },
    {
      day: "Sun",
      sessions: sessionsCount ? Math.floor(sessionsCount * 0.05) : 0,
      dataPoints: dataPointsCount ? Math.floor(dataPointsCount * 0.07) : 7,
    },
  ]

  const progressData = [
    { date: "Week 1", actual: 5000, target: 10000 },
    { date: "Week 2", actual: 7500, target: 10000 },
    { date: "Week 3", actual: 9200, target: 10000 },
    { date: "Week 4", actual: 11500, target: 10000 },
  ]

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary">Healthyduck</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{profile?.display_name || data.user.email}</p>
                <p className="text-xs text-muted-foreground">Fitness Enthusiast</p>
              </div>
              <form action={handleSignOut}>
                <Button variant="outline" type="submit" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.display_name || "Fitness Enthusiast"}!
          </h2>
          <p className="text-muted-foreground">Track your fitness journey and manage your health data with ease.</p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Sources</p>
                  <p className="text-3xl font-bold text-primary">{dataSourcesCount || 0}</p>
                </div>
                <Database className="w-8 h-8 text-primary" />
              </div>
              <div className="mt-4">
                <Progress value={Math.min((dataSourcesCount || 0) * 20, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Connected devices & apps</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Points</p>
                  <p className="text-3xl font-bold text-chart-1">{dataPointsCount || 0}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-chart-1" />
              </div>
              <div className="mt-4">
                <Progress value={Math.min((dataPointsCount || 0) / 10, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Fitness measurements</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                  <p className="text-3xl font-bold text-chart-3">{sessionsCount || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-chart-3" />
              </div>
              <div className="mt-4">
                <Progress value={Math.min((sessionsCount || 0) * 10, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Workout sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Sets</p>
                  <p className="text-3xl font-bold text-chart-4">{dataSetsCount || 0}</p>
                </div>
                <Target className="w-8 h-8 text-chart-4" />
              </div>
              <div className="mt-4">
                <Progress value={Math.min((dataSetsCount || 0) * 5, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Data collections</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ActivityChart data={activityData} />
          <DataDistributionChart data={dataDistribution} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WeeklySummaryChart data={weeklyData} />
          <ProgressChart
            data={progressData}
            title="Step Goal Progress"
            description="Weekly progress towards your 10,000 steps goal"
            metric="steps"
          />
        </div>

        <div className="mb-8">
          <AggregationPanel userId={data.user.id} />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button asChild className="h-auto p-4 flex-col gap-2">
                    <a href="/api/docs" target="_blank" rel="noreferrer">
                      <BarChart3 className="w-6 h-6" />
                      <span className="text-sm font-medium">View API Docs</span>
                      <span className="text-xs opacity-80">Integrate with our API</span>
                    </a>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent" disabled>
                    <Database className="w-6 h-6" />
                    <span className="text-sm font-medium">Add Data Source</span>
                    <span className="text-xs opacity-60">Coming Soon</span>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent" disabled>
                    <Activity className="w-6 h-6" />
                    <span className="text-sm font-medium">Log Workout</span>
                    <span className="text-xs opacity-60">Coming Soon</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest fitness sessions and data</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSessions && recentSessions.length > 0 ? (
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Activity className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {session.name || `Session ${session.session_id}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.start_time_millis).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Activity {session.activity_type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                    <p className="text-sm text-muted-foreground">Start logging workouts to see them here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Data Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Sources
                </CardTitle>
                <CardDescription>Connected apps and devices</CardDescription>
              </CardHeader>
              <CardContent>
                {recentDataSources && recentDataSources.length > 0 ? (
                  <div className="space-y-3">
                    {recentDataSources.map((source) => (
                      <div key={source.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Database className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{source.data_stream_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {source.type} • {source.data_type_name.split(".").pop()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Database className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No data sources</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent" disabled>
                      Add Source
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Health Insights
                </CardTitle>
                <CardDescription>AI-powered recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Stay Active</p>
                        <p className="text-xs text-muted-foreground">
                          Connect a data source to start tracking your fitness journey
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-chart-1/5 border border-chart-1/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-chart-1 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Set Goals</p>
                        <p className="text-xs text-muted-foreground">Define your fitness targets to stay motivated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Member since</span>
                    <span className="text-sm font-medium">
                      {new Date(profile?.created_at || "").toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total data points</span>
                    <span className="text-sm font-medium">{dataPointsCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active sessions</span>
                    <span className="text-sm font-medium">{sessionsCount || 0}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" disabled>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
