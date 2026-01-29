import fs from 'fs';
import path from 'path';

import { runAgent } from '../agents/modules/agentRunner.js';
import { loadConfig } from '../agents/modules/config.js';
import { generateFeatureSlug } from '../agents/modules/llm.js';
import { Logger } from '../agents/modules/logger.js';

const LLM_MODELS = {
  GLM: 'z-ai/glm-4.5-air:free',
  // Add other models here
};

const SELECTED_MODEL = LLM_MODELS.GLM;

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
      'Usage: npx tsx scripts/orchestrate.ts <path-to-prompt-file> [optional-slug]',
    );
    process.exit(1);
  }

  const config = loadConfig();
  const rawPrompt = fs.readFileSync(promptFilePath, 'utf-8');

  // 1. Identify Feature
  let slug = process.argv[3];
  if (!slug) {
    console.log('🔮 Analyzing request to determine feature slug...');
    slug = await generateFeatureSlug(rawPrompt, config, SELECTED_MODEL);
  }
  console.log(`Cb Identifier: ${slug}`);

  // 2. Setup Workspace
  const featureDir = path.join(config.projectRoot, '.context/prd', slug);
  if (!fs.existsSync(featureDir)) {
    fs.mkdirSync(featureDir, { recursive: true });
  }

  // 3. Initialize Logger
  const logger = new Logger(featureDir);
  logger.log(`🚀 Starting Orchestration for feature: ${slug}`);
  logger.log(`📂 Context Directory: ${featureDir}`);

  try {
    // --- Step 1: Maestro ---
    let maestroFile = await findLatestFile(
      featureDir,
      /maestro-prompt.*\.json$/,
    );

    if (maestroFile) {
      logger.success(
        `Skipping Maestro (Output exists: ${path.basename(maestroFile)})`,
      );
    } else {
      const maestroSkill = path.join(
        config.projectRoot,
        'agents/maestro/Maestro.md',
      );
      const maestroPrompt = `
        The user has submitted a new request.
        Analyze the request and generate the initial JSON prompt file.
        
        USER REQUEST:
        "${rawPrompt}"
        
        FEATURE SLUG: ${slug}
        OUTPUT DIRECTORY: ${featureDir}
      `;
      await runAgent(
        'Maestro',
        maestroSkill,
        maestroPrompt,
        logger,
        config.projectRoot,
        SELECTED_MODEL,
      );

      maestroFile = await findLatestFile(featureDir, /maestro-prompt.*\.json$/);
      if (!maestroFile) throw new Error('Maestro failed to generate output file.');
      logger.success(`Maestro output found: ${path.basename(maestroFile)}`);
    }

    // --- Step 2: Rearchy ---
    let rearchyFile = await findLatestFile(featureDir, /rearchy-reqs.*\.json$/);

    if (rearchyFile) {
      logger.success(
        `Skipping Rearchy (Output exists: ${path.basename(rearchyFile)})`,
      );
    } else {
      const rearchySkill = path.join(
        config.projectRoot,
        'agents/rearchy/Rearchy.md',
      );
      const rearchyPrompt = `
        Take the Maestro prompt file and decompose it into requirements.
        
        INPUT FILE: ${maestroFile}
        OUTPUT DIRECTORY: ${featureDir}
      `;
      await runAgent(
        'Rearchy',
        rearchySkill,
        rearchyPrompt,
        logger,
        config.projectRoot,
        SELECTED_MODEL,
      );

      rearchyFile = await findLatestFile(featureDir, /rearchy-reqs.*\.json$/);
      if (!rearchyFile) throw new Error('Rearchy failed to generate output file.');
      logger.success(`Rearchy output found: ${path.basename(rearchyFile)}`);
    }

    // --- Step 3: Daisy ---
    let daisyFile = await findLatestFile(featureDir, /daisy-design.*\.json$/);

    if (daisyFile) {
      logger.success(
        `Skipping Daisy (Output exists: ${path.basename(daisyFile)})`,
      );
    } else {
      const daisySkill = path.join(config.projectRoot, 'agents/daisy/Daisy.md');
      const daisyPrompt = `
        Take the Requirements file and create a technical design and test plan.
        
        INPUT FILE: ${rearchyFile}
        OUTPUT DIRECTORY: ${featureDir}
      `;
      await runAgent(
        'Daisy',
        daisySkill,
        daisyPrompt,
        logger,
        config.projectRoot,
        SELECTED_MODEL,
      );

      daisyFile = await findLatestFile(featureDir, /daisy-design.*\.json$/);
      if (!daisyFile) throw new Error('Daisy failed to generate output file.');
      logger.success(`Daisy output found: ${path.basename(daisyFile)}`);
    }

    // --- Step 4: Tasky ---
    let taskyFile = await findLatestFile(featureDir, /tasky-tasks.*\.json$/);

    if (taskyFile) {
      logger.success(
        `Skipping Tasky (Output exists: ${path.basename(taskyFile)})`,
      );
    } else {
      const taskySkill = path.join(config.projectRoot, 'agents/tasky/Tasky.md');
      const taskyPrompt = `
        Take the Design file and break it down into atomic development tasks.
        
        INPUT FILE: ${daisyFile}
        OUTPUT DIRECTORY: ${featureDir}
      `;
      await runAgent(
        'Tasky',
        taskySkill,
        taskyPrompt,
        logger,
        config.projectRoot,
        SELECTED_MODEL,
      );

      taskyFile = await findLatestFile(featureDir, /tasky-tasks.*\.json$/);
      if (!taskyFile) throw new Error('Tasky failed to generate output file.');
      logger.success(`Tasky output found: ${path.basename(taskyFile)}`);
    }

    // --- Step 5: Devy ---
    // Devy loops until all tasks are COMPLETED.
    // Each runAgent call handles exactly one task (per updated Devy.md).
    let devyFile = await findLatestFile(featureDir, /devy-report.*\.json$/);

    if (devyFile) {
      logger.success(
        `Skipping Devy (Output exists: ${path.basename(devyFile)})`,
      );
    } else {
      const devySkill = path.join(config.projectRoot, 'agents/devy/Devy.md');
      const devyPrompt = `
        Take the Task Execution Plan and start implementing the feature.
        Execute the next PENDING task.
        
        INPUT FILE: ${taskyFile}
        OUTPUT DIRECTORY: ${featureDir}
      `;

      let hasPendingTasks = true;
      let taskLoopCount = 0;
      const MAX_TASKS = 50; // Safety brake

      // Read the tasky file to check for pending tasks
      // Helper function to check status
      const checkPending = () => {
        try {
          if (!fs.existsSync(taskyFile!)) return false;
          const content = JSON.parse(fs.readFileSync(taskyFile!, 'utf-8'));
          return content.execution_plan.some(
            (t: any) => t.status === 'PENDING',
          );
        } catch (e) {
          logger.error(`Failed to parse tasky file: ${e}`);
          return false;
        }
      };

      while (hasPendingTasks && taskLoopCount < MAX_TASKS) {
        hasPendingTasks = checkPending();
        if (!hasPendingTasks) break;

        taskLoopCount++;
        logger.log(`🔄 Devy Loop #${taskLoopCount}: Starting next task...`);

        // We run Devy. It will exit after one task.
        await runAgent(
          'Devy',
          devySkill,
          devyPrompt,
          logger,
          config.projectRoot,
          SELECTED_MODEL,
        );

        // Re-check status
        hasPendingTasks = checkPending();
      }

      // After all tasks are done, Devy (or we) should generate the report.
      // Currently Devy prompt says "Reporting Phase: Once all tasks are COMPLETED...".
      // We might need one final run to generate the report if the last task didn't do it?
      // Or simply check if report exists.

      // Let's run one final time to let Devy see "All Completed" and generate the report.
      if (!hasPendingTasks) {
        logger.log('✅ All tasks completed. Generating final report...');
        await runAgent(
          'Devy',
          devySkill,
          devyPrompt,
          logger,
          config.projectRoot,
          SELECTED_MODEL,
        );
      }

      devyFile = await findLatestFile(featureDir, /devy-report.*\.json$/);
      if (!devyFile) {
        logger.error('Devy finished but no final report was found.');
      } else {
        logger.success(`Devy output found: ${path.basename(devyFile)}`);
      }
    }

    logger.success('🏁 Orchestration Complete!');
  } catch (error: any) {
    logger.error(`Orchestration failed: ${error.message}`);
    process.exit(1);
  }
}

main();
