import { describe, it, expect } from 'vitest';
import { AppError, type ErrorCode } from '$lib/errors';

describe('AppError', () => {
  it('is an instance of Error', () => {
    const err = new AppError('DB_QUERY_FAILED');
    expect(err).toBeInstanceOf(Error);
  });

  it('is an instance of AppError', () => {
    const err = new AppError('DB_QUERY_FAILED');
    expect(err).toBeInstanceOf(AppError);
  });

  it('sets name to AppError', () => {
    const err = new AppError('AI_KEY_MISSING');
    expect(err.name).toBe('AppError');
  });

  it('sets the code field correctly', () => {
    const err = new AppError('EXPORT_FAILED');
    expect(err.code).toBe('EXPORT_FAILED');
  });

  it.each<[ErrorCode, string]>([
    ['PREF_READ_FAILED', 'Failed to read preference. Your settings may not have loaded correctly.'],
    ['PREF_WRITE_FAILED', 'Failed to save preference. Your settings may not have been saved.'],
    ['DB_QUERY_FAILED', 'Database error. Please try again or restart the app.'],
    ['AI_KEY_MISSING', 'No AI API key configured. Add your OpenRouter key in Settings → AI.'],
    ['AI_REQUEST_FAILED', 'AI request failed. Check your API key and network connection.'],
    ['EXPORT_FAILED', 'Export failed. Please try again or choose a different format.'],
  ])('userMessage is correct for %s', (code, expectedMessage) => {
    const err = new AppError(code);
    expect(err.userMessage).toBe(expectedMessage);
    expect(err.message).toBe(expectedMessage);
  });

  it('sets cause when an Error is provided', () => {
    const cause = new Error('original error');
    const err = new AppError('AI_REQUEST_FAILED', cause);
    expect(err.cause).toBe(cause);
  });

  it('does not set cause when cause is not an Error', () => {
    const err = new AppError('AI_REQUEST_FAILED', 'string cause');
    expect(err.cause).toBeUndefined();
  });

  it('does not set cause when no cause provided', () => {
    const err = new AppError('PREF_READ_FAILED');
    expect(err.cause).toBeUndefined();
  });
});
