import fs from "fs";
import path from "path";

export class Logger {
  private logPath: string;

  constructor(logDir: string) {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.logPath = path.join(logDir, "orchestration.log");
  }

  log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    // Print to console
    console.log(message);

    // Append to file
    fs.appendFileSync(this.logPath, logMessage + "\n");
  }

  error(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;

    console.error(`\x1b[31m${message}\x1b[0m`); // Red color for console
    fs.appendFileSync(this.logPath, logMessage + "\n");
  }

  success(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] SUCCESS: ${message}`;

    console.log(`\x1b[32m${message}\x1b[0m`); // Green color
    fs.appendFileSync(this.logPath, logMessage + "\n");
  }
}
