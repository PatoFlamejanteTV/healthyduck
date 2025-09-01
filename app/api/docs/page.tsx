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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Healthyduck Fitness API</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            A comprehensive fitness API that provides complete access to fitness and health data. Store, retrieve, and
            manage fitness data through our RESTful API with full authentication and data privacy.
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
                    <li>Modern fitness API design and patterns</li>
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
        "name": "com.ultimatequack.step_count.delta",
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
    "name": "com.ultimatequack.step_count.delta"
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
      "dataTypeName": "com.ultimatequack.step_count.delta",
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
      "dataTypeName": "com.ultimatequack.step_count.delta",
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
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="tests">Tests</TabsTrigger>
                  </TabsList>

                  <TabsContent value="javascript" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">JavaScript/TypeScript Examples</h3>
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
        name: 'com.ultimatequack.step_count.delta'
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
          dataTypeName: 'com.ultimatequack.step_count.delta',
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
                  </TabsContent>

                  <TabsContent value="python" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Python Examples</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {`import requests
import time
import json
from datetime import datetime, timedelta

class HealthyduckAPI:
    def __init__(self, base_url, access_token):
        self.base_url = base_url.rstrip('/')
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    
    def create_data_source(self, user_id, data_source):
        """Create a new data source"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataSources"
        response = requests.post(url, headers=self.headers, json=data_source)
        response.raise_for_status()
        return response.json()
    
    def get_data_sources(self, user_id):
        """Get all data sources for a user"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataSources"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def add_data_points(self, user_id, data_source_id, start_time_ns, end_time_ns, points):
        """Add data points to a dataset"""
        dataset_id = f"{start_time_ns}-{end_time_ns}"
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataSources/{data_source_id}/datasets/{dataset_id}"
        
        data = {"point": points}
        response = requests.patch(url, headers=self.headers, json=data)
        response.raise_for_status()
        return response.json()
    
    def create_session(self, user_id, session_data):
        """Create a new activity session"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/sessions"
        response = requests.post(url, headers=self.headers, json=session_data)
        response.raise_for_status()
        return response.json()
    
    def get_sessions(self, user_id, start_time=None, end_time=None):
        """Get sessions for a user within a time range"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/sessions"
        params = {}
        if start_time:
            params['startTime'] = start_time
        if end_time:
            params['endTime'] = end_time
        
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()

# Example usage
def main():
    api = HealthyduckAPI('https://your-domain.com', 'your-access-token')
    user_id = 'me'  # or actual user ID
    
    # Create a step counter data source
    step_source = {
        'dataStreamId': 'python-app:step-counter:1',
        'dataStreamName': 'Python Step Counter',
        'type': 'raw',
        'dataType': {
            'name': 'com.ultimatequack.step_count.delta'
        },
        'application': {
            'packageName': 'com.example.python-app',
            'version': '1.0'
        }
    }
    
    try:
        # Create data source
        result = api.create_data_source(user_id, step_source)
        print(f"Created data source: {result}")
        
        # Add step data for the last hour
        now_ns = int(time.time() * 1_000_000_000)
        hour_ago_ns = now_ns - (60 * 60 * 1_000_000_000)
        
        step_points = [{
            'startTimeNanos': str(hour_ago_ns),
            'endTimeNanos': str(now_ns),
            'dataTypeName': 'com.ultimatequack.step_count.delta',
            'value': [{'intVal': 2500}]
        }]
        
        data_result = api.add_data_points(
            user_id, 
            'python-app:step-counter:1',
            hour_ago_ns,
            now_ns,
            step_points
        )
        print(f"Added step data: {data_result}")
        
        # Create a running session
        start_time_ms = int((datetime.now() - timedelta(hours=1)).timestamp() * 1000)
        end_time_ms = int(datetime.now().timestamp() * 1000)
        
        session = {
            'id': f'python-run-{start_time_ms}',
            'name': 'Python API Test Run',
            'description': 'Test session created via Python API',
            'startTimeMillis': str(start_time_ms),
            'endTimeMillis': str(end_time_ms),
            'activityType': 8,  # Running
            'activeTimeMillis': str(end_time_ms - start_time_ms)
        }
        
        session_result = api.create_session(user_id, session)
        print(f"Created session: {session_result}")
        
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")

if __name__ == '__main__':
    main()`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Data Processing Example</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {`import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

def analyze_fitness_data(api, user_id, days=7):
    """Analyze fitness data for the past N days"""
    
    # Get data sources
    sources = api.get_data_sources(user_id)
    
    # Get sessions for the past week
    end_time = datetime.now()
    start_time = end_time - timedelta(days=days)
    
    sessions = api.get_sessions(
        user_id,
        start_time=int(start_time.timestamp() * 1000),
        end_time=int(end_time.timestamp() * 1000)
    )
    
    if not sessions.get('session'):
        print("No sessions found")
        return
    
    # Convert to DataFrame for analysis
    session_data = []
    for session in sessions['session']:
        session_data.append({
            'name': session['name'],
            'activity_type': session['activityType'],
            'duration_minutes': int(session['activeTimeMillis']) / (1000 * 60),
            'start_time': datetime.fromtimestamp(int(session['startTimeMillis']) / 1000)
        })
    
    df = pd.DataFrame(session_data)
    
    # Basic statistics
    print("Fitness Data Analysis")
    print("=" * 30)
    print(f"Total sessions: {len(df)}")
    print(f"Total active time: {df['duration_minutes'].sum():.1f} minutes")
    print(f"Average session duration: {df['duration_minutes'].mean():.1f} minutes")
    
    # Activity type breakdown
    activity_counts = df['activity_type'].value_counts()
    print("\\nActivity breakdown:")
    activity_names = {8: 'Running', 1: 'Biking', 7: 'Walking', 0: 'Unknown'}
    for activity_type, count in activity_counts.items():
        name = activity_names.get(activity_type, f'Type {activity_type}')
        print(f"  {name}: {count} sessions")
    
    return df`}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="curl" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">cURL Examples</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {`#!/bin/bash

# Set your access token and base URL
ACCESS_TOKEN="your-access-token-here"
BASE_URL="https://your-domain.com"
USER_ID="me"

# Get user profile
echo "Getting user profile..."
curl -X GET \\
  "$BASE_URL/api/fitness/v1/users/$USER_ID/profile" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json"

echo -e "\\n\\n"

# Create a heart rate data source
echo "Creating heart rate data source..."
curl -X POST \\
  "$BASE_URL/api/fitness/v1/users/$USER_ID/dataSources" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataStreamId": "bash-app:heart-rate:1",
    "dataStreamName": "Heart Rate Monitor",
    "type": "raw",
    "dataType": {
      "name": "com.ultimatequack.heart_rate.bpm"
    },
    "device": {
      "uid": "device-123",
      "type": "watch",
      "manufacturer": "Example Corp",
      "model": "Fitness Watch Pro"
    }
  }'

