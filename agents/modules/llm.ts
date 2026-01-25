import { Config } from "./config.js";

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
          "HTTP-Referer": "https://vaisu.dev", // Required by OpenRouter
          "X-Title": "Vaisu Agent Orchestrator",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-lite-preview-02-05:free", // Using a fast, cheap model
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

    // Clean up slug to ensure it's safe for filenames
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  } catch (error) {
    console.error("Failed to generate feature slug:", error);
    // Fallback
    return `feature-${Date.now()}`;
  }
}
