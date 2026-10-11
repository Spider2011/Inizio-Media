/* One response envelope for every API route: { success, data, error } plus optional detail. */
import type { FieldErrors } from './enquiry';

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
  code?: string;
  fieldErrors?: FieldErrors;
};

export function ok<T>(data: T | null = null, init?: ResponseInit): Response {
  return Response.json({ success: true, data, error: null } satisfies ApiResponse<T>, init);
}

export function fail(
  status: number,
  error: string,
  extra: Pick<ApiResponse<never>, 'code' | 'fieldErrors'> = {},
  headers?: HeadersInit
): Response {
  return Response.json({ success: false, data: null, error, ...extra } satisfies ApiResponse<never>, { status, headers });
}
