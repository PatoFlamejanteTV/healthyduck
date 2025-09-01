package com.ultimatequack.healthyduck.client;

import android.content.Context;
import android.os.AsyncTask;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * HealthyDuck API Client for Android Applications
 * Optimized for mobile fitness app integration
 */
public class HealthyDuckClient {
    private final String baseUrl;
    private final String accessToken;
    private final Context context;
    private static final int TIMEOUT_MS = 10000;

    public HealthyDuckClient(Context context, String baseUrl, String accessToken) {
        this.context = context;
        this.baseUrl = baseUrl.replaceAll("/$", "");
        this.accessToken = accessToken;
    }

    // Data Sources
    public CompletableFuture<DataSource> createDataSource(String userId, DataSource dataSource) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String endpoint = String.format("/api/fitness/v1/users/%s/dataSources", userId);
                JSONObject json = dataSource.toJson();
                String response = makeRequest(endpoint, "POST", json.toString());
                return DataSource.fromJson(new JSONObject(response));
            } catch (Exception e) {
                throw new HealthyDuckException("Failed to create data source", e);
            }
        });
    }

    public CompletableFuture<List<DataSource>> getDataSources(String userId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String endpoint = String.format("/api/fitness/v1/users/%s/dataSources", userId);
                String response = makeRequest(endpoint, "GET", null);
                JSONObject json = new JSONObject(response);
                JSONArray dataSourcesArray = json.getJSONArray("dataSources");
                
                List<DataSource> dataSources = new ArrayList<>();
                for (int i = 0; i < dataSourcesArray.length(); i++) {
                    dataSources.add(DataSource.fromJson(dataSourcesArray.getJSONObject(i)));
                }
                return dataSources;
            } catch (Exception e) {
                throw new HealthyDuckException("Failed to get data sources", e);
            }
        });
    }

    // Data Points
    public CompletableFuture<Void> insertDataPoints(String userId, String dataSourceId, 
                                                   String datasetId, List<DataPoint> dataPoints) {
        return CompletableFuture.runAsync(() -> {
            try {
                String endpoint = String.format("/api/fitness/v1/users/%s/dataSources/%s/datasets/%s", 
                                               userId, dataSourceId, datasetId);
                
                JSONObject payload = new JSONObject();
                JSONArray pointsArray = new JSONArray();
                for (DataPoint point : dataPoints) {
                    pointsArray.put(point.toJson());
                }
                payload.put("dataPoints", pointsArray);
                
                makeRequest(endpoint, "PATCH", payload.toString());
            } catch (Exception e) {
                throw new HealthyDuckException("Failed to insert data points", e);
            }
        });
    }

    public CompletableFuture<List<DataPoint>> getDataPoints(String userId, String dataSourceId, String datasetId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String endpoint = String.format("/api/fitness/v1/users/%s/dataSources/%s/datasets/%s", 
                                               userId, dataSourceId, datasetId);
                String response = makeRequest(endpoint, "GET", null);
                JSONObject json = new JSONObject(response);
                JSONArray pointsArray = json.getJSONArray("dataPoints");
                
                List<DataPoint> dataPoints = new ArrayList<>();
                for (int i = 0; i < pointsArray.length(); i++) {
                    dataPoints.add(DataPoint.fromJson(pointsArray.getJSONObject(i)));
                }
                return dataPoints;
            } catch (Exception e) {
                throw new HealthyDuckException("Failed to get data points", e);
            }
        });
    }

    // Sessions
    public CompletableFuture<Session> createSession(String userId, Session session) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String endpoint = String.format("/api/fitness/v1/users/%s/sessions", userId);
                JSONObject json = session.toJson();
                String response = makeRequest(endpoint, "POST", json.toString());
                return Session.fromJson(new JSONObject(response));
            } catch (Exception e) {
                throw new HealthyDuckException("Failed to create session", e);
            }
        });
    }

    public CompletableFuture<List<Session>> getSessions(String userId, Date startTime, Date endTime) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String endpoint = String.format("/api/fitness/v1/users/%s/sessions", userId);
                
                if (startTime != null || endTime != null) {
                    List<String> params = new ArrayList<>();
                    if (startTime != null) {
                        params.add("startTime=" + (startTime.getTime() * 1000000));
                    }
                    if (endTime != null) {
                        params.add("endTime=" + (endTime.getTime() * 1000000));
                    }
                    endpoint += "?" + String.join("&", params);
                }
                
                String response = makeRequest(endpoint, "GET", null);
                JSONObject json = new JSONObject(response);
                JSONArray sessionsArray = json.getJSONArray("sessions");
                
                List<Session> sessions = new ArrayList<>();
                for (int i = 0; i < sessionsArray.length(); i++) {
                    sessions.add(Session.fromJson(sessionsArray.getJSONObject(i)));
                }
                return sessions;
            } catch (Exception e) {
                throw new HealthyDuckException("Failed to get sessions", e);
            }
        });
    }

    // Utility methods for common Android fitness scenarios
    public CompletableFuture<Void> recordSteps(String userId, int steps, Date startTime, Date endTime) {
        return CompletableFuture.runAsync(() -> {
            try {
                // Create or get steps data source
                DataSource stepsDataSource = createStepsDataSource();
                createDataSource(userId, stepsDataSource).get();
                
                // Create data point
                DataPoint stepsPoint = DataPoint.createStepsDataPoint(steps, startTime, endTime);
                List<DataPoint> points = Arrays.asList(stepsPoint);
                
                // Insert data
                String datasetId = String.format("%d-%d", startTime.getTime() * 1000000, endTime.getTime() * 1000000);
                insertDataPoints(userId, stepsDataSource.getDataStreamId(), datasetId, points).get();
            } catch (Exception e) {
                throw new HealthyDuckException("Failed to record steps", e);
            }
        });
    }

    public CompletableFuture<Void> recordWorkout(String userId, String workoutName, int activityType, 
                                                Date startTime, Date endTime, double calories) {
        return CompletableFuture.runAsync(() -> {
            try {
                // Create session
                Session session = new Session();
                session.setName(workoutName);
                session.setStartTimeMillis(startTime.getTime());
                session.setEndTimeMillis(endTime.getTime());
                session.setActivityType(activityType);
                session.setApplication(createDefaultApplication());
                
                createSession(userId, session).get();
                
                // Record calories if provided
                if (calories > 0) {
                    DataSource caloriesDataSource = createCaloriesDataSource();
                    createDataSource(userId, caloriesDataSource).get();
                    
                    DataPoint caloriesPoint = DataPoint.createCaloriesDataPoint(calories, startTime, endTime);
                    List<DataPoint> points = Arrays.asList(caloriesPoint);
                    
                    String datasetId = String.format("%d-%d", startTime.getTime() * 1000000, endTime.getTime() * 1000000);
                    insertDataPoints(userId, caloriesDataSource.getDataStreamId(), datasetId, points).get();
                }
            } catch (Exception e) {
                throw new HealthyDuckException("Failed to record workout", e);
            }
        });
    }

    // Helper methods
    private String makeRequest(String endpoint, String method, String body) throws IOException {
        URL url = new URL(baseUrl + endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        connection.setRequestMethod(method);
        connection.setRequestProperty("Authorization", "Bearer " + accessToken);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("User-Agent", "HealthyDuck-Android-Client/1.0");
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        
        if (body != null && !body.isEmpty()) {
            connection.setDoOutput(true);
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = body.getBytes("utf-8");
                os.write(input, 0, input.length);
            }
        }
        
        int responseCode = connection.getResponseCode();
        InputStream inputStream = responseCode >= 200 && responseCode < 300 
            ? connection.getInputStream() 
            : connection.getErrorStream();
            
        StringBuilder response = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, "utf-8"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
        }
        
        if (responseCode >= 400) {
            throw new HealthyDuckException("HTTP " + responseCode + ": " + response.toString());
        }
        
        return response.toString();
    }

    private DataSource createStepsDataSource() {
        DataSource dataSource = new DataSource();
        dataSource.setDataStreamName("Steps Data Source");
        dataSource.setType("derived");
        dataSource.setApplication(createDefaultApplication());
        
        DataType dataType = new DataType();
        dataType.setName("com.ultimatequack.step_count.delta");
        dataSource.setDataType(Arrays.asList(dataType));
        
        return dataSource;
    }

    private DataSource createCaloriesDataSource() {
        DataSource dataSource = new DataSource();
        dataSource.setDataStreamName("Calories Data Source");
        dataSource.setType("derived");
        dataSource.setApplication(createDefaultApplication());
        
        DataType dataType = new DataType();
        dataType.setName("com.ultimatequack.calories.expended");
        dataSource.setDataType(Arrays.asList(dataType));
        
        return dataSource;
    }

    private Application createDefaultApplication() {
        Application app = new Application();
        app.setPackageName(context.getPackageName());
        app.setVersion("1.0");
        app.setName("HealthyDuck Android Client");
        return app;
    }

    // Data model classes would be defined here...
    // (DataSource, DataPoint, Session, etc. with toJson/fromJson methods)
}

class HealthyDuckException extends RuntimeException {
    public HealthyDuckException(String message) {
        super(message);
    }
    
    public HealthyDuckException(String message, Throwable cause) {
        super(message, cause);
    }
}
