import Foundation
import Combine

/**
 * HealthyDuck API Client for iOS Applications
 * Modern Swift client with Combine support for reactive programming
 */
@available(iOS 13.0, *)
public class HealthyDuckClient: ObservableObject {
    private let baseURL: URL
    private let accessToken: String
    private let session: URLSession
    
    public init(baseURL: String, accessToken: String) {
        guard let url = URL(string: baseURL.trimmingCharacters(in: CharacterSet(charactersIn: "/"))) else {
            fatalError("Invalid base URL")
        }
        self.baseURL = url
        self.accessToken = accessToken
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 10.0
        config.timeoutIntervalForResource = 30.0
        self.session = URLSession(configuration: config)
    }
    
    // MARK: - Data Sources
    
    public func createDataSource(userId: String, dataSource: DataSource) -> AnyPublisher<DataSource, HealthyDuckError> {
        let endpoint = "/api/fitness/v1/users/\(userId)/dataSources"
        return makeRequest(endpoint: endpoint, method: .POST, body: dataSource)
    }
    
    public func getDataSources(userId: String) -> AnyPublisher<[DataSource], HealthyDuckError> {
        let endpoint = "/api/fitness/v1/users/\(userId)/dataSources"
        return makeRequest(endpoint: endpoint, method: .GET)
            .map { (response: DataSourcesResponse) in response.dataSources }
            .eraseToAnyPublisher()
    }
    
    public func getDataSource(userId: String, dataSourceId: String) -> AnyPublisher<DataSource, HealthyDuckError> {
        let endpoint = "/api/fitness/v1/users/\(userId)/dataSources/\(dataSourceId)"
        return makeRequest(endpoint: endpoint, method: .GET)
    }
    
    // MARK: - Data Points
    
    public func insertDataPoints(userId: String, dataSourceId: String, datasetId: String, 
                               dataPoints: [DataPoint]) -> AnyPublisher<Void, HealthyDuckError> {
        let endpoint = "/api/fitness/v1/users/\(userId)/dataSources/\(dataSourceId)/datasets/\(datasetId)"
        let body = DataPointsRequest(dataPoints: dataPoints)
        return makeRequest(endpoint: endpoint, method: .PATCH, body: body)
            .map { (_: EmptyResponse) in () }
            .eraseToAnyPublisher()
    }
    
