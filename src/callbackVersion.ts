/**
 * Async/Await implementation demonstrating modern asynchronous programming
 * with proper error handling using try...catch blocks
 */

import { HttpClient } from "./utils/httpClient";
import { Logger } from "./utils/logger";
import { WeatherData, NewsData, AsyncMethod, DashboardData } from "./types";

class AsyncAwaitDashboard {
  private static readonly WEATHER_API_URL =
    "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto";
  private static readonly NEWS_API_URL = "https://dummyjson.com/posts?limit=5";

  /**
   * Fetch weather data using async/await
   */
  private static async fetchWeather(): Promise<WeatherData> {
    Logger.info("🌤️  Fetching weather data...");

    try {
      const data = await HttpClient.makeRequestPromise<any>(
        this.WEATHER_API_URL
      );

      const weatherData: WeatherData = {
        location: {
          name: "Berlin",
          country: "Germany",
          lat: 52.52,
          lon: 13.41,
        },
        current: {
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          description: this.getWeatherDescription(data.current.temperature_2m),
        },
        timestamp: new Date().toISOString(),
      };

      Logger.success("Weather data transformed successfully");
      return weatherData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown weather error";
      Logger.error(`Weather fetch failed: ${errorMessage}`);
      throw new Error(`Weather API Error: ${errorMessage}`);
    }
  }

  /**
   * Fetch news data using async/await
   */
  private static async fetchNews(): Promise<NewsData> {
    Logger.info("📰 Fetching news data...");

    try {
      const data = await HttpClient.makeRequestPromise<NewsData>(
        this.NEWS_API_URL
      );

      if (!data || !data.posts || data.posts.length === 0) {
        throw new Error("Invalid news data structure");
      }

      Logger.success("News data fetched successfully");
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown news error";
      Logger.error(`News fetch failed: ${errorMessage}`);
      throw new Error(`News API Error: ${errorMessage}`);
    }
  }

