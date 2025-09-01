using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Web.Script.Serialization;

namespace HealthyDuck.Client
{
    /// <summary>
    /// HealthyDuck API Client for .NET Framework 4.0
    /// Provides easy access to fitness data management endpoints
    /// </summary>
    public class HealthyDuckClient
    {
        private readonly string _baseUrl;
        private readonly string _accessToken;
        private readonly JavaScriptSerializer _serializer;

        public HealthyDuckClient(string baseUrl, string accessToken)
        {
            _baseUrl = baseUrl.TrimEnd('/');
            _accessToken = accessToken;
            _serializer = new JavaScriptSerializer();
        }

        #region Data Sources

        /// <summary>
        /// Creates a new data source for fitness data
        /// </summary>
        public DataSource CreateDataSource(string userId, DataSource dataSource)
        {
            var url = $"{_baseUrl}/api/fitness/v1/users/{userId}/dataSources";
            var json = _serializer.Serialize(dataSource);
            var response = MakeRequest(url, "POST", json);
            return _serializer.Deserialize<DataSource>(response);
        }

        /// <summary>
        /// Gets all data sources for a user
        /// </summary>
        public List<DataSource> GetDataSources(string userId)
        {
            var url = $"{_baseUrl}/api/fitness/v1/users/{userId}/dataSources";
            var response = MakeRequest(url, "GET");
            var result = _serializer.Deserialize<Dictionary<string, object>>(response);
            return _serializer.ConvertToType<List<DataSource>>(result["dataSources"]);
        }

        /// <summary>
        /// Gets a specific data source by ID
        /// </summary>
        public DataSource GetDataSource(string userId, string dataSourceId)
        {
            var url = $"{_baseUrl}/api/fitness/v1/users/{userId}/dataSources/{dataSourceId}";
            var response = MakeRequest(url, "GET");
            return _serializer.Deserialize<DataSource>(response);
        }

        #endregion

        #region Data Points

        /// <summary>
        /// Inserts data points into a dataset
        /// </summary>
        public void InsertDataPoints(string userId, string dataSourceId, string datasetId, List<DataPoint> dataPoints)
        {
            var url = $"{_baseUrl}/api/fitness/v1/users/{userId}/dataSources/{dataSourceId}/datasets/{datasetId}";
            var payload = new { dataPoints = dataPoints };
            var json = _serializer.Serialize(payload);
            MakeRequest(url, "PATCH", json);
        }

        /// <summary>
        /// Gets data points from a dataset
        /// </summary>
        public List<DataPoint> GetDataPoints(string userId, string dataSourceId, string datasetId)
        {
            var url = $"{_baseUrl}/api/fitness/v1/users/{userId}/dataSources/{dataSourceId}/datasets/{datasetId}";
            var response = MakeRequest(url, "GET");
            var result = _serializer.Deserialize<Dictionary<string, object>>(response);
            return _serializer.ConvertToType<List<DataPoint>>(result["dataPoints"]);
        }

        #endregion

        #region Sessions

        /// <summary>
        /// Creates a new activity session
        /// </summary>
        public Session CreateSession(string userId, Session session)
        {
            var url = $"{_baseUrl}/api/fitness/v1/users/{userId}/sessions";
            var json = _serializer.Serialize(session);
            var response = MakeRequest(url, "POST", json);
            return _serializer.Deserialize<Session>(response);
        }

        /// <summary>
        /// Gets all sessions for a user
        /// </summary>
        public List<Session> GetSessions(string userId, DateTime? startTime = null, DateTime? endTime = null)
        {
            var url = $"{_baseUrl}/api/fitness/v1/users/{userId}/sessions";
            if (startTime.HasValue || endTime.HasValue)
            {
                var queryParams = new List<string>();
                if (startTime.HasValue)
                    queryParams.Add($"startTime={ToUnixNanoseconds(startTime.Value)}");
                if (endTime.HasValue)
                    queryParams.Add($"endTime={ToUnixNanoseconds(endTime.Value)}");
                url += "?" + string.Join("&", queryParams.ToArray());
            }
            
            var response = MakeRequest(url, "GET");
            var result = _serializer.Deserialize<Dictionary<string, object>>(response);
            return _serializer.ConvertToType<List<Session>>(result["sessions"]);
        }

