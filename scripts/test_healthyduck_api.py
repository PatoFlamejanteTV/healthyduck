#!/usr/bin/env python3
"""
Comprehensive test suite for Healthyduck Fitness API
Run with: python test_healthyduck_api.py
"""

import unittest
import requests
import time
import json
import os
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
import statistics

class HealthyduckAPIClient:
    """Client for interacting with Healthyduck API"""
    
    def __init__(self, base_url, access_token):
        self.base_url = base_url.rstrip('/')
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    
    def create_data_source(self, user_id, data_source):
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataSources"
        response = requests.post(url, headers=self.headers, json=data_source)
        return response
    
    def get_data_sources(self, user_id):
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataSources"
        response = requests.get(url, headers=self.headers)
        return response
    
    def add_data_points(self, user_id, data_source_id, start_time_ns, end_time_ns, points):
        dataset_id = f"{start_time_ns}-{end_time_ns}"
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataSources/{data_source_id}/datasets/{dataset_id}"
        data = {"point": points}
        response = requests.patch(url, headers=self.headers, json=data)
        return response
    
    def create_session(self, user_id, session_data):
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/sessions"
        response = requests.post(url, headers=self.headers, json=session_data)
        return response
    
    def get_sessions(self, user_id, start_time=None, end_time=None):
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/sessions"
        params = {}
        if start_time:
            params['startTime'] = start_time
        if end_time:
            params['endTime'] = end_time
        response = requests.get(url, headers=self.headers, params=params)
        return response

class TestHealthyduckAPI(unittest.TestCase):
    """Test suite for Healthyduck API"""
    
    @classmethod
    def setUpClass(cls):
        # Load configuration from environment or config file
        cls.base_url = os.getenv('HEALTHYDUCK_BASE_URL', 'http://localhost:3000')
        cls.access_token = os.getenv('HEALTHYDUCK_ACCESS_TOKEN', 'test-token')
        cls.user_id = os.getenv('HEALTHYDUCK_USER_ID', 'me')
        
        cls.client = HealthyduckAPIClient(cls.base_url, cls.access_token)
        cls.test_data_source_id = None
        cls.test_session_id = None
        
        print(f"Testing API at: {cls.base_url}")
    
    def test_01_create_data_source(self):
        """Test creating a new data source"""
        data_source = {
            'dataStreamId': 'pytest:step-counter:1',
            'dataStreamName': 'PyTest Step Counter',
            'type': 'raw',
            'dataType': {
                'name': 'com.ultimatequack.step_count.delta'
            },
            'application': {
                'packageName': 'com.example.pytest',
                'version': '1.0'
            }
        }
        
        response = self.client.create_data_source(self.user_id, data_source)
        
        self.assertIn(response.status_code, [200, 201])
        result = response.json()
        self.assertIn('dataStreamId', result)
        self.assertEqual(result['dataStreamId'], 'pytest:step-counter:1')
        
        TestHealthyduckAPI.test_data_source_id = result['dataStreamId']
    
    def test_02_get_data_sources(self):
        """Test retrieving data sources"""
        response = self.client.get_data_sources(self.user_id)
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertIn('dataSource', result)
        self.assertIsInstance(result['dataSource'], list)
    
    def test_03_add_data_points(self):
        """Test adding data points"""
        if not self.test_data_source_id:
            self.skipTest("No test data source available")
        
        now_ns = int(time.time() * 1_000_000_000)
        hour_ago_ns = now_ns - (60 * 60 * 1_000_000_000)
        
        points = [{
            'startTimeNanos': str(hour_ago_ns),
            'endTimeNanos': str(now_ns),
            'dataTypeName': 'com.ultimatequack.step_count.delta',
            'value': [{'intVal': 2500}]
        }]
        
        response = self.client.add_data_points(
            self.user_id, 
            self.test_data_source_id,
            hour_ago_ns,
            now_ns,
            points
        )
        
        self.assertEqual(response.status_code, 200)
    
    def test_04_create_session(self):
        """Test creating a session"""
        start_time_ms = int((datetime.now() - timedelta(hours=1)).timestamp() * 1000)
        end_time_ms = int(datetime.now().timestamp() * 1000)
        
        session_data = {
            'id': f'pytest-session-{start_time_ms}',
            'name': 'PyTest Workout',
            'description': 'Test session from pytest',
            'startTimeMillis': str(start_time_ms),
            'endTimeMillis': str(end_time_ms),
            'activityType': 8,
            'activeTimeMillis': str(end_time_ms - start_time_ms)
        }
        
        response = self.client.create_session(self.user_id, session_data)
        
        self.assertIn(response.status_code, [200, 201])
        result = response.json()
        self.assertIn('id', result)
        
        TestHealthyduckAPI.test_session_id = result['id']
    
    def test_05_get_sessions(self):
        """Test retrieving sessions"""
        end_time = int(datetime.now().timestamp() * 1000)
        start_time = int((datetime.now() - timedelta(days=7)).timestamp() * 1000)
        
        response = self.client.get_sessions(self.user_id, start_time, end_time)
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertIn('session', result)
    
    def test_06_error_handling(self):
        """Test API error responses"""
        # Test invalid endpoint
        url = f"{self.client.base_url}/api/fitness/v1/users/{self.user_id}/invalid"
        response = requests.get(url, headers=self.client.headers)
        self.assertEqual(response.status_code, 404)
    
    def test_07_performance(self):
        """Basic performance test"""
        def make_request():
            return self.client.get_data_sources(self.user_id)
        
        # Time 10 sequential requests
        start_time = time.time()
        responses = []
        for _ in range(10):
            response = make_request()
            responses.append(response)
        end_time = time.time()
        
        # All requests should succeed
        for response in responses:
            self.assertEqual(response.status_code, 200)
        
        avg_time = (end_time - start_time) / 10
        print(f"\nAverage response time: {avg_time:.3f}s")
        
        # Response time should be reasonable (less than 2 seconds)
        self.assertLess(avg_time, 2.0)

def run_integration_tests():
    """Run integration tests with real API"""
    print("Running Healthyduck API Integration Tests")
    print("=" * 50)
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestHealthyduckAPI)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print(f"\nTest Summary:")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_integration_tests()
    exit(0 if success else 1)
