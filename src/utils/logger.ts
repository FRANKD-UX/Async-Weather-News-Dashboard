/**
 * Logger utility for consistent console output formatting
 */

import chalk from 'chalk';
import { AsyncMethod } from '../types';

export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  public static header(method: AsyncMethod): void {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.cyan.bold(`ASYNC WEATHER & NEWS DASHBOARD - ${method.toUpperCase()}`));
    console.log(chalk.gray(`Started at: ${this.formatTimestamp()}`));
    console.log('='.repeat(60));
  }

  public static section(title: string): void {
    console.log(chalk.yellow.bold(`\n ${title}`));
    console.log('-'.repeat(40));
  }

  public static success(message: string): void {
    console.log(chalk.green(` ${message}`));
  }

  public static error(message: string): void {
    console.log(chalk.red(` ${message}`));
  }

  public static info(message: string): void {
    console.log(chalk.blue(`  ${message}`));
  }

  public static warn(message: string): void {
    console.log(chalk.yellow(`  ${message}`));
  }

  public static data(label: string, value: any): void {
    console.log(chalk.magenta(` ${label}:`), value);
  }

  public static timing(operation: string, duration: number): void {
    const color = duration > 2000 ? chalk.red : duration > 1000 ? chalk.yellow : chalk.green;
    console.log(color(`  ${operation}: ${duration}ms`));
  }

  public static separator(): void {
    console.log(chalk.gray('-'.repeat(40)));
  }

  public static footer(method: AsyncMethod): void {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.cyan.bold(` ${method.toUpperCase()} DEMONSTRATION COMPLETED`));
    console.log(chalk.gray(`Finished at: ${this.formatTimestamp()}`));
    console.log('='.repeat(60) + '\n');
  }
}
