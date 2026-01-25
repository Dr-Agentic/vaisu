import { spawn } from "child_process";
import fs from "fs";
import { Logger } from "./logger.js";

export async function runAgent(
  agentName: string,
  skillPath: string,
  taskPrompt: string,
  logger: Logger,
): Promise<void> {
  if (!fs.existsSync(skillPath)) {
    throw new Error(`Skill definition not found at: ${skillPath}`);
  }

  const skillContent = fs.readFileSync(skillPath, "utf-8");

  // Construct a super-prompt that forces the persona
  // We escape double quotes to avoid breaking the CLI arg if we were using exec,
  // but spawn handles args safer.
  // However, the prompt might be very long.
  const fullPrompt = `
SYSTEM INSTRUCTION: Adopt the following persona and execute the task.
${skillContent}

---
CURRENT INPUT / TRIGGER:
${taskPrompt}
  `.trim();

  logger.log(`🤖 Awakening Agent: ${agentName}`);

  return new Promise((resolve, reject) => {
    // 'opencode run' accepts the message as arguments
    const cp = spawn("opencode", ["run", fullPrompt], {
      stdio: "inherit", // Important: lets the user interact with the agent if needed
      shell: false,
    });

    cp.on("close", (code) => {
      if (code === 0) {
        logger.success(`${agentName} completed its session.`);
        resolve();
      } else {
        logger.error(`${agentName} exited with code ${code}.`);
        reject(new Error(`${agentName} failed with exit code ${code}`));
      }
    });

    cp.on("error", (err) => {
      logger.error(`Failed to spawn opencode for ${agentName}: ${err.message}`);
      reject(err);
    });
  });
}
