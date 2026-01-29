import { spawn } from 'child_process';
import fs from 'fs';

import { Logger } from './logger.js';

export async function runAgent(
  agentName: string,
  skillPath: string,
  taskPrompt: string,
  logger: Logger,
  projectRoot: string,
  model?: string,
): Promise<void> {
  if (!fs.existsSync(skillPath)) {
    throw new Error(`Skill definition not found at: ${skillPath}`);
  }

  const skillContent = fs.readFileSync(skillPath, 'utf-8');

  const fullPrompt = `
SYSTEM INSTRUCTION: 
1. Adopt the following persona and execute the task.
2. You are running in a HEADLESS automation environment. 
3. DO NOT ask for user confirmation. DO NOT ask clarifying questions.
4. Make the best technical decision you can and PROCEED.
5. If you are writing code or files, do it immediately.
6. CRITICAL: When using file tools (Read, Write, Edit, Glob), ALWAYS use ABSOLUTE PATHS.
   The project root is: ${projectRoot}
   Example: If you want to read 'backend/package.json', use '${projectRoot}/backend/package.json'.

${skillContent}

---
CURRENT INPUT / TRIGGER:
${taskPrompt}
  `.trim();

  logger.log(`🤖 Awakening Agent: ${agentName}`);

  const args = ['run'];
  if (model) {
    args.push('--model', model);
  }
  args.push(fullPrompt);

  return new Promise((resolve, reject) => {
    // stdio: ['ignore', 'inherit', 'inherit'] closes stdin
    const cp = spawn('opencode', args, {
      stdio: ['ignore', 'inherit', 'inherit'],
      shell: false,
      cwd: projectRoot,
    });

    cp.on('close', (code) => {
      if (code === 0) {
        logger.success(`${agentName} completed its session.`);
        resolve();
      } else {
        logger.error(`${agentName} exited with code ${code}.`);
        reject(new Error(`${agentName} failed with exit code ${code}`));
      }
    });

    cp.on('error', (err) => {
      logger.error(`Failed to spawn opencode for ${agentName}: ${err.message}`);
      reject(err);
    });
  });
}
