import styles from './RollText.module.css';

/* Text that rolls up to a copy of itself on hover of the nearest link or button. */
export function RollText({ text }: { text: string }) {
  return (
    <span className={styles.roll}>
      <span className={styles.inner}>
        <span>{text}</span>
        <span className={styles.clone} aria-hidden="true">
          {text}
        </span>
      </span>
    </span>
  );
}
