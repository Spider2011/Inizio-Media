import Image from 'next/image';
import { AutoScroller } from '@/components/fx/AutoScroller';
import { Counter } from '@/components/fx/Counter';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { CLIENTS, instagramUrl, type Client } from '@/content/clients';
import styles from './Clients.module.css';

/* Name-only tiles are spread through the logos (one after every few), never bunched at a row's end. */
function spread(logos: readonly Client[], names: readonly Client[]): Client[] {
  const step = names.length ? Math.max(1, Math.floor(logos.length / names.length)) : Infinity;
  const out: Client[] = [];
  let n = 0;
  logos.forEach((client, i) => {
    out.push(client);
    if (n < names.length && (i + 1) % step === 0) out.push(names[n++]);
  });
  return [...out, ...names.slice(n)];
}

const halves = <T,>(list: readonly T[]) => [list.slice(0, Math.ceil(list.length / 2)), list.slice(Math.ceil(list.length / 2))];
const [LOGOS, NAMES] = [CLIENTS.filter((c) => c.logo), CLIENTS.filter((c) => !c.logo)].map(halves);
const ROWS = [spread(LOGOS[0], NAMES[0]), spread(LOGOS[1], NAMES[1])];

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
  const logo = client.logo ? (
    <Image
      src={client.logo}
      alt={decorative ? '' : client.name}
      sizes="160px"
      className={styles.logo}
      style={{ scale: client.scale ?? 1 }}
    />
  ) : (
    <span className={styles.name} data-name="">
      {client.name}
    </span>
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

/* Two copies back to back, so the loop has no seam. The row drifts on its own and can also be
   dragged, swiped or scrolled sideways by hand. */
function Row({ clients, reverse }: { clients: readonly Client[]; reverse?: boolean }) {
  return (
    <AutoScroller className={styles.row} reverse={reverse} loopSeconds={55}>
      <div className={styles.track}>
        {[0, 1].map((copy) => (
          <ul key={copy} className={styles.list} aria-hidden={copy > 0 ? true : undefined}>
            {clients.map((client) => (
              <Tile key={client.name} client={client} decorative={copy > 0} />
            ))}
          </ul>
        ))}
      </div>
    </AutoScroller>
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
