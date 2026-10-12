import type { ReactNode } from 'react';
import { PageTransition } from '@/components/fx/PageTransition';

/* Re-mounts on every navigation, so each page arrives with the transition curtain. */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
