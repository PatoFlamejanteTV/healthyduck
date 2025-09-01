"""
HealthyDuck API Python Client
Advanced client library for data analysis and server-side integration
"""

import requests
import json
import time
from datetime import datetime, timezone
from typing import List, Dict, Optional, Union, Any
from dataclasses import dataclass, asdict
from urllib.parse import urljoin, urlencode
import pandas as pd
import numpy as np

@dataclass
class Application:
    packageName: str
    version: str
    name: str

@dataclass
class DataType:
    name: str
    field: List[Dict[str, Any]]

@dataclass
class DataSource:
    dataStreamId: str
    dataStreamName: str
    type: str
    application: Application
    dataType: List[DataType]

@dataclass
class Value:
    intVal: Optional[int] = None
    fpVal: Optional[float] = None
    stringVal: Optional[str] = None
    boolVal: Optional[bool] = None

@dataclass
class DataPoint:
    startTimeNanos: int
    endTimeNanos: int
    dataTypeName: str
    value: List[Value]
    originDataSourceId: Optional[str] = None

@dataclass
class Session:
    name: str
    startTimeMillis: int
    endTimeMillis: int
    activityType: int
    application: Application
    id: Optional[str] = None
    description: Optional[str] = None
    modifiedTimeMillis: Optional[str] = None

class HealthyDuckClient:
    """
    Advanced Python client for HealthyDuck API with data analysis capabilities
    """
    
    def __init__(self, base_url: str, access_token: str, timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.access_token = access_token
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'User-Agent': 'HealthyDuck-Python-Client/1.0'
        })
    
    # Data Sources
    def create_data_source(self, user_id: str, data_source: DataSource) -> DataSource:
        """Create a new data source"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataSources"
        response = self._make_request('POST', url, data=asdict(data_source))
        return DataSource(**response)
    
    def get_data_sources(self, user_id: str) -> List[DataSource]:
        """Get all data sources for a user"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataSources"
        response = self._make_request('GET', url)
        return [DataSource(**ds) for ds in response['dataSources']]
    
    def get_data_source(self, user_id: str, data_source_id: str) -> DataSource:
        """Get a specific data source"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataSources/{data_source_id}"
        response = self._make_request('GET', url)
        return DataSource(**response)
    
    # Data Points
    def insert_data_points(self, user_id: str, data_source_id: str, 
                          dataset_id: str, data_points: List[DataPoint]) -> None:
        """Insert data points into a dataset"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataSources/{data_source_id}/datasets/{dataset_id}"
        payload = {'dataPoints': [asdict(dp) for dp in data_points]}
        self._make_request('PATCH', url, data=payload)
    
    def get_data_points(self, user_id: str, data_source_id: str, 
                       dataset_id: str) -> List[DataPoint]:
        """Get data points from a dataset"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataSources/{data_source_id}/datasets/{dataset_id}"
        response = self._make_request('GET', url)
        return [DataPoint(**dp) for dp in response['dataPoints']]
    
    # Sessions
    def create_session(self, user_id: str, session: Session) -> Session:
        """Create a new activity session"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/sessions"
        response = self._make_request('POST', url, data=asdict(session))
        return Session(**response)
    
    def get_sessions(self, user_id: str, start_time: Optional[datetime] = None, 
                    end_time: Optional[datetime] = None) -> List[Session]:
        """Get sessions for a user with optional time filtering"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/sessions"
        
        params = {}
        if start_time:
            params['startTime'] = int(start_time.timestamp() * 1_000_000_000)
        if end_time:
            params['endTime'] = int(end_time.timestamp() * 1_000_000_000)
        
        if params:
            url += '?' + urlencode(params)
        
        response = self._make_request('GET', url)
        return [Session(**s) for s in response['sessions']]
    
    # Aggregation
    def get_aggregated_data(self, user_id: str, start_time: datetime, end_time: datetime,
                           data_types: List[str], bucket_type: str = 'day') -> Dict[str, Any]:
        """Get aggregated fitness data"""
        url = f"{self.base_url}/api/fitness/v1/users/{user_id}/dataset/aggregate"
        payload = {
            'startTimeNanos': int(start_time.timestamp() * 1_000_000_000),
            'endTimeNanos': int(end_time.timestamp() * 1_000_000_000),
            'dataTypes': data_types,
            'bucketType': bucket_type
        }
        return self._make_request('POST', url, data=payload)
    
    # Data Analysis Methods
    def get_steps_dataframe(self, user_id: str, start_date: datetime, 
                           end_date: datetime) -> pd.DataFrame:
        """Get steps data as a pandas DataFrame for analysis"""
        aggregated = self.get_aggregated_data(
            user_id, start_date, end_date, 
            ['com.ultimatequack.step_count.delta'], 'day'
        )
        
        data = []
        for bucket in aggregated.get('bucket', []):
            date = datetime.fromtimestamp(bucket['startTimeNanos'] / 1_000_000_000)
            steps = 0
            
            for dataset_key, dataset in bucket.get('dataset', {}).items():
                for point in dataset.get('point', []):
                    if point['value']:
                        steps += point['value'][0].get('intVal', 0)
            
            data.append({'date': date, 'steps': steps})
        
        return pd.DataFrame(data)
    
    def get_activity_summary(self, user_id: str, start_date: datetime, 
                           end_date: datetime) -> Dict[str, Any]:
        """Get comprehensive activity summary with statistics"""
        steps_df = self.get_steps_dataframe(user_id, start_date, end_date)
        sessions = self.get_sessions(user_id, start_date, end_date)
        
        return {
            'total_steps': steps_df['steps'].sum(),
            'avg_daily_steps': steps_df['steps'].mean(),
            'max_daily_steps': steps_df['steps'].max(),
            'active_days': len(steps_df[steps_df['steps'] > 0]),
            'total_sessions': len(sessions),
            'total_workout_time_minutes': sum(
                (s.endTimeMillis - s.startTimeMillis) / (1000 * 60) 
                for s in sessions
            ),
            'activity_types': list(set(s.activityType for s in sessions))
        }
    
    def export_data_to_csv(self, user_id: str, start_date: datetime, 
                          end_date: datetime, filename: str) -> None:
        """Export user's fitness data to CSV for analysis"""
        steps_df = self.get_steps_dataframe(user_id, start_date, end_date)
        sessions = self.get_sessions(user_id, start_date, end_date)
        
        # Create sessions DataFrame
        sessions_data = []
        for session in sessions:
            sessions_data.append({
                'session_id': session.id,
                'name': session.name,
                'start_time': datetime.fromtimestamp(session.startTimeMillis / 1000),
                'end_time': datetime.fromtimestamp(session.endTimeMillis / 1000),
                'duration_minutes': (session.endTimeMillis - session.startTimeMillis) / (1000 * 60),
                'activity_type': session.activityType
            })
        
        sessions_df = pd.DataFrame(sessions_data)
        
        # Export to Excel with multiple sheets
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            steps_df.to_excel(writer, sheet_name='Daily Steps', index=False)
            sessions_df.to_excel(writer, sheet_name='Sessions', index=False)
    
    # Utility Methods
    @staticmethod
    def create_steps_data_point(steps: int, start_time: datetime, end_time: datetime) -> DataPoint:
        """Create a steps data point"""
        return DataPoint(
            startTimeNanos=int(start_time.timestamp() * 1_000_000_000),
            endTimeNanos=int(end_time.timestamp() * 1_000_000_000),
            dataTypeName='com.ultimatequack.step_count.delta',
            value=[Value(intVal=steps)]
        )
    
    @staticmethod
    def create_calories_data_point(calories: float, start_time: datetime, end_time: datetime) -> DataPoint:
        """Create a calories data point"""
        return DataPoint(
            startTimeNanos=int(start_time.timestamp() * 1_000_000_000),
            endTimeNanos=int(end_time.timestamp() * 1_000_000_000),
            dataTypeName='com.ultimatequack.calories.expended',
            value=[Value(fpVal=calories)]
        )
    
    @staticmethod
    def create_default_application() -> Application:
        """Create default application info"""
        return Application(
            packageName='com.ultimatequack.healthyduck.python',
            version='1.0',
            name='HealthyDuck Python Client'
        )
    
    # Batch Operations
    def bulk_insert_steps(self, user_id: str, steps_data: List[Dict[str, Any]]) -> None:
        """Bulk insert steps data efficiently"""
        # Create or get steps data source
        steps_data_source = DataSource(
            dataStreamId=f"steps_source_{int(time.time())}",
            dataStreamName="Bulk Steps Data Source",
            type="derived",
            application=self.create_default_application(),
            dataType=[DataType(name="com.ultimatequack.step_count.delta", field=[])]
        )
        
        self.create_data_source(user_id, steps_data_source)
        
        # Group data points by day for efficient insertion
        daily_groups = {}
        for entry in steps_data:
            date = entry['date'].date()
            if date not in daily_groups:
                daily_groups[date] = []
            
            data_point = self.create_steps_data_point(
                entry['steps'], entry['date'], entry['date']
            )
            daily_groups[date].append(data_point)
        
        # Insert each day's data
        for date, points in daily_groups.items():
            dataset_id = f"{date.strftime('%Y%m%d')}"
            self.insert_data_points(user_id, steps_data_source.dataStreamId, dataset_id, points)
    
    def _make_request(self, method: str, url: str, data: Optional[Dict] = None) -> Any:
        """Make HTTP request with error handling"""
        try:
            if data:
                response = self.session.request(method, url, json=data, timeout=self.timeout)
            else:
                response = self.session.request(method, url, timeout=self.timeout)
            
            response.raise_for_status()
            
            if response.content:
                return response.json()
            return {}
            
        except requests.exceptions.RequestException as e:
            raise HealthyDuckException(f"API request failed: {str(e)}") from e
        except json.JSONDecodeError as e:
            raise HealthyDuckException(f"Invalid JSON response: {str(e)}") from e

