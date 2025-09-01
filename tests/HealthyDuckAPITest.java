import org.junit.jupiter.api.*;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Execution(ExecutionMode.CONCURRENT)
public class HealthyDuckAPITest {
    
    private static final String API_BASE = "http://localhost:3000/api/fitness/v1";
    private static final String TEST_USER_ID = "test-user-123";
    private static final String AUTH_TOKEN = "mock-jwt-token";
    
    private static HttpClient httpClient;
    private static ObjectMapper objectMapper;
    private static String testDataSourceId;
    private static String testSessionId;
    
    @BeforeAll
    static void setUp() {
        httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
        objectMapper = new ObjectMapper();
    }
    
    @AfterAll
    static void tearDown() {
        // Cleanup test data
        System.out.println("Java API tests completed");
    }
    
    private HttpRequest.Builder createRequestBuilder(String endpoint) {
        return HttpRequest.newBuilder()
            .uri(URI.create(API_BASE + endpoint))
            .header("Authorization", "Bearer " + AUTH_TOKEN)
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(30));
    }
    
    @Test
    @Order(1)
    @DisplayName("Create Data Source for Android Fitness App")
    void testCreateDataSource() throws Exception {
        String dataSourceJson = """
            {
                "dataStreamName": "com.ultimatequack.android.steps",
                "type": "raw",
                "application": {
                    "packageName": "com.ultimatequack.healthyduck.android",
                    "version": "2.1.0",
                    "detailsUrl": "https://play.google.com/store/apps/details?id=com.ultimatequack.healthyduck"
                },
                "dataType": {
                    "name": "com.ultimatequack.step_count",
                    "field": [
                        {"name": "steps", "format": "integer"}
                    ]
                },
                "device": {
                    "manufacturer": "Samsung",
                    "model": "Galaxy S23",
                    "type": "phone",
                    "uid": "android_device_123",
                    "version": "Android 14"
                }
            }
            """;
        
        HttpRequest request = createRequestBuilder("/users/" + TEST_USER_ID + "/dataSources")
            .POST(HttpRequest.BodyPublishers.ofString(dataSourceJson))
            .build();
        
        HttpResponse<String> response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        Assertions.assertEquals(201, response.statusCode(), 
            "Data source creation should return 201");
        
        JsonNode responseJson = objectMapper.readTree(response.body());
        testDataSourceId = responseJson.get("dataStreamId").asText();
        Assertions.assertNotNull(testDataSourceId, "Data source ID should be returned");
    }
    
    @Test
    @Order(2)
    @DisplayName("Insert Fitness Data from Android Device")
    void testInsertFitnessData() throws Exception {
        long currentTimeNanos = Instant.now().toEpochMilli() * 1_000_000L;
        long startTimeNanos = currentTimeNanos - (3600L * 1_000_000_000L); // 1 hour ago
        
        String datasetJson = String.format("""
            {
                "dataSourceId": "%s",
                "maxEndTimeNs": %d,
                "minStartTimeNs": %d,
                "point": [
                    {
                        "startTimeNanos": %d,
                        "endTimeNanos": %d,
                        "dataTypeName": "com.ultimatequack.step_count",
                        "value": [{"intVal": 8500}],
                        "originDataSourceId": "%s"
                    }
                ]
            }
            """, testDataSourceId, currentTimeNanos, startTimeNanos, 
                 startTimeNanos, currentTimeNanos, testDataSourceId);
        
        String endpoint = String.format("/users/%s/dataSources/%s/datasets/%d-%d",
            TEST_USER_ID, testDataSourceId, startTimeNanos, currentTimeNanos);
        
        HttpRequest request = createRequestBuilder(endpoint)
            .method("PATCH", HttpRequest.BodyPublishers.ofString(datasetJson))
            .build();
        
        HttpResponse<String> response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        Assertions.assertEquals(200, response.statusCode(), 
            "Data insertion should return 200");
    }
    
    @Test
    @Order(3)
    @DisplayName("Create Workout Session from Android App")
    void testCreateWorkoutSession() throws Exception {
        long currentTime = Instant.now().toEpochMilli();
        long startTime = currentTime - 3600000; // 1 hour ago
        
        String sessionJson = String.format("""
            {
                "name": "Android Tracked Run",
                "description": "GPS tracked running session from Android device",
                "startTimeMillis": %d,
                "endTimeMillis": %d,
                "activityType": 8,
                "application": {
                    "packageName": "com.ultimatequack.healthyduck.android",
                    "version": "2.1.0"
                },
                "activeTimeMillis": %d
            }
            """, startTime, currentTime, currentTime - startTime);
        
        HttpRequest request = createRequestBuilder("/users/" + TEST_USER_ID + "/sessions")
            .POST(HttpRequest.BodyPublishers.ofString(sessionJson))
            .build();
        
        HttpResponse<String> response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        Assertions.assertEquals(201, response.statusCode(), 
            "Session creation should return 201");
        
        JsonNode responseJson = objectMapper.readTree(response.body());
        testSessionId = responseJson.get("id").asText();
        Assertions.assertNotNull(testSessionId, "Session ID should be returned");
    }
    
    @Test
    @Order(4)
    @DisplayName("Test Concurrent Data Sync from Multiple Android Devices")
    void testConcurrentDataSync() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(5);
        List<CompletableFuture<HttpResponse<String>>> futures = new ArrayList<>();
        
        // Simulate 5 Android devices syncing data simultaneously
        for (int i = 0; i < 5; i++) {
            final int deviceId = i;
            CompletableFuture<HttpResponse<String>> future = CompletableFuture.supplyAsync(() -> {
                try {
                    String dataSourceJson = String.format("""
                        {
                            "dataStreamName": "com.ultimatequack.android.device_%d.heart_rate",
                            "type": "raw",
                            "application": {
                                "packageName": "com.ultimatequack.healthyduck.android",
                                "version": "2.1.0"
                            },
                            "dataType": {
                                "name": "com.ultimatequack.heart_rate",
                                "field": [{"name": "bpm", "format": "floatPoint"}]
                            },
                            "device": {
                                "manufacturer": "Samsung",
                                "model": "Galaxy S23",
                                "type": "phone",
                                "uid": "android_device_%d"
                            }
                        }
                        """, deviceId, deviceId);
                    
                    HttpRequest request = createRequestBuilder("/users/" + TEST_USER_ID + "/dataSources")
                        .POST(HttpRequest.BodyPublishers.ofString(dataSourceJson))
                        .build();
                    
                    return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }, executor);
            
            futures.add(future);
        }
        
        // Wait for all requests to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        // Verify all requests succeeded
        for (CompletableFuture<HttpResponse<String>> future : futures) {
            HttpResponse<String> response = future.get();
            Assertions.assertTrue(response.statusCode() == 201 || response.statusCode() == 409,
                "Concurrent data sync should succeed or handle conflicts gracefully");
        }
        
        executor.shutdown();
    }
    
    @Test
    @Order(5)
    @DisplayName("Test Data Aggregation for Android Dashboard")
    void testDataAggregation() throws Exception {
        long endTime = Instant.now().toEpochMilli();
        long startTime = endTime - (7 * 24 * 60 * 60 * 1000L); // 7 days ago
        
        String endpoint = String.format("/users/%s/dataset/aggregate/daily?startTimeMillis=%d&endTimeMillis=%d&dataTypeName=com.ultimatequack.step_count",
            TEST_USER_ID, startTime, endTime);
        
        HttpRequest request = createRequestBuilder(endpoint)
            .GET()
            .build();
        
        HttpResponse<String> response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        Assertions.assertEquals(200, response.statusCode(), 
            "Data aggregation should return 200");
        
        JsonNode responseJson = objectMapper.readTree(response.body());
        Assertions.assertTrue(responseJson.has("bucket"), 
            "Aggregation response should contain bucket data");
    }
    
    @Test
    @DisplayName("Test Error Handling for Invalid Android Requests")
    void testErrorHandling() throws Exception {
        // Test with invalid data source
        String invalidJson = """
            {
                "dataStreamName": "",
                "type": "invalid_type"
            }
            """;
        
        HttpRequest request = createRequestBuilder("/users/" + TEST_USER_ID + "/dataSources")
            .POST(HttpRequest.BodyPublishers.ofString(invalidJson))
            .build();
        
        HttpResponse<String> response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        Assertions.assertEquals(400, response.statusCode(), 
            "Invalid data source should return 400");
    }
}
