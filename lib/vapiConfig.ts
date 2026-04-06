/**
 * Vapi public key is safe to expose in the browser (same as Vapi dashboard “Public API Key”).
 * Assistant ID comes from Vapi → Assistants → copy ID.
 */
export function getVapiPublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
}

export function getVapiAssistantId(): string | undefined {
  return process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
}

export function isVapiConfigured(): boolean {
  return Boolean(getVapiPublicKey() && getVapiAssistantId());
}
