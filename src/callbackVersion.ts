/**
 * Callback-based implementation demonstrating callback hell
 * and nested asynchronous operations
 */

import { HttpClient } from './utils/httpClient';
import { Logger } from './utils/logger';
import { WeatherData, NewsData, CallbackFunction, AsyncMethod } from './types';

class CallbackDashboard {
  private static readonly WEATHER_API_URL =
    'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto';
  private static readonly NEWS_API_URL = 'https://dummyjson.com/posts?limit=5';

  /**
   * Fetch weather data using callbacks
   */
  private static fetchWeather(callback: CallbackFunction<WeatherData>): void {
    Logger.info('Fetching weather data...');

    HttpClient.makeRequest<any>(this.WEATHER_API_URL, (error, data) => {
      if (error) {
        Logger.error(`Weather API failed: ${error.message}`);
        callback(error);
        return;
      }

      try {
        // Transform raw API data to our WeatherData format
        const weatherData: WeatherData = {
          location: {
            name: 'Berlin',
            country: 'Germany',
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

        Logger.success('Weather data fetched successfully');
        callback(null, weatherData);
      } catch (transformError) {
        const error =
          transformError instanceof Error
            ? transformError
            : new Error('Weather data transformation failed');
        Logger.error(`Weather data transformation failed: ${error.message}`);
        callback(error);
      }
    });
  }

  /**
   * Fetch news data using callbacks
   */
  private static fetchNews(callback: CallbackFunction<NewsData>): void {
    Logger.info('Fetching news data...');

    HttpClient.makeRequest<NewsData>(this.NEWS_API_URL, (error, data) => {
      if (error) {
        Logger.error(`News API failed: ${error.message}`);
        callback(error);
        return;
      }

      if (!data || !data.posts) {
        const error = new Error('Invalid news data structure');
        Logger.error('Invalid news data structure received');
        callback(error);
        return;
      }

      Logger.success('News data fetched successfully');
      callback(null, data);
    });
  }

  /**
   * Demonstrate callback hell by chaining dependent operations
   */
  private static demonstrateCallbackHell(): void {
    Logger.section('Demonstrating Callback Hell (Sequential Operations)');

    const startTime = Date.now();

    // Level 1: Fetch weather
    this.fetchWeather((weatherError, weatherData) => {
      if (weatherError) {
        Logger.error(`Weather fetch failed: ${weatherError.message}`);
        return;
      }

      Logger.success('Weather data received');

      // Level 2: Process weather data, then fetch news
      setTimeout(() => {
        Logger.info('Processing weather data...');

        // Level 3: Fetch news after processing weather
        this.fetchNews((newsError, newsData) => {
          if (newsError) {
            Logger.error(`News fetch failed: ${newsError.message}`);
            return;
          }

          Logger.success('News data received');

          // Level 4: Process both data sets
          setTimeout(() => {
            Logger.info('Processing combined data...');

            // Level 5: Final processing and display
            setTimeout(() => {
              const totalTime = Date.now() - startTime;
              Logger.timing('Total callback hell execution time', totalTime);

              this.displayDashboard(weatherData!, newsData!);

              // Demonstrate parallel callbacks
              this.demonstrateParallelCallbacks();
            }, 500);
          }, 300);
        });
      }, 200);
    });
  }

  /**
   * Demonstrate parallel callback execution
   */
  private static demonstrateParallelCallbacks(): void {
    Logger.section('Demonstrating Parallel Callbacks');

    let weatherResult: WeatherData | null = null;
    let newsResult: NewsData | null = null;
    let completedRequests = 0;
    let hasError = false;

    const startTime = Date.now();

    const checkCompletion = () => {
      completedRequests++;
      if (completedRequests === 2 && !hasError) {
        const totalTime = Date.now() - startTime;
        Logger.timing('Parallel callbacks execution time', totalTime);
        Logger.success('Both requests completed in parallel!');

        if (weatherResult && newsResult) {
          this.displayDashboard(weatherResult, newsResult);
        }
      }
    };

    // Start both requests simultaneously
    this.fetchWeather((error, data) => {
      if (error) {
        hasError = true;
        Logger.error(`Parallel weather fetch failed: ${error.message}`);
        return;
      }
      weatherResult = data!;
      Logger.success('Weather request completed');
      checkCompletion();
    });

    this.fetchNews((error, data) => {
      if (error) {
        hasError = true;
        Logger.error(`Parallel news fetch failed: ${error.message}`);
        return;
      }
      newsResult = data!;
      Logger.success('News request completed');
      checkCompletion();
    });
  }

  /**
   * Display the dashboard data
   */
  private static displayDashboard(weather: WeatherData, news: NewsData): void {
    Logger.section('Dashboard Data');

    Logger.data('Weather', {
      location: `${weather.location.name}, ${weather.location.country}`,
      temperature: `${weather.current.temperature}°C`,
      humidity: `${weather.current.humidity}%`,
      windSpeed: `${weather.current.windSpeed} km/h`,
      description: weather.current.description,
    });

    Logger.data(
      'Latest News Headlines',
      news.posts.slice(0, 3).map((post) => ({
        title: post.title.substring(0, 60) + '...',
        likes: post.reactions.likes,
        views: post.views,
      }))
    );
  }

  private static getWeatherDescription(temperature: number): string {
    if (temperature < 0) return 'Very Cold ';
    if (temperature < 10) return 'Cold ';
    if (temperature < 20) return 'Cool ';
    if (temperature < 30) return 'Warm ';
    return 'Hot ';
  }

  /**
   * Main execution method
   */
  public static run(): void {
    Logger.header(AsyncMethod.CALLBACK);
    Logger.info('Starting callback-based weather and news dashboard...');

    try {
      this.demonstrateCallbackHell();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Logger.error(`Callback dashboard failed: ${errorMessage}`);
    }

    // Give time for async operations to complete before footer
    setTimeout(() => {
      Logger.footer(AsyncMethod.CALLBACK);
    }, 8000);
  }
}

// Export for module usage
export default CallbackDashboard;

// Execute if this file is run directly
if (require.main === module) {
  CallbackDashboard.run();
}