    public func getDataPoints(userId: String, dataSourceId: String, 
                            datasetId: String) -> AnyPublisher<[DataPoint], HealthyDuckError> {
        let endpoint = "/api/fitness/v1/users/\(userId)/dataSources/\(dataSourceId)/datasets/\(datasetId)"
        return makeRequest(endpoint: endpoint, method: .GET)
            .map { (response: DataPointsResponse) in response.dataPoints }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Sessions
    
    public func createSession(userId: String, session: Session) -> AnyPublisher<Session, HealthyDuckError> {
        let endpoint = "/api/fitness/v1/users/\(userId)/sessions"
        return makeRequest(endpoint: endpoint, method: .POST, body: session)
    }
    
    public func getSessions(userId: String, startTime: Date? = nil, 
                          endTime: Date? = nil) -> AnyPublisher<[Session], HealthyDuckError> {
        var endpoint = "/api/fitness/v1/users/\(userId)/sessions"
        
        var queryItems: [URLQueryItem] = []
        if let startTime = startTime {
            queryItems.append(URLQueryItem(name: "startTime", value: String(Int64(startTime.timeIntervalSince1970 * 1_000_000_000))))
        }
        if let endTime = endTime {
            queryItems.append(URLQueryItem(name: "endTime", value: String(Int64(endTime.timeIntervalSince1970 * 1_000_000_000))))
        }
        
        if !queryItems.isEmpty {
            var components = URLComponents()
            components.queryItems = queryItems
            endpoint += components.url?.query.map { "?\($0)" } ?? ""
        }
        
        return makeRequest(endpoint: endpoint, method: .GET)
            .map { (response: SessionsResponse) in response.sessions }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Aggregation
    
    public func getAggregatedData(userId: String, request: AggregationRequest) -> AnyPublisher<AggregationResult, HealthyDuckError> {
        let endpoint = "/api/fitness/v1/users/\(userId)/dataset/aggregate"
        return makeRequest(endpoint: endpoint, method: .POST, body: request)
    }
    
    // MARK: - Convenience Methods for iOS Health Integration
    
    public func recordSteps(userId: String, steps: Int, startTime: Date, endTime: Date) -> AnyPublisher<Void, HealthyDuckError> {
        let dataSource = DataSource.stepsDataSource()
        let dataPoint = DataPoint.stepsDataPoint(steps: steps, startTime: startTime, endTime: endTime)
        let datasetId = "\(Int64(startTime.timeIntervalSince1970 * 1_000_000_000))-\(Int64(endTime.timeIntervalSince1970 * 1_000_000_000))"
        
        return createDataSource(userId: userId, dataSource: dataSource)
            .flatMap { _ in
                self.insertDataPoints(userId: userId, dataSourceId: dataSource.dataStreamId, 
                                    datasetId: datasetId, dataPoints: [dataPoint])
            }
            .eraseToAnyPublisher()
    }
    
    public func recordWorkout(userId: String, name: String, activityType: Int, 
                            startTime: Date, endTime: Date, calories: Double? = nil) -> AnyPublisher<Void, HealthyDuckError> {
        let session = Session(
            name: name,
            startTimeMillis: Int64(startTime.timeIntervalSince1970 * 1000),
            endTimeMillis: Int64(endTime.timeIntervalSince1970 * 1000),
            activityType: activityType,
            application: Application.defaultApplication()
        )
        
        var publisher = createSession(userId: userId, session: session)
            .map { _ in () }
            .eraseToAnyPublisher()
        
        if let calories = calories {
            let caloriesDataSource = DataSource.caloriesDataSource()
            let caloriesDataPoint = DataPoint.caloriesDataPoint(calories: calories, startTime: startTime, endTime: endTime)
            let datasetId = "\(Int64(startTime.timeIntervalSince1970 * 1_000_000_000))-\(Int64(endTime.timeIntervalSince1970 * 1_000_000_000))"
            
            publisher = publisher
                .flatMap { _ in
                    self.createDataSource(userId: userId, dataSource: caloriesDataSource)
                }
                .flatMap { _ in
                    self.insertDataPoints(userId: userId, dataSourceId: caloriesDataSource.dataStreamId,
                                        datasetId: datasetId, dataPoints: [caloriesDataPoint])
                }
                .eraseToAnyPublisher()
        }
        
        return publisher
    }
    
    // MARK: - Private Methods
    
    private func makeRequest<T: Codable, U: Codable>(endpoint: String, method: HTTPMethod, 
                                                   body: T? = nil) -> AnyPublisher<U, HealthyDuckError> {
        guard let url = URL(string: endpoint, relativeTo: baseURL) else {
            return Fail(error: HealthyDuckError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("HealthyDuck-iOS-Client/1.0", forHTTPHeaderField: "User-Agent")
        
        if let body = body {
            do {
                request.httpBody = try JSONEncoder().encode(body)
            } catch {
                return Fail(error: HealthyDuckError.encodingError(error))
                    .eraseToAnyPublisher()
            }
        }
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: U.self, decoder: JSONDecoder())
            .mapError { error in
                if error is DecodingError {
                    return HealthyDuckError.decodingError(error)
                } else {
                    return HealthyDuckError.networkError(error)
                }
            }
            .eraseToAnyPublisher()
    }
}

// MARK: - Supporting Types

public enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case PATCH = "PATCH"
    case DELETE = "DELETE"
}

public enum HealthyDuckError: Error, LocalizedError {
    case invalidURL
    case networkError(Error)
    case encodingError(Error)
    case decodingError(Error)
    case apiError(Int, String)
    
    public var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .encodingError(let error):
            return "Encoding error: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Decoding error: \(error.localizedDescription)"
        case .apiError(let code, let message):
            return "API error \(code): \(message)"
        }
    }
}

// MARK: - Data Models (abbreviated for space)

public struct DataSource: Codable {
    public let dataStreamId: String
    public let dataStreamName: String
    public let type: String
    public let application: Application
    public let dataType: [DataType]
    
    public static func stepsDataSource() -> DataSource {
        return DataSource(
            dataStreamId: UUID().uuidString,
            dataStreamName: "Steps Data Source",
            type: "derived",
            application: Application.defaultApplication(),
            dataType: [DataType(name: "com.ultimatequack.step_count.delta", field: [])]
        )
    }
    
    public static func caloriesDataSource() -> DataSource {
        return DataSource(
            dataStreamId: UUID().uuidString,
            dataStreamName: "Calories Data Source", 
            type: "derived",
            application: Application.defaultApplication(),
            dataType: [DataType(name: "com.ultimatequack.calories.expended", field: [])]
        )
    }
}

public struct Application: Codable {
    public let packageName: String
    public let version: String
    public let name: String
    
    public static func defaultApplication() -> Application {
        return Application(
            packageName: Bundle.main.bundleIdentifier ?? "com.ultimatequack.healthyduck",
            version: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0",
            name: "HealthyDuck iOS Client"
        )
    }
}

// Additional data models would be defined here...
