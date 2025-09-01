const axios = require("axios")

const API_BASE = process.env.API_BASE || "http://localhost:3000"
const TEST_USER_ID = "test-user-123"

// Mock authentication token for testing
const AUTH_TOKEN = "mock-jwt-token"

const apiClient = axios.create({
  baseURL: `${API_BASE}/api/fitness/v1`,
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "Content-Type": "application/json",
  },
})

describe("HealthyDuck Fitness API - JavaScript Integration Tests", () => {
  let testDataSourceId
  let testSessionId

  beforeAll(async () => {
    console.log("Setting up JavaScript API tests...")
  })

  afterAll(async () => {
    console.log("Cleaning up JavaScript API tests...")
  })

  describe("Data Sources API", () => {
    test("should create a new data source", async () => {
      const dataSource = {
        dataStreamName: "com.ultimatequack.step_count",
        type: "derived",
        application: {
          packageName: "com.ultimatequack.healthyduck",
          version: "1.0.0",
        },
        dataType: {
          name: "com.ultimatequack.step_count",
          field: [{ name: "steps", format: "integer" }],
        },
      }

      const response = await apiClient.post(`/users/${TEST_USER_ID}/dataSources`, dataSource)
      expect(response.status).toBe(201)
      expect(response.data.dataStreamId).toBeDefined()
      testDataSourceId = response.data.dataStreamId
    })

    test("should retrieve data sources", async () => {
      const response = await apiClient.get(`/users/${TEST_USER_ID}/dataSources`)
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data.dataSource)).toBe(true)
    })

    test("should handle fitness data insertion", async () => {
      const dataset = {
        dataSourceId: testDataSourceId,
        maxEndTimeNs: Date.now() * 1000000,
        minStartTimeNs: (Date.now() - 3600000) * 1000000,
        point: [
          {
            startTimeNanos: (Date.now() - 1800000) * 1000000,
            endTimeNanos: Date.now() * 1000000,
            dataTypeName: "com.ultimatequack.step_count",
            value: [{ intVal: 5000 }],
          },
        ],
      }

      const response = await apiClient.patch(
        `/users/${TEST_USER_ID}/dataSources/${testDataSourceId}/datasets/${dataset.minStartTimeNs}-${dataset.maxEndTimeNs}`,
        dataset,
      )
      expect(response.status).toBe(200)
    })
  })

  describe("Sessions API", () => {
    test("should create workout session", async () => {
      const session = {
        name: "Morning Run",
        description: "Daily cardio workout",
        startTimeMillis: Date.now() - 3600000,
        endTimeMillis: Date.now(),
        activityType: 8, // Running
        application: {
          packageName: "com.ultimatequack.healthyduck",
        },
      }

      const response = await apiClient.post(`/users/${TEST_USER_ID}/sessions`, session)
      expect(response.status).toBe(201)
      testSessionId = response.data.id
    })

    test("should retrieve user sessions", async () => {
      const response = await apiClient.get(`/users/${TEST_USER_ID}/sessions`)
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data.session)).toBe(true)
    })
  })

  describe("Data Aggregation", () => {
    test("should aggregate daily fitness data", async () => {
      const endTime = Date.now()
      const startTime = endTime - 24 * 60 * 60 * 1000 // 24 hours ago

      const response = await apiClient.get(`/users/${TEST_USER_ID}/dataset/aggregate/daily`, {
        params: {
          startTimeMillis: startTime,
          endTimeMillis: endTime,
          dataTypeName: "com.ultimatequack.step_count",
        },
      })

      expect(response.status).toBe(200)
      expect(response.data.bucket).toBeDefined()
    })
  })

  describe("Error Handling", () => {
    test("should handle unauthorized requests", async () => {
      const unauthorizedClient = axios.create({
        baseURL: `${API_BASE}/api/fitness/v1`,
      })

      try {
        await unauthorizedClient.get(`/users/${TEST_USER_ID}/dataSources`)
      } catch (error) {
        expect(error.response.status).toBe(401)
      }
    })

    test("should handle invalid data source creation", async () => {
      const invalidDataSource = {
        dataStreamName: "", // Invalid empty name
        type: "invalid_type",
      }

      try {
        await apiClient.post(`/users/${TEST_USER_ID}/dataSources`, invalidDataSource)
      } catch (error) {
        expect(error.response.status).toBe(400)
      }
    })
  })
})
