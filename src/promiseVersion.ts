/**
 * Promise-based implementation demonstrating Promise chaining,
 * Promise.all(), and Promise.race()
 */

import { HttpClient } from './utils/httpClient';
import { Logger } from './utils/logger';
import { WeatherData, NewsData, AsyncMethod, DashboardData } from './types';

class PromiseDashboard {
  private static readonly WEATHER_API_URL =
    'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto';
  private static readonly NEWS_API_URL = 'https://dummyjson.com/posts?limit=5';
  private static readonly BACKUP_NEWS_API_URL = 'https://dummyjson.com/posts?limit=3&skip=5';

  /**
   * Fetch weather data using Promises
   */
  private static fetchWeather(): Promise<WeatherData> {
    Logger.info('Fetching weather data...');

    return HttpClient.makeRequestPromise<any>(this.WEATHER_API_URL)
      .then((data) => {
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

        Logger.success('Weather data transformed successfully');
        return weatherData;
      })
      .catch((error) => {
        Logger.error(`Weather fetch failed: ${error.message}`);
        throw new Error(`Weather API Error: ${error.message}`);
      });
  }

  /**
   * Fetch news data using Promises
   */
  private static fetchNews(): Promise<NewsData> {
    Logger.info('Fetching news data...');

    return HttpClient.makeRequestPromise<NewsData>(this.NEWS_API_URL)
      .then((data) => {
        if (!data || !data.posts || data.posts.length === 0) {
          throw new Error('Invalid news data structure');
        }

        Logger.success('News data fetched successfully');
        return data;
      })
      .catch((error) => {
        Logger.error(`News fetch failed: ${error.message}`);
        throw new Error(`News API Error: ${error.message}`);
      });
  }

  /**
   * Demonstrate Promise chaining (sequential operations)
   */
  private static demonstratePromiseChaining(): Promise<DashboardData> {
    Logger.section('Demonstrating Promise Chaining (Sequential)');

    const startTime = Date.now();

    return this.fetchWeather()
      .then((weatherData) => {
        Logger.success('Weather data received');
        Logger.info('Processing weather data...');

        // Simulate processing time
        return new Promise<WeatherData>((resolve) => {
          setTimeout(() => resolve(weatherData), 200);
        });
      })
      .then((weatherData) => {
        Logger.info('Weather processing complete, fetching news...');

        return this.fetchNews().then((newsData) => ({
          weather: weatherData,
          news: newsData,
        }));
      })
      .then((dashboardData) => {
        const totalTime = Date.now() - startTime;
        Logger.timing('Promise chaining execution time', totalTime);
        Logger.success('Sequential Promise chain completed');

        return dashboardData;
      })
      .catch((error) => {
        Logger.error(`Promise chaining failed: ${error.message}`);
        throw error;
      });
  }

  /**
   * Demonstrate Promise.all() for parallel execution
   */
  private static demonstratePromiseAll(): Promise<DashboardData> {
    Logger.section('Demonstrating Promise.all() (Parallel)');

    const startTime = Date.now();

    const weatherPromise = this.fetchWeather();
    const newsPromise = this.fetchNews();

    return Promise.all([weatherPromise, newsPromise])
      .then(([weatherData, newsData]) => {
        const totalTime = Date.now() - startTime;
        Logger.timing('Promise.all() execution time', totalTime);
        Logger.success('All promises resolved in parallel!');

        return {
          weather: weatherData,
          news: newsData,
        };
      })
      .catch((error) => {
        Logger.error(`Promise.all() failed: ${error.message}`);
        throw new Error(`Parallel execution failed: ${error.message}`);
      });
  }

  /**
   * Demonstrate Promise.race() for fastest response
   */
  private static demonstratePromiseRace(): Promise<string> {
    Logger.section('Demonstrating Promise.race() (Fastest Response)');

    const startTime = Date.now();

    // Create multiple promises with different delays
    const fastPromise = new Promise<string>((resolve) => {
      setTimeout(() => {
        const duration = Date.now() - startTime;
        Logger.timing('Fast promise', duration);
        resolve('Fast response completed');
      }, 800);
    });

    const mediumPromise = HttpClient.makeRequestPromise<NewsData>(this.NEWS_API_URL).then(() => {
      const duration = Date.now() - startTime;
      Logger.timing('News API promise', duration);
      return 'News API response completed';
    });

    const slowPromise = new Promise<string>((resolve) => {
      setTimeout(() => {
        const duration = Date.now() - startTime;
        Logger.timing('Slow promise', duration);
        resolve('Slow response completed');
      }, 2000);
    });

    return Promise.race([fastPromise, mediumPromise, slowPromise])
      .then((result) => {
        const totalTime = Date.now() - startTime;
        Logger.timing('Promise.race() winner time', totalTime);
        Logger.success(`Promise.race() winner: ${result}`);
        return result;
      })
      .catch((error) => {
        Logger.error(`Promise.race() failed: ${error.message}`);
        throw error;
      });
  }

  /**
   * Demonstrate Promise.allSettled() for handling mixed results
   */
  private static demonstratePromiseAllSettled(): Promise<void> {
    Logger.section('Demonstrating Promise.allSettled() (Mixed Results)');

    const startTime = Date.now();

    const successPromise = this.fetchWeather();
    const failPromise = HttpClient.makeRequestPromise('https://invalid-url.example.com/api');
    const anotherSuccessPromise = this.fetchNews();

    return Promise.allSettled([successPromise, failPromise, anotherSuccessPromise]).then(
      (results) => {
        const totalTime = Date.now() - startTime;
        Logger.timing('Promise.allSettled() execution time', totalTime);

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            Logger.success(`Promise ${index + 1}: Fulfilled`);
          } else {
            Logger.error(`Promise ${index + 1}: Rejected - ${result.reason.message}`);
          }
        });

        const fulfilledCount = results.filter((r) => r.status === 'fulfilled').length;
        Logger.info(`${fulfilledCount} out of ${results.length} promises succeeded`);
      }
    );
  }

  /**
   * Display dashboard data
   */
  private static displayDashboard(dashboardData: DashboardData): void {
    Logger.section('Dashboard Data');

    Logger.data('Weather', {
      location: `${dashboardData.weather.location.name}, ${dashboardData.weather.location.country}`,
      temperature: `${dashboardData.weather.current.temperature}°C`,
      humidity: `${dashboardData.weather.current.humidity}%`,
      windSpeed: `${dashboardData.weather.current.windSpeed} km/h`,
      description: dashboardData.weather.current.description,
    });

    Logger.data(
      'Latest News Headlines',
      dashboardData.news.posts.slice(0, 3).map((post) => ({
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
  public static async run(): Promise<void> {
    Logger.header(AsyncMethod.PROMISE);
    Logger.info('Starting Promise-based weather and news dashboard...');

    try {
      // Demonstrate different Promise patterns
      const chainedData = await this.demonstratePromiseChaining();
      this.displayDashboard(chainedData);

      Logger.separator();

      const parallelData = await this.demonstratePromiseAll();
      this.displayDashboard(parallelData);

      Logger.separator();

      await this.demonstratePromiseRace();

      Logger.separator();

      await this.demonstratePromiseAllSettled();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Logger.error(`Promise dashboard failed: ${errorMessage}`);
    } finally {
      Logger.footer(AsyncMethod.PROMISE);
    }
  }
}

// Export for module usage
export default PromiseDashboard;

// Execute if this file is run directly
if (require.main === module) {
  PromiseDashboard.run().catch((error) => {
    Logger.error(`Unhandled promise rejection: ${error.message}`);
    process.exit(1);
  });
}
