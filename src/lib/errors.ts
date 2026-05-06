export type ErrorCode =
  | 'PREF_READ_FAILED'
  | 'PREF_WRITE_FAILED'
  | 'DB_QUERY_FAILED'
  | 'AI_KEY_MISSING'
  | 'AI_REQUEST_FAILED'
  | 'EXPORT_FAILED';

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  PREF_READ_FAILED: 'Failed to read preference. Your settings may not have loaded correctly.',
  PREF_WRITE_FAILED: 'Failed to save preference. Your settings may not have been saved.',
  DB_QUERY_FAILED: 'Database error. Please try again or restart the app.',
  AI_KEY_MISSING: 'No AI API key configured. Add your OpenRouter key in Settings → AI.',
  AI_REQUEST_FAILED: 'AI request failed. Check your API key and network connection.',
  EXPORT_FAILED: 'Export failed. Please try again or choose a different format.',
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly userMessage: string;

  constructor(code: ErrorCode, cause?: unknown) {
    const userMessage = ERROR_MESSAGES[code];
    super(userMessage);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    if (cause instanceof Error) {
      this.cause = cause;
    }
  }
}
