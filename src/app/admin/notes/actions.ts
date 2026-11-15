'use server';

/* Admin actions for the beginnings wall. Every action checks the session itself: a server action
   is a public endpoint, whatever page renders its form. */
import { revalidatePath, updateTag } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { clientKey } from '@/lib/client-key';
import { createRateLimiter } from '@/lib/rate-limit';
import {
  ADMIN_COOKIE,
  createSessionToken,
  isValidSession,
  passwordMatches,
  readAdminPassword,
  SESSION_SECONDS
} from '@/lib/notes/admin-auth';
import { getNotesStore } from '@/lib/notes/store';
import { WALL_TAG } from '@/lib/notes/wall-data';

const ADMIN_PATH = '/admin/notes';
const LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_SECONDS = 15 * 60;
/* Used only when no database is connected, so sign-in attempts are still damped. */
const fallbackLimiter = createRateLimiter({ limit: LOGIN_ATTEMPTS, windowMs: LOGIN_WINDOW_SECONDS * 1000 });

export type LoginState = { error: string | null };

async function loginAllowed(): Promise<boolean> {
  const ip = clientKey(await headers());
  const store = getNotesStore();
  if (!store) return fallbackLimiter.check(ip).allowed;
  try {
    return (await store.hit(`login:${ip}`, LOGIN_ATTEMPTS, LOGIN_WINDOW_SECONDS)).allowed;
  } catch {
    // Fail closed: if the counter cannot be read, nobody gets unlimited guesses (only the admin is affected).
    return false;
  }
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const password = readAdminPassword(process.env);
  if (!password) return { error: 'This page is not set up yet.' };
  if (!(await loginAllowed())) return { error: 'Too many tries. Please wait 15 minutes and try again.' };

  const attempt = formData.get('password');
  if (typeof attempt !== 'string' || !passwordMatches(attempt, password)) {
    return { error: 'That password is not right.' };
  }

  (await cookies()).set(ADMIN_COOKIE, createSessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: SESSION_SECONDS
  });
  redirect(ADMIN_PATH);
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: '/admin' });
  redirect(ADMIN_PATH);
}

async function requireAdmin(): Promise<void> {
  const password = readAdminPassword(process.env);
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!password || !isValidSession(token, password)) redirect(ADMIN_PATH);
}

function noteId(formData: FormData): string | null {
  const id = formData.get('id');
  return typeof id === 'string' && /^[\w-]{1,64}$/.test(id) ? id : null;
}

async function changeNote(formData: FormData, change: 'approve' | 'remove'): Promise<void> {
  await requireAdmin();
  const id = noteId(formData);
  const store = getNotesStore();
  if (!id || !store) return;

  await (change === 'approve' ? store.approve(id) : store.remove(id));
  updateTag(WALL_TAG);
  revalidatePath('/clientele');
  revalidatePath(ADMIN_PATH);
}

export async function approveNote(formData: FormData): Promise<void> {
  await changeNote(formData, 'approve');
}

export async function deleteNote(formData: FormData): Promise<void> {
  await changeNote(formData, 'remove');
}
