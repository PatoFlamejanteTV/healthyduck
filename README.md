# HealthyDuck

A modern, multi-platform health and fitness tracking solution—an open-source Google Fit clone. HealthyDuck aggregates, analyzes, and visualizes fitness data, and provides robust SDKs for seamless integration across multiple languages.

---

## Features

- **Fitness Data Aggregation**: Collect and analyze activity data over time, with endpoints and dashboard panels for time-based insights.
- **Multi-Platform Client SDKs**: Official SDKs for:
  - TypeScript
  - Java
  - C#
  - Python
  - Swift
- **Automated Workflows**: Includes GitHub Actions for stale issue management, summary generation, and automated labeling.
- **Email Verification**: Improved authentication workflow with OTP expiration handling and streamlined sign-up/login pages.
- **Sync & Continuous Updates**: Automated syncing of changes from the main branch, ensuring all components, API routes, and assets are up-to-date.
- **Dependency Management**: Automated updates (e.g., Next.js bumped to v15.4.7).

---

## Quick Start

1. **Clone the Repository**
   ```sh
   git clone https://github.com/PatoFlamejanteTV/healthyduck.git
   cd healthyduck
   ```

2. **Install Dependencies**
   - For the main TypeScript/Node.js app:
     ```sh
     npm install
     ```
   - (Refer to respective SDK directories for multi-language support instructions.)

3. **Run the Application**
   ```sh
   npm run dev
   ```

---

## SDKs

Access HealthyDuck via your language of choice. Each SDK is feature-complete and mirrors the HealthyDuck API.  
See the `/sdk` folder or documentation for usage examples.

- **TypeScript**: `/sdk/typescript`
- **Python**: `/sdk/python`
- **Java**: `/sdk/java`
- **C#**: `/sdk/csharp`
- **Swift**: `/sdk/swift`

---

## Workflows

- `label.yml`: Automatic labeling for issues and PRs.
- `stale.yml`: Marks stale issues/PRs for better project hygiene.
- `summary.yml`: Generates automated summaries for project status.

---

## Contribution

Contributions are welcome!  
Please open an issue or submit a pull request.

---

## License

MIT

---

## Acknowledgements

- Inspired by [Google Fit](https://www.google.com/fit/).
- Thanks to all contributors and bot collaborators.
