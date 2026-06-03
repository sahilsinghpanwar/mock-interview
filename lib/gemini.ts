import { GoogleGenerativeAI } from "@google/generative-ai";

import { getEnv } from "./env";

const genAI = new GoogleGenerativeAI(getEnv("GEMINI_API_KEY"));

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});