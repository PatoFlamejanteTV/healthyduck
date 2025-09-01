package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"testing"
	"time"
)

const (
	APIBase    = "http://localhost:3000/api/fitness/v1"
	TestUserID = "test-user-123"
	AuthToken  = "mock-jwt-token"
)

type DataSource struct {
	DataStreamName string `json:"dataStreamName"`
	Type           string `json:"type"`
	Application    struct {
		PackageName string `json:"packageName"`
		Version     string `json:"version"`
	} `json:"application"`
	DataType struct {
		Name  string `json:"name"`
		Field []struct {
			Name   string `json:"name"`
			Format string `json:"format"`
		} `json:"field"`
	} `json:"dataType"`
}

type Session struct {
	Name             string `json:"name"`
	Description      string `json:"description"`
	StartTimeMillis  int64  `json:"startTimeMillis"`
	EndTimeMillis    int64  `json:"endTimeMillis"`
	ActivityType     int    `json:"activityType"`
	Application      struct {
		PackageName string `json:"packageName"`
	} `json:"application"`
}

func makeRequest(method, url string, body interface{}) (*http.Response, error) {
	var reqBody io.Reader
	if body != nil {
		jsonBody, _ := json.Marshal(body)
		reqBody = bytes.NewBuffer(jsonBody)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+AuthToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	return client.Do(req)
}

func TestHealthyDuckAPI(t *testing.T) {
	t.Run("DataSourceCreation", func(t *testing.T) {
		dataSource := DataSource{
			DataStreamName: "com.ultimatequack.heart_rate",
			Type:          "raw",
		}
		dataSource.Application.PackageName = "com.ultimatequack.healthyduck"
		dataSource.Application.Version = "1.0.0"
		dataSource.DataType.Name = "com.ultimatequack.heart_rate"
		dataSource.DataType.Field = []struct {
			Name   string `json:"name"`
			Format string `json:"format"`
		}{
			{Name: "bpm", Format: "floatPoint"},
		}

		url := fmt.Sprintf("%s/users/%s/dataSources", APIBase, TestUserID)
		resp, err := makeRequest("POST", url, dataSource)
		if err != nil {
			t.Fatalf("Failed to create data source: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != 201 {
			t.Errorf("Expected status 201, got %d", resp.StatusCode)
		}
	})

	t.Run("SessionManagement", func(t *testing.T) {
		session := Session{
			Name:            "HIIT Workout",
			Description:     "High-intensity interval training",
			StartTimeMillis: time.Now().Add(-time.Hour).UnixMilli(),
			EndTimeMillis:   time.Now().UnixMilli(),
			ActivityType:    79, // HIIT
		}
		session.Application.PackageName = "com.ultimatequack.healthyduck"

		url := fmt.Sprintf("%s/users/%s/sessions", APIBase, TestUserID)
		resp, err := makeRequest("POST", url, session)
		if err != nil {
			t.Fatalf("Failed to create session: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != 201 {
			t.Errorf("Expected status 201, got %d", resp.StatusCode)
		}
	})
}

func BenchmarkAPIPerformance(b *testing.B) {
	b.Run("DataSourceRetrieval", func(b *testing.B) {
		url := fmt.Sprintf("%s/users/%s/dataSources", APIBase, TestUserID)
		b.ResetTimer()
		
		for i := 0; i < b.N; i++ {
			resp, err := makeRequest("GET", url, nil)
			if err != nil {
				b.Fatalf("Request failed: %v", err)
			}
			resp.Body.Close()
		}
	})

	b.Run("ConcurrentRequests", func(b *testing.B) {
		url := fmt.Sprintf("%s/users/%s/dataSources", APIBase, TestUserID)
		b.ResetTimer()

		b.RunParallel(func(pb *testing.PB) {
			for pb.Next() {
				resp, err := makeRequest("GET", url, nil)
				if err != nil {
					b.Errorf("Request failed: %v", err)
					continue
				}
				resp.Body.Close()
			}
		})
	})
}

func TestConcurrentDataInsertion(t *testing.T) {
	const numGoroutines = 10
	const requestsPerGoroutine = 5

	var wg sync.WaitGroup
	errors := make(chan error, numGoroutines*requestsPerGoroutine)

	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func(goroutineID int) {
			defer wg.Done()
			
			for j := 0; j < requestsPerGoroutine; j++ {
				dataSource := DataSource{
					DataStreamName: fmt.Sprintf("com.ultimatequack.test_%d_%d", goroutineID, j),
					Type:          "raw",
				}
				dataSource.Application.PackageName = "com.ultimatequack.healthyduck"
				dataSource.Application.Version = "1.0.0"

				url := fmt.Sprintf("%s/users/%s/dataSources", APIBase, TestUserID)
				resp, err := makeRequest("POST", url, dataSource)
				if err != nil {
					errors <- fmt.Errorf("goroutine %d, request %d failed: %v", goroutineID, j, err)
					continue
				}
				resp.Body.Close()

				if resp.StatusCode != 201 {
					errors <- fmt.Errorf("goroutine %d, request %d: expected status 201, got %d", goroutineID, j, resp.StatusCode)
				}
			}
		}(i)
	}

	wg.Wait()
	close(errors)

	errorCount := 0
	for err := range errors {
		t.Error(err)
		errorCount++
	}

	if errorCount > 0 {
		t.Errorf("Concurrent test failed with %d errors", errorCount)
	}
}
