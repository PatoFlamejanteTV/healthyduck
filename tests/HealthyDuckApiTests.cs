using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Net;

namespace HealthyDuck.Tests
{
    [TestClass]
    public class HealthyDuckApiTests
    {
        private static HttpClient _httpClient;
        private static readonly string ApiBase = "http://localhost:3000/api/fitness/v1";
        private static readonly string TestUserId = "test-user-123";
        private static readonly string AuthToken = "mock-jwt-token";
        private static string _testDataSourceId;
        private static string _testSessionId;

        [ClassInitialize]
        public static void ClassInitialize(TestContext context)
        {
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {AuthToken}");
            _httpClient.DefaultRequestHeaders.Add("Content-Type", "application/json");
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            _httpClient?.Dispose();
        }

        [TestMethod]
        [TestCategory("DataSources")]
        public async Task CreateDataSource_ForDotNetHealthApp_ShouldSucceed()
        {
            var dataSource = new
            {
                dataStreamName = "com.ultimatequack.dotnet.blood_pressure",
                type = "raw",
                application = new
                {
                    packageName = "com.ultimatequack.healthyduck.dotnet",
                    version = "3.0.0",
                    detailsUrl = "https://apps.microsoft.com/store/detail/healthyduck"
                },
                dataType = new
                {
                    name = "com.ultimatequack.blood_pressure",
                    field = new[]
                    {
                        new { name = "systolic", format = "floatPoint" },
                        new { name = "diastolic", format = "floatPoint" }
                    }
                },
                device = new
                {
                    manufacturer = "Microsoft",
                    model = "Surface Pro 9",
                    type = "tablet",
                    uid = "dotnet_device_456",
                    version = "Windows 11"
                }
            };

            var json = JsonSerializer.Serialize(dataSource);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{ApiBase}/users/{TestUserId}/dataSources", content);

            Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var responseJson = JsonDocument.Parse(responseContent);
            _testDataSourceId = responseJson.RootElement.GetProperty("dataStreamId").GetString();
            
            Assert.IsNotNull(_testDataSourceId);
        }

        [TestMethod]
        [TestCategory("DataSources")]
        public async Task InsertHealthData_BloodPressureReading_ShouldSucceed()
        {
            if (string.IsNullOrEmpty(_testDataSourceId))
            {
                await CreateDataSource_ForDotNetHealthApp_ShouldSucceed();
            }

            var currentTimeNanos = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() * 1_000_000L;
            var startTimeNanos = currentTimeNanos - (300L * 1_000_000_000L); // 5 minutes ago

            var dataset = new
            {
                dataSourceId = _testDataSourceId,
                maxEndTimeNs = currentTimeNanos,
                minStartTimeNs = startTimeNanos,
                point = new[]
                {
                    new
                    {
                        startTimeNanos = startTimeNanos,
                        endTimeNanos = currentTimeNanos,
                        dataTypeName = "com.ultimatequack.blood_pressure",
                        value = new[]
                        {
                            new { fpVal = 120.5 }, // Systolic
                            new { fpVal = 80.2 }   // Diastolic
                        },
                        originDataSourceId = _testDataSourceId
                    }
                }
            };

            var json = JsonSerializer.Serialize(dataset);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var endpoint = $"{ApiBase}/users/{TestUserId}/dataSources/{_testDataSourceId}/datasets/{startTimeNanos}-{currentTimeNanos}";
            var response = await _httpClient.PatchAsync(endpoint, content);

            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }

        [TestMethod]
        [TestCategory("Sessions")]
        public async Task CreateWorkoutSession_YogaClass_ShouldSucceed()
        {
            var currentTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var startTime = currentTime - 3600000; // 1 hour ago

            var session = new
            {
                name = "Evening Yoga Session",
                description = "Relaxing yoga practice tracked via .NET health app",
                startTimeMillis = startTime,
                endTimeMillis = currentTime,
                activityType = 32, // Yoga
                application = new
                {
                    packageName = "com.ultimatequack.healthyduck.dotnet",
                    version = "3.0.0"
                },
                activeTimeMillis = currentTime - startTime
            };

            var json = JsonSerializer.Serialize(session);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{ApiBase}/users/{TestUserId}/sessions", content);

            Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var responseJson = JsonDocument.Parse(responseContent);
            _testSessionId = responseJson.RootElement.GetProperty("id").GetString();
            
            Assert.IsNotNull(_testSessionId);
        }

