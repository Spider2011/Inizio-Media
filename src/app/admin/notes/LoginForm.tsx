'use client';

import { useActionState } from 'react';
import { login, type LoginState } from './actions';
import styles from './admin.module.css';

const INITIAL: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, INITIAL);

  return (
    <form action={action} className={styles.login}>
      <label htmlFor="admin-password" className={styles.label}>
        Password
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className={styles.input}
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? 'admin-password-error' : undefined}
      />
      {state.error && (
        <p id="admin-password-error" className={styles.error} role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className={styles.primary} disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