echo -e "\\n\\n"

# Get all data sources
echo "Getting all data sources..."
curl -X GET \\
  "$BASE_URL/api/fitness/v1/users/$USER_ID/dataSources" \\
  -H "Authorization: Bearer $ACCESS_TOKEN"

echo -e "\\n\\n"

# Add heart rate data
echo "Adding heart rate data..."
NOW_NS=\\$(date +%s)000000000
HOUR_AGO_NS=\\$((\\$NOW_NS - 3600000000000))
DATASET_ID="\\$\\{HOUR_AGO_NS\\}-\\$\\{NOW_NS\\}"

curl -X PATCH \\
  "$BASE_URL/api/fitness/v1/users/$USER_ID/dataSources/bash-app:heart-rate:1/datasets/$DATASET_ID" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"point\\": [{
      \\"startTimeNanos\\": \\"\\$HOUR_AGO_NS\\",
      \\"endTimeNanos\\": \\"\\$NOW_NS\\",
      \\"dataTypeName\\": \\"com.ultimatequack.heart_rate.bpm\\",
      \\"value\\": [{\\"fpVal\\": 75.5}]
    }]
  }"

echo -e "\\n\\n"

# Create a workout session
echo "Creating workout session..."
START_TIME_MS=\\$((\\$(date +%s) * 1000 - 1800000))  # 30 minutes ago
END_TIME_MS=\\$((\\$(date +%s) * 1000))

