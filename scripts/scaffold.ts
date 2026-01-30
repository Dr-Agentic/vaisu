import fs from "fs";
import path from "path";
import readline from "readline";
import { runAgent } from "../agents/modules/agentRunner.js";
import { loadConfig } from "../agents/modules/config.js";
import { Logger } from "../agents/modules/logger.js";

// Configuration for the Scaffy specific model if needed
const SCAFFY_MODEL = "z-ai/glm-4.5-air:free";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function main() {
  console.log("🏗️  SCAFFY - The Application Scaffolder 🏗️");
  console.log("-------------------------------------------");

  const config = loadConfig();

  // 1. Gather Inputs
  const appName = await question("1. Name of the new application: ");
  let targetDir = await question(
    `2. Target directory (absolute path, default: ${path.join(process.cwd(), "../", appName)}): `,
  );

  if (!targetDir) {
    targetDir = path.join(process.cwd(), "../", appName);
  }

  // Resolve absolute path
  if (!path.isAbsolute(targetDir)) {
    targetDir = path.resolve(process.cwd(), targetDir);
  }

  const dbType =
    (await question(
      "3. Database type (dynamodb/postgres) [default: dynamodb]: ",
    )) || "dynamodb";
  const themeMode =
    (await question(
      "4. Theme strategy (clone-vaisu/new-proposal) [default: clone-vaisu]: ",
    )) || "clone-vaisu";

  let themePrompt = "";
  if (themeMode === "new-proposal") {
    themePrompt = await question(
      "   > Describe the desired theme (colors, vibe): ",
    );
  }

  rl.close();

  console.log("\n📋 Configuration:");
  console.log(`- App Name: ${appName}`);
  console.log(`- Path:     ${targetDir}`);
  console.log(`- Database: ${dbType}`);
  console.log(
    `- Theme:    ${themeMode} ${themePrompt ? `(${themePrompt})` : ""}`,
  );
  console.log("\n🚀 Launching Scaffy...");

  // 2. Setup Logger
  if (!fs.existsSync(targetDir)) {
    try {
      fs.mkdirSync(targetDir, { recursive: true });
    } catch (e) {
      // If we can't create the root, we might not be able to write logs there yet.
      // But the agent might handle it. For now, let's just log to console if this fails.
      console.warn(
        "Could not create target directory immediately. Agent will attempt.",
      );
    }
  }

  // We log to the CURRENT project's context first, to track the scaffolding job
  const jobLogDir = path.join(config.projectRoot, ".context/scaffolding-jobs");
  if (!fs.existsSync(jobLogDir)) fs.mkdirSync(jobLogDir, { recursive: true });

  const logger = new Logger(jobLogDir);
  const logFile = path.join(
    jobLogDir,
    `${new Date().toISOString().split("T")[0]}-scaffy-${appName}.log`,
  );

  // 3. Prepare Prompt
  const scaffySkill = path.join(config.projectRoot, "agents/scaffy/Scaffy.md");
  const taskPrompt = `
    SCAFFOLDING REQUEST:
    
    1. APP NAME: ${appName}
    2. TARGET DIRECTORY: ${targetDir}
    3. DATABASE TYPE: ${dbType}
    4. THEME STRATEGY: ${themeMode}
    ${themePrompt ? `5. THEME DESCRIPTION: "${themePrompt}"` : ""}

    SOURCE PROJECT ROOT: ${config.projectRoot}

    Instructions:
    - You are reading the source project (Vaisu) at ${config.projectRoot}.
    - You are creating the NEW project at ${targetDir}.
    - Follow the workflow defined in your skill.
    - If ${dbType} is 'postgres', ensure Drizzle ORM is set up correctly.
    - Ensure 'Mobile' frontend is initialized.
  `;

  // 4. Run Agent
  try {
    await runAgent(
      "Scaffy",
      scaffySkill,
      taskPrompt,
      logger,
      config.projectRoot,
      SCAFFY_MODEL,
      logFile,
    );
    console.log(`\n✅ Scaffolding complete! Check ${targetDir}`);
    console.log(`📜 Log saved to: ${logFile}`);
  } catch (error: any) {
    console.error(`\n❌ Scaffolding failed: ${error.message}`);
    process.exit(1);
  }
}

main();
