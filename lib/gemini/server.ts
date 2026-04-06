const PREFERRED_MODEL_ORDER = [
  "models/gemini-2.5-flash",
  "models/gemini-2.0-flash",
  "models/gemini-2.0-flash-lite",
  "models/gemini-1.5-flash-latest",
  "models/gemini-1.5-flash",
];

type GoogleModel = {
  name: string;
  supportedGenerationMethods?: string[];
};

export async function listGenerateContentModels(
  apiKey: string
): Promise<string[]> {
  const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(modelsUrl, { method: "GET" });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(
      `Failed to list Gemini models (${response.status}): ${details || response.statusText}`
    );
  }

  const data = (await response.json()) as { models?: GoogleModel[] };
  const models = data.models ?? [];

  return models
    .filter((model) =>
      model.supportedGenerationMethods?.includes("generateContent")
    )
    .map((model) => model.name);
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
  const modelName = pickGeminiModelName(availableModels);

  if (!modelName) {
    throw new Error(
      "No Gemini model with generateContent is available for this API key"
    );
  }

  const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
  const generateResponse = await fetch(generateUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
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
