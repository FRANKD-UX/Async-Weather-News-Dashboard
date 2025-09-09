/**
 * Main entry point for the Async Weather & News Dashboard
 * Provides interactive CLI for running different async implementations
 */

import * as readline from "readline";
import { Logger } from "./utils/logger";
import { AsyncMethod } from "./types";

// Dynamic imports to avoid loading all implementations at once
class DashboardRunner {
  private readonly rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Display main menu
   */
  private showMenu(): void {
    console.clear();
    console.log("🌤️📰 Async Weather & News Dashboard\n");
    console.log("Choose an asynchronous programming demonstration:\n");
    console.log("1. 📞 Callback Version (with callback hell)");
    console.log("2. 🔗 Promise Version (with chaining, all, race)");
    console.log("3. ⚡ Async/Await Version (modern syntax)");
    console.log("4. 🏃‍♂️ Run All Versions (sequential)");
    console.log("5. 📊 Performance Comparison");
    console.log("0. 🚪 Exit\n");
  }

  /**
   * Get user choice
   */
  private getChoice(): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question("Enter your choice (0-5): ", (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Run callback version
   */
  private async runCallbackVersion(): Promise<void> {
    const { default: CallbackDashboard } = await import("./callbackVersion");
    CallbackDashboard.run();

    // Wait for callbacks to complete
    await this.delay(10000);
    await this.waitForUserInput();
  }

  /**
   * Run promise version
   */
  private async runPromiseVersion(): Promise<void> {
    const { default: PromiseDashboard } = await import("./promiseVersion");
    await PromiseDashboard.run();
    await this.waitForUserInput();
  }

  /**
   * Run async/await version
   */
  private async runAsyncAwaitVersion(): Promise<void> {
    const { default: AsyncAwaitDashboard } = await import(
      "./asyncAwaitVersion"
    );
    await AsyncAwaitDashboard.run();
    await this.waitForUserInput();
  }

  /**
   * Run all versions sequentially
   */
  private async runAllVersions(): Promise<void> {
    Logger.header("ALL VERSIONS" as AsyncMethod);
    Logger.info("Running all asynchronous implementations sequentially...\n");

    await this.runCallbackVersion();
    console.log("\n" + "=".repeat(80) + "\n");

    await this.runPromiseVersion();
    console.log("\n" + "=".repeat(80) + "\n");

    await this.runAsyncAwaitVersion();

    Logger.footer("ALL VERSIONS" as AsyncMethod);
    await this.waitForUserInput();
  }

  /**
   * Performance comparison between different methods
   */
  private async performanceComparison(): Promise<void> {
    Logger.header("PERFORMANCE COMPARISON" as AsyncMethod);
    Logger.info("Comparing performance of different async patterns...\n");

    const results: { method: string; duration: number }[] = [];

    // Test Promise version performance
    try {
      Logger.section("Testing Promise Performance");
      const startPromise = Date.now();
      const { default: PromiseDashboard } = await import("./promiseVersion");
      // Run a simplified version for timing
      await PromiseDashboard.run();
      const promiseDuration = Date.now() - startPromise;
      results.push({ method: "Promise", duration: promiseDuration });
      Logger.timing("Promise method total time", promiseDuration);
    } catch (error) {
      Logger.error(
        `Promise performance test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    await this.delay(1000);

    // Test Async/Await version performance
    try {
      Logger.section("Testing Async/Await Performance");
      const startAsync = Date.now();
      const { default: AsyncAwaitDashboard } = await import(
        "./asyncAwaitVersion"
      );
      await AsyncAwaitDashboard.run();
      const asyncDuration = Date.now() - startAsync;
      results.push({ method: "Async/Await", duration: asyncDuration });
      Logger.timing("Async/await method total time", asyncDuration);
    } catch (error) {
      Logger.error(
        `Async/await performance test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    // Display comparison results
    Logger.section("Performance Comparison Results");
    if (results.length > 1) {
      const fastest = results.reduce((prev, current) =>
        prev.duration < current.duration ? prev : current
      );
      const slowest = results.reduce((prev, current) =>
        prev.duration > current.duration ? prev : current
      );

      Logger.success(`Fastest: ${fastest.method} (${fastest.duration}ms)`);
      Logger.info(`Slowest: ${slowest.method} (${slowest.duration}ms)`);

      const difference = slowest.duration - fastest.duration;
      const percentage = ((difference / slowest.duration) * 100).toFixed(1);
      Logger.data(
        "Performance Difference",
        `${difference}ms (${percentage}% faster)`
      );
    }

    results.forEach((result) => {
      Logger.data(result.method, `${result.duration}ms`);
    });

    Logger.footer("PERFORMANCE COMPARISON" as AsyncMethod);
    await this.waitForUserInput();
  }

  /**
   * Wait for user input before continuing
   */
  private waitForUserInput(): Promise<void> {
    return new Promise((resolve) => {
      this.rl.question("\nPress Enter to return to menu...", () => {
        resolve();
      });
    });
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Main application loop
   */
  public async start(): Promise<void> {
    console.log("🚀 Starting Async Weather & News Dashboard...\n");

    while (true) {
      this.showMenu();
      const choice = await this.getChoice();

      switch (choice) {
        case "1":
          await this.runCallbackVersion();
          break;

        case "2":
          await this.runPromiseVersion();
          break;

        case "3":
          await this.runAsyncAwaitVersion();
          break;

        case "4":
          await this.runAllVersions();
          break;

        case "5":
          await this.performanceComparison();
          break;

        case "0":
          console.log(
            "\n👋 Thanks for using the Async Weather & News Dashboard!"
          );
          this.rl.close();
          return;

        default:
          console.log(
            "\n❌ Invalid choice. Please enter a number between 0-5.\n"
          );
          await this.delay(2000);
          break;
      }
    }
  }

  /**
   * Graceful shutdown
   */
  public shutdown(): void {
    this.rl.close();
  }
}

/**
 * Application entry point
 */
async function main(): Promise<void> {
  const dashboard = new DashboardRunner();

  // Handle process termination gracefully
  process.on("SIGINT", () => {
    console.log("\n\n🛑 Received SIGINT. Shutting down gracefully...");
    dashboard.shutdown();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n\n🛑 Received SIGTERM. Shutting down gracefully...");
    dashboard.shutdown();
    process.exit(0);
  });

  try {
    await dashboard.start();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    Logger.error(`Application failed: ${errorMessage}`);
    dashboard.shutdown();
    process.exit(1);
  }
}

// Run the application if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(" Unhandled error in main:", error);
    process.exit(1);
  });
}
