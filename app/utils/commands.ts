import fs from "fs/promises";
import yaml from "js-yaml";
import path from "path";

export async function getCommands() {
  const filePath = path.join(process.cwd(), "commands.yaml");
  const fileContents = await fs.readFile(filePath, "utf8");
  const data = yaml.load(fileContents) as { commands: any[] };
  return data.commands;
}
