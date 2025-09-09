/**
 * HTTP Client utility for making requests
 * Supports both callback and promise-based approaches
 */

import * as https from "https";
import * as http from "http";
import { URL } from "url";
import { CallbackFunction, FetchOptions } from "../types";

export class HttpClient {
  private static readonly DEFAULT_TIMEOUT = 10000;
  private static readonly DEFAULT_RETRIES = 3;
  private static readonly DEFAULT_RETRY_DELAY = 1000;

  /**
   * Make HTTP request using callbacks (demonstrating callback hell)
   */
  public static makeRequest<T>(
    url: string,
    callback: CallbackFunction<T>,
    options: FetchOptions = {}
  ): void {
    const { timeout = this.DEFAULT_TIMEOUT, retries = this.DEFAULT_RETRIES } =
      options;

    this.attemptRequest(url, callback, timeout, retries);
  }

  private static attemptRequest<T>(
    url: string,
    callback: CallbackFunction<T>,
    timeout: number,
    retriesLeft: number
  ): void {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "https:" ? https : http;

    const req = client.get(url, { timeout }, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            const parsedData = JSON.parse(data);
            callback(null, parsedData);
          } else {
            const error = new Error(
              `HTTP ${res.statusCode}: ${res.statusMessage}`
            );
            if (retriesLeft > 0) {
              console.warn(
                `Request failed, retrying... (${retriesLeft} attempts left)`
              );
              setTimeout(() => {
                this.attemptRequest(url, callback, timeout, retriesLeft - 1);
              }, this.DEFAULT_RETRY_DELAY);
            } else {
              callback(error);
            }
          }
        } catch (parseError) {
          const error =
            parseError instanceof Error ? parseError : new Error("Parse error");
          callback(error);
        }
      });
    });

    req.on("error", (error) => {
      if (retriesLeft > 0) {
        console.warn(
          `Request failed, retrying... (${retriesLeft} attempts left)`
        );
        setTimeout(() => {
          this.attemptRequest(url, callback, timeout, retriesLeft - 1);
        }, this.DEFAULT_RETRY_DELAY);
      } else {
        callback(error);
      }
    });

    req.on("timeout", () => {
      req.destroy();
      const error = new Error(`Request timeout after ${timeout}ms`);
      if (retriesLeft > 0) {
        console.warn(
          `Request timed out, retrying... (${retriesLeft} attempts left)`
        );
        setTimeout(() => {
          this.attemptRequest(url, callback, timeout, retriesLeft - 1);
        }, this.DEFAULT_RETRY_DELAY);
      } else {
        callback(error);
      }
    });
  }

  /**
   * Make HTTP request using Promises
   */
  public static makeRequestPromise<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.makeRequest<T>(
        url,
        (error, data) => {
          if (error) {
            reject(error);
          } else if (data) {
            resolve(data);
          } else {
            reject(new Error("No data received"));
          }
        },
        options
      );
    });
  }

  /**
   * Utility method for timing requests
   */
  public static async measureRequestTime<T>(
    requestFn: () => Promise<T>
  ): Promise<{ data: T; duration: number }> {
    const startTime = Date.now();
    const data = await requestFn();
    const duration = Date.now() - startTime;

    return { data, duration };
  }
}
