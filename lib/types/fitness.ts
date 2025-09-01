// Type definitions for Healthyduck Fitness API

export interface DataSource {
  dataStreamId: string
  dataStreamName: string
  type: "raw" | "derived"
  dataType: {
    name: string
    field: DataTypeField[]
  }
  device?: {
    uid: string
    type: string
    manufacturer: string
    model: string
    version: string
  }
  application?: {
    packageName: string
    version?: string
    detailsUrl?: string
  }
}

export interface DataTypeField {
  name: string
  format: "integer" | "floatPoint" | "string" | "map"
  optional?: boolean
}

export interface DataPoint {
  startTimeNanos: string
  endTimeNanos: string
  dataTypeName: string
  modifiedTimeMillis: string
  value: DataValue[]
  originDataSourceId?: string
}

export interface DataValue {
  intVal?: number
  fpVal?: number
  stringVal?: string
  mapVal?: Record<string, any>
}

export interface DataSet {
  dataSourceId: string
  maxEndTimeNs: string
  minStartTimeNs: string
  point: DataPoint[]
  nextPageToken?: string
}

export interface Session {
  id: string
  name?: string
  description?: string
  startTimeMillis: string
  endTimeMillis: string
  modifiedTimeMillis: string
  activityType: number
  application?: {
    packageName: string
  }
  activeTimeMillis?: string
}

export interface UserProfile {
  userId: string
  email: string
  displayName?: string
  createdAt: string
  updatedAt: string
  statistics?: {
    dataSourcesCount: number
    dataPointsCount: number
    sessionsCount: number
  }
}

// Common activity types (matching HealthyDuck standards)
export const ActivityTypes = {
  UNKNOWN: 0,
  BIKING: 1,
  ON_FOOT: 2,
  STILL: 3,
  UNKNOWN_ACTIVITY: 4,
  TILTING: 5,
  WALKING: 7,
  RUNNING: 8,
  // Add more as needed
} as const

// Common data type names
export const DataTypeNames = {
  STEP_COUNT_DELTA: "com.ultimatequack.step_count.delta",
  DISTANCE_DELTA: "com.ultimatequack.distance.delta",
  CALORIES_EXPENDED: "com.ultimatequack.calories.expended",
  HEART_RATE_BPM: "com.ultimatequack.heart_rate.bpm",
  WEIGHT: "com.ultimatequack.weight",
  HEIGHT: "com.ultimatequack.height",
  // Add more as needed
} as const