curl -X POST \\
  "$BASE_URL/api/fitness/v1/users/$USER_ID/sessions" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"id\\": \\"bash-workout-\\$(date +%s)\\",
    \\"name\\": \\"HIIT Training\\",
    \\"description\\": \\"High-intensity interval training session\\",
    \\"startTimeMillis\\": \\"\\$START_TIME_MS\\",
    \\"endTimeMillis\\": \\"\\$END_TIME_MS\\",
    \\"activityType\\": 0,
    \\"activeTimeMillis\\": \\"1800000\\"
  }"

echo -e "\\n\\n"

# Get recent sessions
echo "Getting recent sessions..."
WEEK_AGO_MS=\\$((\\$(date +%s) * 1000 - 604800000))  # 7 days ago
NOW_MS=\\$((\\$(date +%s) * 1000))

curl -X GET \\
  "$BASE_URL/api/fitness/v1/users/$USER_ID/sessions?startTime=\\$WEEK_AGO_MS&endTime=\\$NOW_MS" \\
  -H "Authorization: Bearer $ACCESS_TOKEN"`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Windows Batch Examples</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {`@echo off
REM Windows batch file for Healthyduck API

set ACCESS_TOKEN=your-access-token-here
set BASE_URL=https://your-domain.com
set USER_ID=me

echo Getting user profile...
curl -X GET ^
  "%BASE_URL%/api/fitness/v1/users/%USER_ID%/profile" ^
  -H "Authorization: Bearer %ACCESS_TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo.

echo Creating step counter data source...
curl -X POST ^
  "%BASE_URL%/api/fitness/v1/users/%USER_ID%/dataSources" ^
  -H "Authorization: Bearer %ACCESS_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\\"dataStreamId\\":\\"batch-app:steps:1\\",\\"dataStreamName\\":\\"Windows Step Counter\\",\\"type\\":\\"raw\\",\\"dataType\\":{\\"name\\":\\"com.ultimatequack.step_count.delta\\"},\\"application\\":{\\"packageName\\":\\"com.example.batch-app\\",\\"version\\":\\"1.0\\"}}"

echo.
echo.

echo Adding step data...
REM Calculate timestamps (simplified - you might want to use PowerShell for better date handling)
set /a NOW_S=%date:~-4%%date:~4,2%%date:~7,2%
set /a NOW_NS=%NOW_S%000000000
set /a HOUR_AGO_NS=%NOW_NS%-3600000000000

curl -X PATCH ^
  "%BASE_URL%/api/fitness/v1/users/%USER_ID%/dataSources/batch-app:steps:1/datasets/%HOUR_AGO_NS%-%NOW_NS%" ^
  -H "Authorization: Bearer %ACCESS_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\\"point\\":[{\\"startTimeNanos\\":\\"%HOUR_AGO_NS%\\",\\"endTimeNanos\\":\\"%NOW_NS%\\",\\"dataTypeName\\":\\"com.ultimatequack.step_count.delta\\",\\"value\\":[{\\"intVal\\":3000}]}]}"

pause`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Data Download/Upload Examples</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {`#!/bin/bash

# Download fitness data as JSON
echo "Downloading fitness data..."
curl -X GET \\
  "$BASE_URL/api/fitness/v1/users/$USER_ID/dataSources" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -o "fitness_data_sources.json"

# Download session data for the past month
MONTH_AGO_MS=\\$((\\$(date +%s) * 1000 - 2592000000))  # 30 days ago
NOW_MS=\\$((\\$(date +%s) * 1000))

curl -X GET \\
  "$BASE_URL/api/fitness/v1/users/$USER_ID/sessions?startTime=\\$MONTH_AGO_MS&endTime=\\$NOW_MS" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -o "fitness_sessions.json"

echo "Data downloaded to fitness_data_sources.json and fitness_sessions.json"

# Bulk upload data from JSON file
echo "Uploading bulk session data..."
curl -X POST \\
  "$BASE_URL/api/fitness/v1/users/$USER_ID/sessions" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d @bulk_sessions.json

# Using wget as alternative
echo "Using wget to download data..."
wget --header="Authorization: Bearer $ACCESS_TOKEN" \\
     --header="Content-Type: application/json" \\
     -O "profile_data.json" \\
     "$BASE_URL/api/fitness/v1/users/$USER_ID/profile"`}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tests" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Python Test Suite</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {`import unittest
