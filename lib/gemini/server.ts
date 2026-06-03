

const PREFERRED_MODEL_ORDER = [
  "models/gemini-1.5-flash",
  "models/gemini-1.5-flash-latest",
  "models/gemini-2.5-flash",
  "models/gemini-2.0-flash-lite",
  "models/gemini-2.0-flash",
];

type GoogleModel = {
  name: string;
  supportedGenerationMethods?: string[];
};

let cachedModels: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export async function listGenerateContentModels(
  apiKey: string
): Promise<string[]> {
  const cleanKey = apiKey.replace(/^["']|["']$/g, "").trim();
  const now = Date.now();


  if (cachedModels && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedModels;
  }

  const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
  const response = await fetch(modelsUrl, { method: "GET" });

  if (!response.ok) {
    
    if (cachedModels) {
      console.warn("Failed to refresh model list, using stale cache");
      return cachedModels;
    }
    const details = await response.text().catch(() => "");
    throw new Error(
      `Failed to list Gemini models (${response.status}): ${details || response.statusText}`
    );
  }

  const data = (await response.json()) as { models?: GoogleModel[] };
  const models = data.models ?? [];

  cachedModels = models
    .filter((model) =>
      model.supportedGenerationMethods?.includes("generateContent")
    )
    .map((model) => model.name);

  cacheTimestamp = now;
  return cachedModels;
}

export function pickGeminiModelName(availableModels: string[]): string {
  const preferred = PREFERRED_MODEL_ORDER.find((candidate) =>
    availableModels.includes(candidate)
  );
  if (preferred) return preferred;
  return availableModels[0] ?? "";
}


export async function geminiGenerateText(
  apiKey: string,
  prompt: string
): Promise<string> {
  const availableModels = await listGenerateContentModels(apiKey);
  const modelsToTry = PREFERRED_MODEL_ORDER.filter((m) =>
    availableModels.includes(m)
  );

  if (modelsToTry.length === 0 && availableModels.length > 0) {
    modelsToTry.push(availableModels[0]);
  }

  if (modelsToTry.length === 0) {
    throw new Error(
      "No Gemini model with generateContent is available for this API key"
    );
  }

  let lastError: Error | null = null;

  
  for (const modelName of modelsToTry) {
  
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await callGeminiModel(apiKey, modelName, prompt);
        return result;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));

        
        if (lastError.message.includes("429")) {
          const retryMatch = lastError.message.match(/retry in (\d+)/i);
          const waitSeconds = retryMatch
            ? Math.min(parseInt(retryMatch[1], 10) + 2, 60)
            : 10 * Math.pow(2, attempt); // 10s, 20s, 40s

          console.warn(
            `Rate limited on ${modelName} (attempt ${attempt + 1}/3). ` +
            `Waiting ${waitSeconds}s before retry...`
          );

          await sleep(waitSeconds * 1000);
          continue;
        }

        throw lastError;
      }
    }

    console.warn(`All retries exhausted for ${modelName}, trying next model...`);
  }

  throw lastError ?? new Error("All Gemini models are rate-limited. Please wait a minute and try again.");
}

//  Helpers

async function callGeminiModel(
  apiKey: string,
  modelName: string,
  prompt: string
): Promise<string> {
  const cleanKey = apiKey.replace(/^["']|["']$/g, "").trim();
  const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${cleanKey}`;
  const generateResponse = await fetch(generateUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!generateResponse.ok) {
    const details = await generateResponse.text().catch(() => "");
    throw new Error(
      `Gemini generateContent failed on ${modelName} (${generateResponse.status}): ${
        details || generateResponse.statusText
      }`
    );
  }

  const generateData = (await generateResponse.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text =
    generateData.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? "";

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
