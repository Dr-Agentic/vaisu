import fs from "fs";
import path from "path";
import { loadConfig } from "../agents/modules/config.js";
import { generateFeatureSlug } from "../agents/modules/llm.js";
import { Logger } from "../agents/modules/logger.js";
import { runAgent } from "../agents/modules/agentRunner.js";

async function findLatestFile(
  dir: string,
  pattern: RegExp,
): Promise<string | null> {
  if (!fs.existsSync(dir)) return null;

  const files = fs
    .readdirSync(dir)
    .filter((f) => pattern.test(f))
    .map((f) => path.join(dir, f))
    .sort(
      (a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime(),
    );

  return files.length > 0 ? files[0] : null;
}

async function main() {
  const promptFilePath = process.argv[2];

  if (!promptFilePath) {
    console.error(
      "Usage: npx tsx scripts/orchestrate.ts <path-to-prompt-file>",
    );
    process.exit(1);
  }

  const config = loadConfig();
  const rawPrompt = fs.readFileSync(promptFilePath, "utf-8");

  // 1. Identify Feature
  console.log("🔮 Analyzing request to determine feature slug...");
  const slug = await generateFeatureSlug(rawPrompt, config);
  console.log(`Cb Identifier: ${slug}`);

  // 2. Setup Workspace
  const featureDir = path.join(config.projectRoot, ".context/prd", slug);
  if (!fs.existsSync(featureDir)) {
    fs.mkdirSync(featureDir, { recursive: true });
  }

  // 3. Initialize Logger
  const logger = new Logger(featureDir);
  logger.log(`🚀 Starting Orchestration for feature: ${slug}`);
  logger.log(`📂 Context Directory: ${featureDir}`);

  try {
    // --- Step 1: Maestro ---
    // Reads user prompt, generates Super-Prompt
    const maestroSkill = path.join(
      config.projectRoot,
      "agents/maestro/Maestro.md",
    );
    const maestroPrompt = `
      The user has submitted a new request.
      Analyze the request and generate the initial JSON prompt file.
      
      USER REQUEST:
      "${rawPrompt}"
      
      FEATURE SLUG: ${slug}
      OUTPUT DIRECTORY: .context/prd/${slug}
    `;

    await runAgent("Maestro", maestroSkill, maestroPrompt, logger);

    const maestroFile = await findLatestFile(
      featureDir,
      /maestro-prompt.*\.json$/,
    );
    if (!maestroFile)
      throw new Error("Maestro failed to generate output file.");
    logger.success(`Maestro output found: ${path.basename(maestroFile)}`);

    // --- Step 2: Rearchy ---
    // Reads Maestro prompt, generates Requirements
    const rearchySkill = path.join(
      config.projectRoot,
      "agents/rearchy/Rearchy.md",
    );
    const rearchyPrompt = `
      Take the Maestro prompt file and decompose it into requirements.
      
      INPUT FILE: ${maestroFile}
    `;

    await runAgent("Rearchy", rearchySkill, rearchyPrompt, logger);

    const rearchyFile = await findLatestFile(
      featureDir,
      /rearchy-reqs.*\.json$/,
    );
    if (!rearchyFile)
      throw new Error("Rearchy failed to generate output file.");
    logger.success(`Rearchy output found: ${path.basename(rearchyFile)}`);

    // --- Step 3: Daisy ---
    // Reads Requirements, generates Design & Test Plan
    const daisySkill = path.join(config.projectRoot, "agents/daisy/Daisy.md");
    const daisyPrompt = `
      Take the Requirements file and create a technical design and test plan.
      
      INPUT FILE: ${rearchyFile}
    `;

    await runAgent("Daisy", daisySkill, daisyPrompt, logger);

    const daisyFile = await findLatestFile(featureDir, /daisy-design.*\.json$/);
    if (!daisyFile) throw new Error("Daisy failed to generate output file.");
    logger.success(`Daisy output found: ${path.basename(daisyFile)}`);

    // --- Step 4: Tasky ---
    // Reads Design, generates Tasks
    const taskySkill = path.join(config.projectRoot, "agents/tasky/Tasky.md");
    const taskyPrompt = `
      Take the Design file and break it down into atomic development tasks.
      
      INPUT FILE: ${daisyFile}
    `;

    await runAgent("Tasky", taskySkill, taskyPrompt, logger);

    const taskyFile = await findLatestFile(featureDir, /tasky-tasks.*\.json$/);
    if (!taskyFile) throw new Error("Tasky failed to generate output file.");
    logger.success(`Tasky output found: ${path.basename(taskyFile)}`);

    // --- Step 5: Devy ---
    // Reads Tasks, Executes Code
    const devySkill = path.join(config.projectRoot, "agents/devy/Devy.md");
    const devyPrompt = `
      Take the Task Execution Plan and start implementing the feature.
      Execute the tasks sequentially.
      
      INPUT FILE: ${taskyFile}
    `;

    await runAgent("Devy", devySkill, devyPrompt, logger);

    const devyFile = await findLatestFile(featureDir, /devy-report.*\.json$/);
    if (!devyFile) {
      logger.error(
        "Devy finished but no final report was found. Check the logs.",
      );
      // We don't throw here, as Devy might have partially succeeded.
    } else {
      logger.success(`Devy output found: ${path.basename(devyFile)}`);
    }

    logger.success("🏁 Orchestration Complete!");
  } catch (error: any) {
    logger.error(`Orchestration failed: ${error.message}`);
    process.exit(1);
  }
}

main();
