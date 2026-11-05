/* Lets a page keep the site header tucked away during its own entrance (the Our Work wheel brings the
   header in about a second into its reveal). Holds are counted, so overlapping holders are safe. */

let holds = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** Hide the header until the returned release function is called (calling it twice is harmless). */
export function holdHeader(): () => void {
  holds += 1;
  emit();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds -= 1;
    emit();
  };
}

export function isHeaderHeld(): boolean {
  return holds > 0;
}

export function subscribeHeaderHold(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
