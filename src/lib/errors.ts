/**
 * Supabase throws plain objects shaped like { message, details, hint, code }
 * rather than real Error instances, so `err instanceof Error` is false and
 * `String(err)` falls back to the useless "[object Object]". Pull the real
 * message out wherever it lives.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message
  }
  return String(err)
}
