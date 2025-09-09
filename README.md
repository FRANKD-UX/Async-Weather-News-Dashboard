# Async Weather & News Dashboard

A comprehensive Node.js TypeScript project demonstrating different asynchronous programming patterns including **callbacks**, **promises**, and **async/await**. This project fetches weather data and news headlines from public APIs while showcasing best practices in asynchronous JavaScript/TypeScript development.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Asynchronous Patterns Demonstrated](#asynchronous-patterns-demonstrated)
- [Learning Outcomes](#learning-outcomes)
- [Sample Outputs](#sample-outputs)
- [Best Practices Implemented](#best-practices-implemented)

## Project Overview

This project demonstrates mastery of asynchronous programming concepts in Node.js by implementing the same functionality using three different approaches:

1. **Callback Version**: Traditional callback-based approach showcasing "callback hell"
2. **Promise Version**: Modern Promise-based approach with chaining, Promise.all(), and Promise.race()
3. **Async/Await Version**: ES2017+ syntax with proper error handling using try...catch

## Features

- **Weather Data Fetching**: Real-time weather information from Open-Meteo API
- **News Headlines**: Latest news from DummyJSON Posts API
- **Multiple Async Patterns**: Callbacks, Promises, and Async/Await implementations
- **Parallel Execution**: Demonstrates Promise.all() and concurrent operations
- **Race Conditions**: Shows Promise.race() for fastest response handling
- **Error Handling**: Comprehensive error handling across all patterns
- **Performance Comparison**: Benchmarking different async approaches
- **Colorful Logging**: Enhanced console output with chalk for better UX
- **Retry Mechanisms**: Automatic retry logic with exponential backoff
- **Interactive CLI**: User-friendly command-line interface

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd async-weather-news-dashboard
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

## Usage

### Interactive Mode

Run the main application with an interactive menu:

```bash
npm run dev
```

### Individual Versions

Run specific async implementations:

```bash
# Callback version (demonstrates callback hell)
npm run callback

# Promise version (chaining, Promise.all, Promise.race)
npm run promise

# Async/Await version (modern syntax with error handling)
npm run async

# Run all versions sequentially
npm test
```

## Project Structure

```
src/
├── index.ts                 # Main entry point with interactive CLI
├── types.ts                 # TypeScript type definitions
├── callbackVersion.ts       # Callback-based implementation
├── promiseVersion.ts        # Promise-based implementation
├── asyncAwaitVersion.ts     # Async/Await implementation
└── utils/
    ├── httpClient.ts        # HTTP request utility with retry logic
    └── logger.ts           # Enhanced logging with colors and formatting
```

## API Endpoints

### Weather API (Open-Meteo)

- **URL**: `https://api.open-meteo.com/v1/forecast`
- **Parameters**: latitude, longitude, current weather variables
- **Data**: Temperature, humidity, wind speed

### News API (DummyJSON)

- **URL**: `https://dummyjson.com/posts`
- **Parameters**: limit (number of posts)
- **Data**: Post titles, content, reactions, views

## Asynchronous Patterns Demonstrated

### 1. Callback Version (`callbackVersion.ts`)

- **Callback Hell**: Nested callbacks showing traditional async patterns
- **Error-First Callbacks**: Standard Node.js callback pattern
- **Parallel Callbacks**: Manual coordination of multiple async operations

```typescript
// Example: Callback Hell Demonstration
fetchWeather((weatherError, weatherData) => {
  if (weatherError) return handleError(weatherError);

  processWeather(weatherData, (processError) => {
    if (processError) return handleError(processError);

    fetchNews((newsError, newsData) => {
      if (newsError) return handleError(newsError);

      displayDashboard(weatherData, newsData);
    });
  });
});
```

### 2. Promise Version (`promiseVersion.ts`)

- **Promise Chaining**: Sequential operations with `.then()`
- **Promise.all()**: Parallel execution waiting for all promises
- **Promise.race()**: First-to-complete wins
- **Promise.allSettled()**: Handle mixed success/failure results

```typescript
// Example: Promise.all() for parallel execution
Promise.all([fetchWeather(), fetchNews()])
  .then(([weatherData, newsData]) => {
    displayDashboard({ weather: weatherData, news: newsData });
  })
  .catch((error) => {
    handleError(error);
  });
```

### 3. Async/Await Version (`asyncAwaitVersion.ts`)

- **Sequential Async/Await**: Clean, synchronous-looking async code
- **Parallel Async/Await**: Using Promise.all() with await
- **Try/Catch Error Handling**: Proper exception handling
- **Async Generators**: Streaming data processing
- **Timeout Handling**: Operation timeouts with Promise.race()

```typescript
// Example: Clean async/await with error handling
async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const [weatherData, newsData] = await Promise.all([
      fetchWeather(),
      fetchNews(),
    ]);

    return { weather: weatherData, news: newsData };
  } catch (error) {
    handleError(error);
    throw error;
  }
}
```

## Learning Outcomes

After running this project, you will understand:

1. **Event Loop Mechanics**: How JavaScript handles asynchronous operations
2. **Callback Patterns**: Traditional async programming and its limitations
3. **Promise Advantages**: How Promises solve callback hell and improve error handling
4. **Async/Await Benefits**: Modern syntax that makes async code more readable
5. **Error Handling**: Different error handling patterns across async styles
6. **Performance Implications**: When to use parallel vs sequential execution
7. **Best Practices**: Industry-standard patterns for async TypeScript/Node.js

## Sample Outputs

### Callback Version Output

```
ASYNC WEATHER & NEWS DASHBOARD - CALLBACK
Started at: 2024-09-05T14:30:00.000Z
============================================================

Demonstrating Callback Hell (Sequential Operations)
----------------------------------------
    Fetching weather data...
Weather data fetched successfully
Weather data received
Processing weather data...
Fetching news data...
News data fetched successfully
```