  /**
   * Demonstrate sequential async/await operations
   */
  private static async demonstrateSequentialAsync(): Promise<DashboardData> {
    Logger.section("Demonstrating Sequential Async/Await");

    const startTime = Date.now();

    try {
      // Sequential execution - each operation waits for the previous one
      const weatherData = await this.fetchWeather();
      Logger.success("✅ Weather data received");

      // Simulate processing time
      Logger.info("Processing weather data...");
      await this.delay(200);
      Logger.info("Weather processing complete, fetching news...");

      const newsData = await this.fetchNews();
      Logger.success("✅ News data received");

      const totalTime = Date.now() - startTime;
      Logger.timing("Sequential async/await execution time", totalTime);

      return {
        weather: weatherData,
        news: newsData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error(`Sequential async operation failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Demonstrate parallel async/await operations using Promise.all()
   */
  private static async demonstrateParallelAsync(): Promise<DashboardData> {
    Logger.section("Demonstrating Parallel Async/Await with Promise.all()");

    const startTime = Date.now();

    try {
      // Parallel execution - both operations start simultaneously
      const [weatherData, newsData] = await Promise.all([
        this.fetchWeather(),
        this.fetchNews(),
      ]);

      const totalTime = Date.now() - startTime;
      Logger.timing("Parallel async/await execution time", totalTime);
      Logger.success("All async operations completed in parallel!");

      return {
        weather: weatherData,
        news: newsData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error(`Parallel async operation failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Demonstrate concurrent async operations with individual error handling
   */
  private static async demonstrateConcurrentAsync(): Promise<DashboardData | null> {
    Logger.section(
      "Demonstrating Concurrent Async/Await with Individual Error Handling"
    );

    const startTime = Date.now();

    // Start both operations concurrently but handle them individually
    const weatherPromise = this.fetchWeather().catch((error) => {
      Logger.warn(`Weather fetch failed, using fallback: ${error.message}`);
      return this.getFallbackWeatherData();
    });

    const newsPromise = this.fetchNews().catch((error) => {
      Logger.warn(`News fetch failed, using fallback: ${error.message}`);
      return this.getFallbackNewsData();
    });

    try {
      const [weatherData, newsData] = await Promise.all([
        weatherPromise,
        newsPromise,
      ]);

      const totalTime = Date.now() - startTime;
      Logger.timing(
        "Concurrent async/await with fallbacks execution time",
        totalTime
      );
      Logger.success("Concurrent operations completed with fallback handling!");

      return {
        weather: weatherData,
        news: newsData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error(`Concurrent async operation failed: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Demonstrate async/await with timeout handling
   */
  private static async demonstrateAsyncWithTimeout(): Promise<DashboardData | null> {
    Logger.section("Demonstrating Async/Await with Timeout Handling");

    const startTime = Date.now();
    const timeoutMs = 5000; // 5 second timeout

    try {
      const weatherPromise = this.fetchWeather();
      const newsPromise = this.fetchNews();

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      // Race between data fetching and timeout
      const [weatherData, newsData] = await Promise.race([
        Promise.all([weatherPromise, newsPromise]),
        timeoutPromise,
      ]);

      const totalTime = Date.now() - startTime;
      Logger.timing("Async/await with timeout execution time", totalTime);
      Logger.success("Operations completed within timeout!");

      return {
        weather: weatherData,
        news: newsData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error(`Timeout async operation failed: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Demonstrate async generator for streaming data
   */
  private static async *demonstrateAsyncGenerator(): AsyncGenerator<
    string,
    void,
    unknown
  > {
    Logger.section("Demonstrating Async Generator for Streaming Updates");

    yield "Starting data fetch operations...";

    try {
      yield "Initiating weather API request...";
      const weatherData = await this.fetchWeather();
      yield `Weather data received: ${weatherData.current.temperature}°C in ${weatherData.location.name}`;

      yield "Initiating news API request...";
      const newsData = await this.fetchNews();
      yield `News data received: ${newsData.posts.length} articles fetched`;

      yield "All operations completed successfully!";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      yield `Error occurred: ${errorMessage}`;
    }
  }

  /**
   * Process async generator stream
   */
  private static async processAsyncGenerator(): Promise<void> {
    try {
      const generator = this.demonstrateAsyncGenerator();

      for await (const update of generator) {
        Logger.info(`🔄 Stream Update: ${update}`);
        await this.delay(300); // Simulate processing time between updates
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error(`Async generator processing failed: ${errorMessage}`);
    }
  }

  /**
   * Demonstrate retry mechanism with async/await
   */
  private static async fetchWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.info(`Attempt ${attempt}/${maxRetries}`);
        const result = await operation();

        if (attempt > 1) {
          Logger.success(`Operation succeeded on attempt ${attempt}`);
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        if (attempt === maxRetries) {
          Logger.error(`All ${maxRetries} attempts failed`);
          throw lastError;
        }

        Logger.warn(
          `Attempt ${attempt} failed: ${lastError.message}, retrying in ${retryDelay}ms...`
        );
        await this.delay(retryDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Display dashboard data
   */
  private static displayDashboard(dashboardData: DashboardData): void {
    Logger.section("Dashboard Data");

    Logger.data("Weather", {
      location: `${dashboardData.weather.location.name}, ${dashboardData.weather.location.country}`,
      temperature: `${dashboardData.weather.current.temperature}°C`,
      humidity: `${dashboardData.weather.current.humidity}%`,
      windSpeed: `${dashboardData.weather.current.windSpeed} km/h`,
      description: dashboardData.weather.current.description,
    });

    Logger.data(
      "Latest News Headlines",
      dashboardData.news.posts.slice(0, 3).map((post) => ({
        title: post.title.substring(0, 60) + "...",
        likes: post.reactions.likes,
        views: post.views,
      }))
    );
  }

  /**
   * Utility methods
   */
  private static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static getWeatherDescription(temperature: number): string {
    if (temperature < 0) return "Very Cold ❄️";
    if (temperature < 10) return "Cold 🥶";
    if (temperature < 20) return "Cool 🌤️";
    if (temperature < 30) return "Warm ☀️";
    return "Hot 🔥";
  }

  private static getFallbackWeatherData(): WeatherData {
    return {
      location: {
        name: "Berlin",
        country: "Germany",
        lat: 52.52,
        lon: 13.41,
      },
      current: {
        temperature: 15,
        humidity: 65,
        windSpeed: 10,
        description: "Fallback Data 🔄",
      },
      timestamp: new Date().toISOString(),
    };
  }

  private static getFallbackNewsData(): NewsData {
    return {
      posts: [
        {
          id: 1,
          title: "Fallback News Article",
          body: "This is fallback news content when the API is unavailable.",
          tags: ["fallback", "news"],
          reactions: { likes: 0, dislikes: 0 },
          views: 0,
          userId: 1,
        },
      ],
      total: 1,
      skip: 0,
      limit: 1,
    };
  }

  /**
   * Main execution method
   */
  public static async run(): Promise<void> {
    Logger.header(AsyncMethod.ASYNC_AWAIT);
    Logger.info("Starting Async/Await weather and news dashboard...");

    try {
      // Demonstrate sequential async/await
      const sequentialData = await this.demonstrateSequentialAsync();
      this.displayDashboard(sequentialData);

      Logger.separator();

      // Demonstrate parallel async/await
      const parallelData = await this.demonstrateParallelAsync();
      this.displayDashboard(parallelData);

      Logger.separator();

      // Demonstrate concurrent async/await with error handling
      const concurrentData = await this.demonstrateConcurrentAsync();
      if (concurrentData) {
        this.displayDashboard(concurrentData);
      }

      Logger.separator();

      // Demonstrate async/await with timeout
      const timeoutData = await this.demonstrateAsyncWithTimeout();
      if (timeoutData) {
        this.displayDashboard(timeoutData);
      }

      Logger.separator();

      // Demonstrate async generator
      await this.processAsyncGenerator();

      Logger.separator();

      // Demonstrate retry mechanism
      Logger.section("Demonstrating Retry Mechanism");
      try {
        const retryData = await this.fetchWithRetry(
          () => this.fetchNews(),
          2,
          500
        );
        Logger.success("Retry mechanism completed successfully");
        Logger.data(
          "Retry Result",
          `Fetched ${retryData.posts.length} news articles`
        );
      } catch (error) {
        Logger.error(
          `Retry mechanism failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error(`Async/await dashboard failed: ${errorMessage}`);
    } finally {
      Logger.footer(AsyncMethod.ASYNC_AWAIT);
    }
  }
}

// Execute if this file is run directly
if (require.main === module) {
  AsyncAwaitDashboard.run().catch((error) => {
    Logger.error(`Unhandled async error: ${error.message}`);
    process.exit(1);
  });
}
