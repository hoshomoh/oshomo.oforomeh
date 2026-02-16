/**
 * Sanitize text to prevent prompt injection attacks.
 * Removes common prompt injection patterns while preserving legitimate content.
 */
export function sanitizeForPrompt(text: string): string {
  return text
    .replace(/\[SYSTEM/gi, '[REDACTED')
    .replace(/\[INSTRUCTION/gi, '[REDACTED')
    .replace(/\[IGNORE/gi, '[REDACTED')
    .replace(/\[ASSISTANT/gi, '[REDACTED')
    .replace(/\[USER/gi, '[REDACTED')
    .slice(0, 500); // Truncate extremely long text
}
