/**
 * HealthyDuck API TypeScript Client
 * Modern client library for web and Node.js applications
 */

export interface HealthyDuckClientConfig {
  baseUrl: string
  accessToken: string
  timeout?: number
}

export interface DataSource {
  dataStreamId: string
  dataStreamName: string
  type: string
  application: Application
  dataType: DataType[]
}

export interface Application {
  packageName: string
  version: string
  name: string
}

export interface DataType {
  name: string
  field: Field[]
}

export interface Field {
  name: string
  format: string
  optional: boolean
}

export interface DataPoint {
  startTimeNanos: number
  endTimeNanos: number
  dataTypeName: string
  value: Value[]
  originDataSourceId?: string
}

export interface Value {
  intVal?: number
  fpVal?: number
  stringVal?: string
  boolVal?: boolean
}

export interface Session {
  id?: string
  name: string
  description?: string
  startTimeMillis: number
  endTimeMillis: number
  modifiedTimeMillis?: string
  activityType: number
  application: Application
}

export interface AggregationRequest {
  startTimeNanos: number
  endTimeNanos: number
  dataTypes: string[]
  bucketType?: "day" | "week" | "month"
}

export interface AggregationResult {
  bucket: Bucket[]
}

export interface Bucket {
  startTimeNanos: number
  endTimeNanos: number
  dataset: Record<string, DataSet>
}

export interface DataSet {
  dataSourceId: string
  point: DataPoint[]
}

export class HealthyDuckClient {
  private config: HealthyDuckClientConfig

  constructor(config: HealthyDuckClientConfig) {
    this.config = {
      timeout: 10000,
      ...config,
      baseUrl: config.baseUrl.replace(/\/$/, ""),
    }
  }

  // Data Sources
  async createDataSource(userId: string, dataSource: Omit<DataSource, "dataStreamId">): Promise<DataSource> {
    return this.request(`/api/fitness/v1/users/${userId}/dataSources`, {
      method: "POST",
      body: JSON.stringify(dataSource),
    })
  }

  async getDataSources(userId: string): Promise<DataSource[]> {
    const response = await this.request(`/api/fitness/v1/users/${userId}/dataSources`)
    return response.dataSources
  }

  async getDataSource(userId: string, dataSourceId: string): Promise<DataSource> {
    return this.request(`/api/fitness/v1/users/${userId}/dataSources/${dataSourceId}`)
  }

  async deleteDataSource(userId: string, dataSourceId: string): Promise<void> {
    await this.request(`/api/fitness/v1/users/${userId}/dataSources/${dataSourceId}`, {
      method: "DELETE",
    })
  }

  // Data Points
  async insertDataPoints(
    userId: string,
    dataSourceId: string,
    datasetId: string,
    dataPoints: DataPoint[],
  ): Promise<void> {
    await this.request(`/api/fitness/v1/users/${userId}/dataSources/${dataSourceId}/datasets/${datasetId}`, {
      method: "PATCH",
      body: JSON.stringify({ dataPoints }),
    })
  }

  async getDataPoints(userId: string, dataSourceId: string, datasetId: string): Promise<DataPoint[]> {
    const response = await this.request(
      `/api/fitness/v1/users/${userId}/dataSources/${dataSourceId}/datasets/${datasetId}`,
    )
    return response.dataPoints
  }

  // Sessions
  async createSession(userId: string, session: Omit<Session, "id">): Promise<Session> {
    return this.request(`/api/fitness/v1/users/${userId}/sessions`, {
      method: "POST",
      body: JSON.stringify(session),
    })
  }

  async getSessions(userId: string, options?: { startTime?: Date; endTime?: Date }): Promise<Session[]> {
    let url = `/api/fitness/v1/users/${userId}/sessions`

    if (options?.startTime || options?.endTime) {
      const params = new URLSearchParams()
      if (options.startTime) {
        params.append("startTime", (options.startTime.getTime() * 1000000).toString())
      }
      if (options.endTime) {
        params.append("endTime", (options.endTime.getTime() * 1000000).toString())
      }
      url += `?${params.toString()}`
    }

    const response = await this.request(url)
    return response.sessions
  }

  async getSession(userId: string, sessionId: string): Promise<Session> {
    return this.request(`/api/fitness/v1/users/${userId}/sessions/${sessionId}`)
  }

  async updateSession(userId: string, sessionId: string, session: Partial<Session>): Promise<Session> {
    return this.request(`/api/fitness/v1/users/${userId}/sessions/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(session),
    })
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    await this.request(`/api/fitness/v1/users/${userId}/sessions/${sessionId}`, {
      method: "DELETE",
    })
  }

  // Aggregation
  async getAggregatedData(userId: string, request: AggregationRequest): Promise<AggregationResult> {
    return this.request(`/api/fitness/v1/users/${userId}/dataset/aggregate`, {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async getDailyAggregation(
    userId: string,
    startDate: Date,
    endDate: Date,
    dataTypes: string[],
  ): Promise<AggregationResult> {
    return this.request(`/api/fitness/v1/users/${userId}/dataset/aggregate/daily`, {
      method: "POST",
      body: JSON.stringify({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        dataTypes,
      }),
    })
  }

  // Helper Methods
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.accessToken}`,
        "User-Agent": "HealthyDuck-TypeScript-Client/1.0",
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.config.timeout!),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new HealthyDuckError(`API Error: ${response.status} ${response.statusText}`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
    }

    return response.json()
  }

  // Utility methods for common fitness data operations
  static createStepsDataPoint(steps: number, startTime: Date, endTime: Date): DataPoint {
    return {
      startTimeNanos: startTime.getTime() * 1000000,
      endTimeNanos: endTime.getTime() * 1000000,
      dataTypeName: "com.ultimatequack.step_count.delta",
      value: [{ intVal: steps }],
    }
  }

  static createCaloriesDataPoint(calories: number, startTime: Date, endTime: Date): DataPoint {
    return {
      startTimeNanos: startTime.getTime() * 1000000,
      endTimeNanos: endTime.getTime() * 1000000,
      dataTypeName: "com.ultimatequack.calories.expended",
      value: [{ fpVal: calories }],
    }
  }

  static createDistanceDataPoint(meters: number, startTime: Date, endTime: Date): DataPoint {
    return {
      startTimeNanos: startTime.getTime() * 1000000,
      endTimeNanos: endTime.getTime() * 1000000,
      dataTypeName: "com.ultimatequack.distance.delta",
      value: [{ fpVal: meters }],
    }
  }
}

export class HealthyDuckError extends Error {
  public readonly details: {
    status: number
    statusText: string
    body: string
  }

  constructor(message: string, details: { status: number; statusText: string; body: string }) {
    super(message)
    this.name = "HealthyDuckError"
    this.details = details
  }
}

// Export default instance creator
export const createHealthyDuckClient = (config: HealthyDuckClientConfig): HealthyDuckClient => {
  return new HealthyDuckClient(config)
}
