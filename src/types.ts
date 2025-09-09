/**
 * Type definitions for Weather and News APIs
 */

export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    description: string;
  };
  timestamp: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
  views: number;
  userId: number;
}

export interface NewsData {
  posts: NewsArticle[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export type CallbackFunction<T> = (error: Error | null, data?: T) => void;

export interface DashboardData {
  weather: WeatherData;
  news: NewsData;
}

export enum AsyncMethod {
  CALLBACK = "callback",
  PROMISE = "promise",
  ASYNC_AWAIT = "async/await",
}

export interface FetchOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}
