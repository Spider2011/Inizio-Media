import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { ADMIN_COOKIE, isValidSession, MIN_PASSWORD_LENGTH, readAdminPassword } from '@/lib/notes/admin-auth';
import { formatNoteDate } from '@/lib/notes/format';
import { PAPER_LABELS, type Note } from '@/lib/notes/note';
import { getNotesStore } from '@/lib/notes/store';
import { approveNote, deleteNote, logout } from './actions';
import { ConfirmButton } from './ConfirmButton';
import { LoginForm } from './LoginForm';
import styles from './admin.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Wall notes',
  robots: { index: false, follow: false }
};

function Shell({ children, signedIn = false }: { children: ReactNode; signedIn?: boolean }) {
  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>
        <header className={styles.head}>
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className={styles.title}>The beginnings wall</h1>
          </div>
          {signedIn && (
            <form action={logout}>
              <button type="submit" className={styles.ghost}>
                Sign out
              </button>
            </form>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}

function NoteRow({ note }: { note: Note }) {
  return (
    <li className={styles.row}>
      <blockquote className={styles.quote}>
        <p>{note.text}</p>
        <footer>
          <strong>{note.name}</strong> · {formatNoteDate(note.createdAt)} · {PAPER_LABELS[note.paper]}
        </footer>
      </blockquote>
      <div className={styles.actions}>
        {!note.approved && (
          <form action={approveNote}>
            <input type="hidden" name="id" value={note.id} />
            <button type="submit" className={styles.primary}>
              Approve
            </button>
          </form>
        )}
        <form action={deleteNote}>
          <input type="hidden" name="id" value={note.id} />
          <ConfirmButton message={`Delete the note from ${note.name}? This cannot be undone.`} className={styles.danger}>
            Delete
          </ConfirmButton>
        </form>
      </div>
    </li>
  );
}

function NoteList({ title, notes, empty }: { title: string; notes: Note[]; empty: string }) {
  return (
    <section className={styles.section} aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`} className={styles.sectionTitle}>
        {title} <span className={styles.count}>{notes.length}</span>
      </h2>
      {notes.length === 0 ? <p className={styles.muted}>{empty}</p> : <ul className={styles.list}>{notes.map((n) => <NoteRow key={n.id} note={n} />)}</ul>}
    </section>
  );
}

export default async function AdminNotesPage() {
  const password = readAdminPassword(process.env);
  if (!password) {
    return (
      <Shell>
        <p className={styles.muted}>
          Set <code>ADMIN_PASSWORD</code> (at least {MIN_PASSWORD_LENGTH} characters) in the site&apos;s environment variables to use this page.
        </p>
      </Shell>
    );
  }

  if (!isValidSession((await cookies()).get(ADMIN_COOKIE)?.value, password)) {
    return (
      <Shell>
        <p className={styles.muted}>Sign in to approve or delete notes.</p>
        <LoginForm />
      </Shell>
    );
  }

  const store = getNotesStore();
  if (!store) {
    return (
      <Shell signedIn>
        <p className={styles.muted}>No database is connected yet. Connect Upstash Redis to the project in Vercel, then redeploy.</p>
      </Shell>
    );
  }

  const [pending, approved] = await Promise.all([store.listPending(), store.listApproved()]);
  return (
    <Shell signedIn>
      <NoteList title="Waiting for approval" notes={pending} empty="No new notes. You will get an email when one is pinned." />
      <NoteList title="On the wall" notes={approved} empty="Nothing on the wall yet." />
    </Shell>
  );
}
