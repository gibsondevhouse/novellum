// AI module public types.
// NovaContext* and NovaSession* contracts live in $lib/ai/nova-context-types so
// that server-side code in $lib/server/nova/ can import them without crossing
// the lib → modules boundary.

export type AISessionId = number;

export * from '$lib/ai/nova-context-types.js';