        #endregion

        #region Aggregation

        /// <summary>
        /// Gets aggregated fitness data
        /// </summary>
        public AggregationResult GetAggregatedData(string userId, DateTime startTime, DateTime endTime, 
            List<string> dataTypes, string bucketType = "day")
        {
            var url = $"{_baseUrl}/api/fitness/v1/users/{userId}/dataset/aggregate";
            var payload = new
            {
                startTimeNanos = ToUnixNanoseconds(startTime),
                endTimeNanos = ToUnixNanoseconds(endTime),
                dataTypes = dataTypes,
                bucketType = bucketType
            };
            var json = _serializer.Serialize(payload);
            var response = MakeRequest(url, "POST", json);
            return _serializer.Deserialize<AggregationResult>(response);
        }

        #endregion

        #region Helper Methods

        private string MakeRequest(string url, string method, string body = null)
        {
            var request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = method;
            request.Headers.Add("Authorization", "Bearer " + _accessToken);
            request.ContentType = "application/json";
            request.UserAgent = "HealthyDuck-CSharp-Client/1.0";

            if (!string.IsNullOrEmpty(body))
            {
                var data = Encoding.UTF8.GetBytes(body);
                request.ContentLength = data.Length;
                using (var stream = request.GetRequestStream())
                {
                    stream.Write(data, 0, data.Length);
                }
            }

            try
            {
                using (var response = (HttpWebResponse)request.GetResponse())
                using (var reader = new StreamReader(response.GetResponseStream()))
                {
                    return reader.ReadToEnd();
                }
            }
            catch (WebException ex)
            {
                if (ex.Response != null)
                {
                    using (var reader = new StreamReader(ex.Response.GetResponseStream()))
                    {
                        var errorResponse = reader.ReadToEnd();
                        throw new HealthyDuckException($"API Error: {errorResponse}", ex);
                    }
                }
                throw new HealthyDuckException("Network error occurred", ex);
            }
        }

        private long ToUnixNanoseconds(DateTime dateTime)
        {
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var timeSpan = dateTime.ToUniversalTime() - epoch;
            return (long)(timeSpan.TotalMilliseconds * 1000000);
        }

        #endregion
    }

    #region Data Models

    public class DataSource
    {
        public string dataStreamId { get; set; }
        public string dataStreamName { get; set; }
        public string type { get; set; }
        public Application application { get; set; }
        public List<DataType> dataType { get; set; }
    }

    public class Application
    {
        public string packageName { get; set; }
        public string version { get; set; }
        public string name { get; set; }
    }

    public class DataType
    {
        public string name { get; set; }
        public List<Field> field { get; set; }
    }

    public class Field
    {
        public string name { get; set; }
        public string format { get; set; }
        public bool optional { get; set; }
    }

    public class DataPoint
    {
        public long startTimeNanos { get; set; }
        public long endTimeNanos { get; set; }
        public string dataTypeName { get; set; }
        public List<Value> value { get; set; }
        public string originDataSourceId { get; set; }
    }

    public class Value
    {
        public int? intVal { get; set; }
        public double? fpVal { get; set; }
        public string stringVal { get; set; }
        public bool? boolVal { get; set; }
    }

    public class Session
    {
        public string id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public long startTimeMillis { get; set; }
        public long endTimeMillis { get; set; }
        public string modifiedTimeMillis { get; set; }
        public int activityType { get; set; }
        public Application application { get; set; }
    }

    public class AggregationResult
    {
        public List<Bucket> bucket { get; set; }
    }

    public class Bucket
    {
        public long startTimeNanos { get; set; }
        public long endTimeNanos { get; set; }
        public Dictionary<string, DataSet> dataset { get; set; }
    }

    public class DataSet
    {
        public string dataSourceId { get; set; }
        public List<DataPoint> point { get; set; }
    }

    #endregion

    #region Exceptions

    public class HealthyDuckException : Exception
    {
        public HealthyDuckException(string message) : base(message) { }
        public HealthyDuckException(string message, Exception innerException) : base(message, innerException) { }
    }

    #endregion
}
