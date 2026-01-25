import { Config } from "./config.js";
import { LLM_MODEL } from "./constants.js";

export async function generateFeatureSlug(
  prompt: string,
  config: Config,
): Promise<string> {
  const systemPrompt = `You are a naming assistant. Read the user's software feature request and generate a short, hyphenated slug (max 4-5 words) that describes the feature (e.g., "add-billing-system", "fix-login-bug"). 
  Return ONLY the slug. No explanation.`;

  try {
    const response = await fetch(
      `${config.openRouterBaseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vaisu.dev",
          "X-Title": "Vaisu Agent Orchestrator",
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API failed: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    const slug = data.choices[0]?.message?.content?.trim();

    if (!slug) {
      throw new Error("LLM returned empty slug");
    }

    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  } catch (error) {
    console.error("Failed to generate feature slug:", error);
    return `feature-${Date.now()}`;
  }
}
