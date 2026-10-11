/* Renders with Motion's features loaded synchronously, as MotionProvider provides them in the app. */
import { render, type RenderOptions } from '@testing-library/react';
import { domMax, LazyMotion } from 'motion/react';
import type { ReactElement, ReactNode } from 'react';

function MotionFeatures({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}

export function renderWithMotion(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: MotionFeatures, ...options });
}
