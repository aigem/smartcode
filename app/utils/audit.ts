import fs from "fs/promises";
import path from "path";

export async function logCommand(userId: string, command: string, result: string) {
  const logEntry = `${new Date().toISOString()} - User: ${userId}, Command: ${command}, Result: ${result}\n`;
  const logPath = path.join(process.cwd(), "audit.log");
  await fs.appendFile(logPath, logEntry);
}
