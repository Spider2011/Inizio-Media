import Image from 'next/image';
import { Counter } from '@/components/fx/Counter';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { CLIENTS, instagramUrl, type Client } from '@/content/clients';
import { cx } from '@/lib/cx';
import styles from './Clients.module.css';

const HALF = Math.ceil(CLIENTS.length / 2);
const ROWS = [CLIENTS.slice(0, HALF), CLIENTS.slice(HALF)];

/* Sized by its own attributes, so it can never balloon even if the stylesheet arrives late. */
function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" className={styles.glyph}>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </svg>
  );
}

/* One logo. With an Instagram handle it opens the client's profile in a new tab; the second
   (decorative) copy of each row is kept out of the tab order and away from screen readers. */
function Tile({ client, decorative }: { client: Client; decorative: boolean }) {
  const logo = (
    <Image
      src={client.logo}
      alt={decorative ? '' : client.name}
      sizes="160px"
      className={styles.logo}
      style={{ scale: client.scale }}
    />
  );
  if (!client.instagram) return <li className={styles.tile}>{logo}</li>;
  return (
    <li className={styles.tile}>
      <a
        className={styles.link}
        href={instagramUrl(client.instagram)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={decorative ? undefined : `${client.name} on Instagram (opens in a new tab)`}
        tabIndex={decorative ? -1 : undefined}
        data-cursor="Instagram"
      >
        {logo}
        <span className={styles.badge} aria-hidden="true" hidden>
          <InstagramGlyph />
        </span>
      </a>
    </li>
  );
}

/* Two copies back to back slide by half their width, so the loop has no seam. */
function Row({ clients, reverse }: { clients: readonly Client[]; reverse?: boolean }) {
  return (
    <div className={styles.row}>
      <div className={cx(styles.track, reverse && styles.reverse)}>
        {[0, 1].map((copy) => (
          <ul key={copy} className={styles.list} aria-hidden={copy > 0 ? true : undefined}>
            {clients.map((client) => (
              <Tile key={client.name} client={client} decorative={copy > 0} />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function Clients() {
  return (
    <section className={styles.clients} id="clientele" aria-labelledby="clientele-title">
      <div className="container">
        <div className={styles.head}>
          <SectionTitle eyebrow="Clientele" title="Brands that began with us" titleId="clientele-title" accent={['began']} />
          <p className={styles.count}>
            <Counter className={`${styles.countNum} fx-metal`} value={String(CLIENTS.length)} suffix="+" />
            <span>brands, from founders&apos; first launches to city institutions. Tap a logo to visit them on Instagram.</span>
          </p>
        </div>
      </div>
      <div className={styles.rows}>
        {ROWS.map((clients, i) => (
          <Row key={i} clients={clients} reverse={i === 1} />
        ))}
      </div>
    </section>
  );
}