class HealthyDuckException(Exception):
    """Custom exception for HealthyDuck API errors"""
    pass

# Data Analysis Utilities
class FitnessAnalyzer:
    """Advanced fitness data analysis utilities"""
    
    @staticmethod
    def calculate_weekly_trends(steps_df: pd.DataFrame) -> pd.DataFrame:
        """Calculate weekly step trends"""
        steps_df['week'] = steps_df['date'].dt.isocalendar().week
        steps_df['year'] = steps_df['date'].dt.year
        
        weekly_stats = steps_df.groupby(['year', 'week']).agg({
            'steps': ['sum', 'mean', 'std', 'count']
        }).round(2)
        
        return weekly_stats
    
    @staticmethod
    def detect_activity_patterns(sessions_df: pd.DataFrame) -> Dict[str, Any]:
        """Detect patterns in workout sessions"""
        if sessions_df.empty:
            return {}
        
        sessions_df['hour'] = pd.to_datetime(sessions_df['start_time']).dt.hour
        sessions_df['day_of_week'] = pd.to_datetime(sessions_df['start_time']).dt.day_name()
        
        return {
            'preferred_workout_hours': sessions_df['hour'].value_counts().head(3).to_dict(),
            'preferred_workout_days': sessions_df['day_of_week'].value_counts().to_dict(),
            'avg_session_duration': sessions_df['duration_minutes'].mean(),
            'most_common_activities': sessions_df['activity_type'].value_counts().head(5).to_dict()
        }
