import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">Healthyduck</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Your Fitness Data, <span className="text-green-600">Your Way</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Healthyduck is a complete Google Fit API clone that gives you full control over your fitness data. Store,
            manage, and access your health metrics through our comprehensive REST API.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/auth/sign-up">Start Tracking</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/api/docs">View API Docs</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need for Fitness Data Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Data Sources</CardTitle>
                <CardDescription>
                  Connect multiple fitness apps and devices to centralize your health data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Mobile apps integration</li>
                  <li>• Wearable device support</li>
                  <li>• Custom data streams</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Data Points</CardTitle>
                <CardDescription>Store individual fitness measurements with precise timestamps</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Step counts & distance</li>
                  <li>• Heart rate & calories</li>
                  <li>• Custom metrics</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">Activity Sessions</CardTitle>
                <CardDescription>Track complete workout sessions with detailed activity data</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Workout tracking</li>
                  <li>• Activity classification</li>
                  <li>• Session analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* API Features */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete REST API</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Access all your fitness data through our comprehensive REST API, fully compatible with Google Fit API
            patterns and authentication flows.
          </p>
          <Button asChild size="lg" variant="outline">
            <Link href="/api/docs">Explore API Documentation</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
