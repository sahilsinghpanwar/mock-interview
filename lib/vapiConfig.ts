import { getEnv } from "./env";

export function getVapiPublicKey(): string | undefined {
  return getEnv("NEXT_PUBLIC_VAPI_WEB_TOKEN") || undefined;
}

export function getVapiAssistantId(): string | undefined {
  return getEnv("NEXT_PUBLIC_VAPI_ASSISTANT_ID") || undefined;
}

export function isVapiConfigured(): boolean {
  return Boolean(getVapiPublicKey() && getVapiAssistantId());
}