import requests
import time
import json
from datetime import datetime, timedelta

class TestHealthyduckAPI(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.base_url = 'https://your-domain.com'
        cls.access_token = 'your-test-access-token'
        cls.user_id = 'test-user-id'
        cls.headers = {
            'Authorization': f'Bearer {cls.access_token}',
            'Content-Type': 'application/json'
        }
        cls.test_data_source_id = None
        cls.test_session_id = None
    
    def test_01_create_data_source(self):
        """Test creating a new data source"""
        url = f"{self.base_url}/api/fitness/v1/users/{self.user_id}/dataSources"
        
        data_source = {
            'dataStreamId': 'test-app:step-counter:1',
            'dataStreamName': 'Test Step Counter',
            'type': 'raw',
            'dataType': {
                'name': 'com.ultimatequack.step_count.delta'
            },
            'application': {
                'packageName': 'com.example.test-app',
                'version': '1.0'
            }
        }
        
        response = requests.post(url, headers=self.headers, json=data_source)
        
        self.assertEqual(response.status_code, 201)
        result = response.json()
        self.assertIn('dataStreamId', result)
        self.assertEqual(result['dataStreamId'], 'test-app:step-counter:1')
        
        TestHealthyduckAPI.test_data_source_id = result['dataStreamId']
    
    def test_02_get_data_sources(self):
        """Test retrieving data sources"""
        url = f"{self.base_url}/api/fitness/v1/users/{self.user_id}/dataSources"
        
        response = requests.get(url, headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertIn('dataSource', result)
        self.assertIsInstance(result['dataSource'], list)
        
        # Check if our test data source exists
        data_source_ids = [ds['dataStreamId'] for ds in result['dataSource']]
        self.assertIn('test-app:step-counter:1', data_source_ids)
    
    def test_03_add_data_points(self):
        """Test adding data points to a dataset"""
        if not self.test_data_source_id:
            self.skipTest("No test data source available")
        
        now_ns = int(time.time() * 1_000_000_000)
        hour_ago_ns = now_ns - (60 * 60 * 1_000_000_000)
        dataset_id = f"{hour_ago_ns}-{now_ns}"
        
        url = f"{self.base_url}/api/fitness/v1/users/{self.user_id}/dataSources/{self.test_data_source_id}/datasets/{dataset_id}"
        
        data = {
            'point': [{
                'startTimeNanos': str(hour_ago_ns),
                'endTimeNanos': str(now_ns),
                'dataTypeName': 'com.ultimatequack.step_count.delta',
                'value': [{'intVal': 1000}]
            }]
        }
        
        response = requests.patch(url, headers=self.headers, json=data)
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertIn('point', result)
    
    def test_04_create_session(self):
        """Test creating an activity session"""
        start_time_ms = int((datetime.now() - timedelta(hours=1)).timestamp() * 1000)
        end_time_ms = int(datetime.now().timestamp() * 1000)
        
        session_data = {
            'id': f'test-session-{start_time_ms}',
            'name': 'Test Workout',
            'description': 'Unit test session',
            'startTimeMillis': str(start_time_ms),
            'endTimeMillis': str(end_time_ms),
            'activityType': 8,  # Running
            'activeTimeMillis': str(end_time_ms - start_time_ms)
        }
        
        url = f"{self.base_url}/api/fitness/v1/users/{self.user_id}/sessions"
        response = requests.post(url, headers=self.headers, json=session_data)
        
        self.assertEqual(response.status_code, 201)
        result = response.json()
        self.assertIn('id', result)
        self.assertEqual(result['name'], 'Test Workout')
        
        TestHealthyduckAPI.test_session_id = result['id']
    
    def test_05_get_sessions(self):
        """Test retrieving sessions"""
        end_time = int(datetime.now().timestamp() * 1000)
        start_time = int((datetime.now() - timedelta(days=7)).timestamp() * 1000)
        
        url = f"{self.base_url}/api/fitness/v1/users/{self.user_id}/sessions"
        params = {
            'startTime': start_time,
            'endTime': end_time
        }
        
        response = requests.get(url, headers=self.headers, params=params)
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertIn('session', result)
        self.assertIsInstance(result['session'], list)
    
    def test_06_get_user_profile(self):
        """Test retrieving user profile"""
        url = f"{self.base_url}/api/fitness/v1/users/{self.user_id}/profile"
        
        response = requests.get(url, headers=self.headers)
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertIn('id', result)
    
    def test_07_error_handling(self):
        """Test API error handling"""
        # Test with invalid data source ID
        url = f"{self.base_url}/api/fitness/v1/users/{self.user_id}/dataSources/invalid-id"
        
        response = requests.get(url, headers=self.headers)
        
        self.assertEqual(response.status_code, 404)
        result = response.json()
        self.assertIn('error', result)
    
    def test_08_unauthorized_access(self):
        """Test unauthorized access"""
        url = f"{self.base_url}/api/fitness/v1/users/{self.user_id}/profile"
        headers = {'Content-Type': 'application/json'}  # No auth header
        
        response = requests.get(url, headers=headers)
        
        self.assertEqual(response.status_code, 401)
    
    @classmethod
    def tearDownClass(cls):
        """Clean up test data"""
        if cls.test_data_source_id:
            url = f"{cls.base_url}/api/fitness/v1/users/{cls.user_id}/dataSources/{cls.test_data_source_id}"
            requests.delete(url, headers=cls.headers)
        
        if cls.test_session_id:
            url = f"{cls.base_url}/api/fitness/v1/users/{cls.user_id}/sessions/{cls.test_session_id}"
            requests.delete(url, headers=cls.headers)

if __name__ == '__main__':
    # Run tests
    unittest.main(verbosity=2)
    
    # Or run specific test
    # suite = unittest.TestLoader().loadTestsFromTestCase(TestHealthyduckAPI)
    # unittest.TextTestRunner(verbosity=2).run(suite)`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Performance Testing</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {`import time
import threading
import requests
from concurrent.futures import ThreadPoolExecutor
import statistics

class PerformanceTest:
    def __init__(self, base_url, access_token, user_id):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        self.user_id = user_id
        self.results = []
    
    def time_request(self, method, url, **kwargs):
        """Time a single request"""
        start_time = time.time()
        try:
            response = getattr(requests, method.lower())(url, headers=self.headers, **kwargs)
            end_time = time.time()
            return {
                'success': True,
                'status_code': response.status_code,
                'response_time': end_time - start_time,
                'size': len(response.content)
            }
        except Exception as e:
            end_time = time.time()
            return {
                'success': False,
                'error': str(e),
                'response_time': end_time - start_time
            }
    
    def test_concurrent_requests(self, num_threads=10, num_requests=100):
        """Test concurrent API requests"""
        url = f"{self.base_url}/api/fitness/v1/users/{self.user_id}/profile"
        
        def make_request():
            return self.time_request('GET', url)
        
        print(f"Testing {num_requests} concurrent requests with {num_threads} threads...")
        
        start_time = time.time()
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = [executor.submit(make_request) for _ in range(num_requests)]
            results = [future.result() for future in futures]
        
        end_time = time.time()
        
        # Analyze results
        successful_requests = [r for r in results if r['success']]
        failed_requests = [r for r in results if not r['success']]
        
        if successful_requests:
            response_times = [r['response_time'] for r in successful_requests]
            
            print(f"\\nPerformance Test Results:")
            print(f"Total time: {end_time - start_time:.2f}s")
            print(f"Successful requests: {len(successful_requests)}")
            print(f"Failed requests: {len(failed_requests)}")
            print(f"Average response time: {statistics.mean(response_times):.3f}s")
            print(f"Median response time: {statistics.median(response_times):.3f}s")
            print(f"Min response time: {min(response_times):.3f}s")
            print(f"Max response time: {max(response_times):.3f}s")
            print(f"Requests per second: {len(successful_requests) / (end_time - start_time):.2f}")
        
        return results

# Usage example
if __name__ == '__main__':
    perf_test = PerformanceTest(
        'https://your-domain.com',
        'your-access-token',
        'me'
    )
    
    perf_test.test_concurrent_requests(num_threads=5, num_requests=50)`}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
