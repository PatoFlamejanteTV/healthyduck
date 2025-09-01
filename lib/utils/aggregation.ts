export interface AggregationRequest {
  aggregateBy: Array<{
    dataTypeName: string
    dataSourceId?: string
  }>
  bucketByTime: {
    durationMillis: number
    period?: {
      type: "day" | "week" | "month"
      value: number
      timeZoneId?: string
    }
  }
  startTimeMillis: number
  endTimeMillis: number
  dataSourceId?: string
}

export interface AggregationBucket {
  startTimeMillis: number
  endTimeMillis: number
  dataset: Array<{
    dataSourceId: string
    point: Array<{
      dataTypeName: string
      startTimeNanos: number
      endTimeNanos: number
      value: Array<{
        fpVal?: number
        intVal?: number
        stringVal?: string
      }>
    }>
  }>
}

export class AggregationUtils {
  static createTimeBuckets(
    startTime: number,
    endTime: number,
    bucketSize: number,
  ): Array<{ start: number; end: number }> {
    const buckets = []
    let currentStart = startTime

    while (currentStart < endTime) {
      const currentEnd = Math.min(currentStart + bucketSize, endTime)
      buckets.push({ start: currentStart, end: currentEnd })
      currentStart = currentEnd
    }

    return buckets
  }

  static aggregateValues(values: any[], aggregationType: "sum" | "avg" | "min" | "max" = "sum"): number {
    if (values.length === 0) return 0

    const numericValues = values.map((v) => {
      if (v.fpVal !== undefined) return v.fpVal
      if (v.intVal !== undefined) return v.intVal
      return 0
    })

    switch (aggregationType) {
      case "sum":
        return numericValues.reduce((sum, val) => sum + val, 0)
      case "avg":
        return numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
      case "min":
        return Math.min(...numericValues)
      case "max":
        return Math.max(...numericValues)
      default:
        return numericValues.reduce((sum, val) => sum + val, 0)
    }
  }

  static getBucketDuration(period: string): number {
    switch (period.toLowerCase()) {
      case "hour":
        return 60 * 60 * 1000
      case "day":
        return 24 * 60 * 60 * 1000
      case "week":
        return 7 * 24 * 60 * 60 * 1000
      case "month":
        return 30 * 24 * 60 * 60 * 1000
      default:
        return 24 * 60 * 60 * 1000 // Default to day
    }
  }
}
