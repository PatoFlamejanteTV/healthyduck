import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-green-600">
                Healthyduck
              </Link>
              <Badge variant="secondary">API Documentation</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Healthyduck Fitness API</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            A complete Google Fit API clone that provides comprehensive access to fitness and health data. Store,
            retrieve, and manage fitness data through our RESTful API with full authentication and data privacy.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="datasources">Data Sources</TabsTrigger>
            <TabsTrigger value="datasets">Data Sets</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Learn how to integrate with the Healthyduck Fitness API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm">https://your-domain.com/api/fitness/v1</code>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Complete Google Fit API compatibility</li>
                    <li>Secure authentication with Supabase</li>
                    <li>Real-time fitness data storage and retrieval</li>
                    <li>Support for multiple data sources and devices</li>
                    <li>Activity session tracking</li>
                    <li>Data aggregation and analytics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Supported Data Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Badge variant="outline">Step Count</Badge>
                    <Badge variant="outline">Distance</Badge>
                    <Badge variant="outline">Calories</Badge>
                    <Badge variant="outline">Heart Rate</Badge>
                    <Badge variant="outline">Weight</Badge>
                    <Badge variant="outline">Height</Badge>
                    <Badge variant="outline">Sleep</Badge>
                    <Badge variant="outline">Activity</Badge>
                    <Badge variant="outline">Location</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Create an Account</h4>
                    <p className="text-gray-600">Sign up for a Healthyduck account to get API access.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">2. Authenticate</h4>
                    <p className="text-gray-600">Use your credentials to obtain an authentication token.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">3. Create Data Sources</h4>
                    <p className="text-gray-600">Register your app or device as a data source.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">4. Start Sending Data</h4>
                    <p className="text-gray-600">Begin storing fitness data through our API endpoints.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>All API requests require authentication using Supabase Auth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Authentication Flow</h3>
                  <p className="text-gray-600 mb-4">
                    Healthyduck uses Supabase authentication. You need to sign in to get an access token.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Sign In Request</h4>
                    <pre className="text-sm overflow-x-auto">
                      {`POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Using the Token</h3>
                  <p className="text-gray-600 mb-4">
                    Include the access token in the Authorization header for all API requests.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm">{`Authorization: Bearer YOUR_ACCESS_TOKEN`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">User ID</h3>
                  <p className="text-gray-600">
                    Most endpoints require a userId parameter. Use "me" to refer to the authenticated user, or use the
                    actual user ID from the authentication response.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datasources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Sources API</CardTitle>
                <CardDescription>Manage fitness data sources (apps, devices, sensors)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Badge className="bg-green-600">GET</Badge>
                    List Data Sources
                  </h3>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    GET /api/fitness/v1/users/{`{userId}`}/dataSources
                  </code>
                  <p className="text-gray-600 mt-2">Retrieve all data sources for a user.</p>

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold mb-2">Response Example</h4>
                    <pre className="text-sm overflow-x-auto">
                      {`{
  "dataSource": [
    {
      "dataStreamId": "my-app:step-counter:1",
      "dataStreamName": "Step Counter",
      "type": "raw",
      "dataType": {
        "name": "com.google.step_count.delta",
        "field": []
      },
      "application": {
        "packageName": "com.example.myapp",
        "version": "1.0"
      }
    }
  ]
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Badge className="bg-blue-600">POST</Badge>
                    Create Data Source
                  </h3>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    POST /api/fitness/v1/users/{`{userId}`}/dataSources
                  </code>
                  <p className="text-gray-600 mt-2">Create a new data source.</p>

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold mb-2">Request Body</h4>
                    <pre className="text-sm overflow-x-auto">
                      {`{
  "dataStreamId": "my-app:step-counter:1",
  "dataStreamName": "Step Counter",
  "type": "raw",
  "dataType": {
    "name": "com.google.step_count.delta"
  },
  "application": {
    "packageName": "com.example.myapp",
    "version": "1.0"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Badge className="bg-red-600">DELETE</Badge>
                    Delete Data Source
                  </h3>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    DELETE /api/fitness/v1/users/{`{userId}`}/dataSources/{`{dataSourceId}`}
                  </code>
                  <p className="text-gray-600 mt-2">Delete a data source and all associated data.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datasets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Sets API</CardTitle>
                <CardDescription>Store and retrieve fitness data points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Badge className="bg-green-600">GET</Badge>
                    Get Data Set
                  </h3>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    GET /api/fitness/v1/users/{`{userId}`}/dataSources/{`{dataSourceId}`}/datasets/{`{datasetId}`}
                  </code>
                  <p className="text-gray-600 mt-2">
                    Retrieve data points for a time range. Dataset ID format: startTimeNanos-endTimeNanos
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold mb-2">Response Example</h4>
                    <pre className="text-sm overflow-x-auto">
                      {`{
  "dataSourceId": "my-app:step-counter:1",
  "maxEndTimeNs": "1640995200000000000",
  "minStartTimeNs": "1640908800000000000",
  "point": [
    {
      "startTimeNanos": "1640908800000000000",
      "endTimeNanos": "1640912400000000000",
      "dataTypeName": "com.google.step_count.delta",
      "value": [
        {
          "intVal": 1500
        }
      ]
    }
  ]
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Badge className="bg-orange-600">PATCH</Badge>
                    Update Data Set
                  </h3>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    PATCH /api/fitness/v1/users/{`{userId}`}/dataSources/{`{dataSourceId}`}/datasets/{`{datasetId}`}
                  </code>
                  <p className="text-gray-600 mt-2">Add or update data points in a dataset.</p>

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold mb-2">Request Body</h4>
                    <pre className="text-sm overflow-x-auto">
                      {`{
  "point": [
    {
      "startTimeNanos": "1640908800000000000",
      "endTimeNanos": "1640912400000000000",
      "dataTypeName": "com.google.step_count.delta",
      "value": [
        {
          "intVal": 1500
        }
      ]
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sessions API</CardTitle>
                <CardDescription>Manage workout and activity sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Badge className="bg-green-600">GET</Badge>
                    List Sessions
                  </h3>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    GET /api/fitness/v1/users/{`{userId}`}/sessions?startTime={`{startTime}`}&endTime={`{endTime}`}
                  </code>
                  <p className="text-gray-600 mt-2">Retrieve sessions within a time range.</p>

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold mb-2">Response Example</h4>
                    <pre className="text-sm overflow-x-auto">
                      {`{
  "session": [
    {
      "id": "workout-123",
      "name": "Morning Run",
      "description": "5K run in the park",
      "startTimeMillis": "1640908800000",
      "endTimeMillis": "1640910600000",
      "activityType": 8,
      "activeTimeMillis": "1800000"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Badge className="bg-blue-600">POST</Badge>
                    Create Session
                  </h3>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    POST /api/fitness/v1/users/{`{userId}`}/sessions
                  </code>
                  <p className="text-gray-600 mt-2">Create a new activity session.</p>

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold mb-2">Request Body</h4>
                    <pre className="text-sm overflow-x-auto">
                      {`{
  "id": "workout-123",
  "name": "Morning Run",
  "description": "5K run in the park",
  "startTimeMillis": "1640908800000",
  "endTimeMillis": "1640910600000",
  "activityType": 8,
  "activeTimeMillis": "1800000"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Activity Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="text-sm">
                      <code>0</code> - Unknown
                    </div>
                    <div className="text-sm">
                      <code>1</code> - Biking
                    </div>
                    <div className="text-sm">
                      <code>2</code> - On Foot
                    </div>
                    <div className="text-sm">
                      <code>3</code> - Still
                    </div>
                    <div className="text-sm">
                      <code>7</code> - Walking
                    </div>
                    <div className="text-sm">
                      <code>8</code> - Running
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>Sample code for common API operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">JavaScript/TypeScript</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      {`// Create a data source
const createDataSource = async (accessToken, userId) => {
  const response = await fetch(\`/api/fitness/v1/users/\${userId}/dataSources\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dataStreamId: 'my-app:step-counter:1',
      dataStreamName: 'Step Counter',
      type: 'raw',
      dataType: {
        name: 'com.google.step_count.delta'
      },
      application: {
        packageName: 'com.example.myapp',
        version: '1.0'
      }
    })
  });
  
  return response.json();
};

// Add step count data
const addStepData = async (accessToken, userId, dataSourceId) => {
  const now = Date.now() * 1000000; // Convert to nanoseconds
  const oneHourAgo = now - (60 * 60 * 1000 * 1000000);
  
  const datasetId = \`\${oneHourAgo}-\${now}\`;
  
  const response = await fetch(
    \`/api/fitness/v1/users/\${userId}/dataSources/\${dataSourceId}/datasets/\${datasetId}\`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        point: [{
          startTimeNanos: oneHourAgo.toString(),
          endTimeNanos: now.toString(),
          dataTypeName: 'com.google.step_count.delta',
          value: [{ intVal: 1500 }]
        }]
      })
    }
  );
  
  return response.json();
};`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Python</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      {`import requests
import time

def create_session(access_token, user_id):
    url = f"/api/fitness/v1/users/{user_id}/sessions"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Create a 30-minute running session
    start_time = int(time.time() * 1000)
    end_time = start_time + (30 * 60 * 1000)  # 30 minutes later
    
    data = {
        "id": f"run-{start_time}",
        "name": "Morning Run",
        "description": "Daily morning jog",
        "startTimeMillis": str(start_time),
        "endTimeMillis": str(end_time),
        "activityType": 8,  # Running
        "activeTimeMillis": str(30 * 60 * 1000)  # 30 minutes
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">cURL</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      {`# Get user profile
curl -X GET \\
  "/api/fitness/v1/users/me/profile" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create data source
curl -X POST \\
  "/api/fitness/v1/users/me/dataSources" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataStreamId": "my-app:heart-rate:1",
    "dataStreamName": "Heart Rate Monitor",
    "type": "raw",
    "dataType": {
      "name": "com.google.heart_rate.bpm"
    },
    "device": {
      "uid": "device-123",
      "type": "watch",
      "manufacturer": "Example Corp",
      "model": "Fitness Watch Pro"
    }
  }'`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Handling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Common HTTP Status Codes</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <code>200</code> - Success
                      </div>
                      <div>
                        <code>201</code> - Created
                      </div>
                      <div>
                        <code>400</code> - Bad Request
                      </div>
                      <div>
                        <code>401</code> - Unauthorized
                      </div>
                      <div>
                        <code>404</code> - Not Found
                      </div>
                      <div>
                        <code>409</code> - Conflict (duplicate resource)
                      </div>
                      <div>
                        <code>500</code> - Internal Server Error
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Error Response Format</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm">
                        {`{
  "error": "Detailed error message"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
