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
  logFile?: string,
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
    // Determine stdio mode
    // If logFile is provided, we pipe stdout/stderr to capture them.
    // Otherwise, we inherit to show in console (default behavior).
    const stdioMode = logFile ? 'pipe' : 'inherit';

    const cp = spawn('opencode', args, {
      stdio: ['ignore', stdioMode, stdioMode],
      shell: false,
      cwd: projectRoot,
    });

    if (logFile && cp.stdout && cp.stderr) {
      // Create write stream
      // Ensure dir exists
      const logDir = logFile.substring(0, logFile.lastIndexOf('/'));
      if (logDir && !fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const fileStream = fs.createWriteStream(logFile, { flags: 'a' });

      // Pipe stdout to console AND file
      cp.stdout.on('data', (data) => {
        process.stdout.write(data);
        fileStream.write(data);
      });

      // Pipe stderr to console AND file
      cp.stderr.on('data', (data) => {
        process.stderr.write(data);
        fileStream.write(data);
      });

      cp.on('close', () => {
        fileStream.end();
      });
    }

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