        [TestMethod]
        [TestCategory("Aggregation")]
        public async Task GetWeeklyHealthSummary_ShouldReturnAggregatedData()
        {
            var endTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var startTime = endTime - (7 * 24 * 60 * 60 * 1000L); // 7 days ago

            var endpoint = $"{ApiBase}/users/{TestUserId}/dataset/aggregate/daily" +
                          $"?startTimeMillis={startTime}&endTimeMillis={endTime}" +
                          $"&dataTypeName=com.ultimatequack.blood_pressure";

            var response = await _httpClient.GetAsync(endpoint);

            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            
            var responseContent = await response.Content.ReadAsStringAsync();
            var responseJson = JsonDocument.Parse(responseContent);
            
            Assert.IsTrue(responseJson.RootElement.TryGetProperty("bucket", out _));
        }

        [TestMethod]
        [TestCategory("Performance")]
        public async Task ConcurrentDataInsertion_MultipleHealthReadings_ShouldHandleLoad()
        {
            var tasks = new List<Task<HttpResponseMessage>>();
            
            // Simulate 10 concurrent health data insertions
            for (int i = 0; i < 10; i++)
            {
                var taskIndex = i;
                var task = Task.Run(async () =>
                {
                    var dataSource = new
                    {
                        dataStreamName = $"com.ultimatequack.dotnet.glucose_{taskIndex}",
                        type = "raw",
                        application = new
                        {
                            packageName = "com.ultimatequack.healthyduck.dotnet",
                            version = "3.0.0"
                        },
                        dataType = new
                        {
                            name = "com.ultimatequack.blood_glucose",
                            field = new[] { new { name = "glucose_level", format = "floatPoint" } }
                        }
                    };

                    var json = JsonSerializer.Serialize(dataSource);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    return await _httpClient.PostAsync($"{ApiBase}/users/{TestUserId}/dataSources", content);
                });
                
                tasks.Add(task);
            }

            var responses = await Task.WhenAll(tasks);

            foreach (var response in responses)
            {
                Assert.IsTrue(response.StatusCode == HttpStatusCode.Created || 
                             response.StatusCode == HttpStatusCode.Conflict,
                             "Concurrent requests should succeed or handle conflicts gracefully");
                response.Dispose();
            }
        }

        [TestMethod]
        [TestCategory("ErrorHandling")]
        public async Task InvalidDataSource_ShouldReturnBadRequest()
        {
            var invalidDataSource = new
            {
                dataStreamName = "", // Invalid empty name
                type = "invalid_type"
            };

            var json = JsonSerializer.Serialize(invalidDataSource);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{ApiBase}/users/{TestUserId}/dataSources", content);

            Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [TestMethod]
        [TestCategory("ErrorHandling")]
        public async Task UnauthorizedRequest_ShouldReturnUnauthorized()
        {
            using var unauthorizedClient = new HttpClient();
            // No authorization header

            var response = await unauthorizedClient.GetAsync($"{ApiBase}/users/{TestUserId}/dataSources");

            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        [TestCategory("Integration")]
        public async Task FullWorkflow_CreateDataSourceInsertDataCreateSession_ShouldSucceed()
        {
            // Step 1: Create data source
            await CreateDataSource_ForDotNetHealthApp_ShouldSucceed();
            
            // Step 2: Insert health data
            await InsertHealthData_BloodPressureReading_ShouldSucceed();
            
            // Step 3: Create workout session
            await CreateWorkoutSession_YogaClass_ShouldSucceed();
            
            // Step 4: Verify data retrieval
            var response = await _httpClient.GetAsync($"{ApiBase}/users/{TestUserId}/dataSources");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            
            var sessionsResponse = await _httpClient.GetAsync($"{ApiBase}/users/{TestUserId}/sessions");
            Assert.AreEqual(HttpStatusCode.OK, sessionsResponse.StatusCode);
        }
    }
}
