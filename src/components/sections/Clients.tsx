import Image from 'next/image';
import { Counter } from '@/components/fx/Counter';
import { SectionTitle, type MoreLink } from '@/components/ui/SectionTitle';
import { CLIENTS, type Client } from '@/content/clients';
import { cx } from '@/lib/cx';
import styles from './Clients.module.css';

const HALF = Math.ceil(CLIENTS.length / 2);
const ROWS = [CLIENTS.slice(0, HALF), CLIENTS.slice(HALF)];

/* Two copies back to back slide by half their width, so the loop has no seam. */
function Row({ clients, reverse }: { clients: readonly Client[]; reverse?: boolean }) {
  return (
    <div className={styles.row}>
      <div className={cx(styles.track, reverse && styles.reverse)}>
        {[0, 1].map((copy) => (
          <ul key={copy} className={styles.list} aria-hidden={copy > 0 ? true : undefined}>
            {clients.map((client) => (
              <li key={client.name} className={styles.tile}>
                <Image
                  src={client.logo}
                  alt={copy === 0 ? client.name : ''}
                  sizes="160px"
                  className={styles.logo}
                  style={{ scale: client.scale }}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function Clients({ more }: { more?: MoreLink }) {
  return (
    <section className={styles.clients} id="clientele" aria-labelledby="clientele-title">
      <div className="container">
        <div className={styles.head}>
          <SectionTitle eyebrow="Clientele" title="Brands that began with us" titleId="clientele-title" accent={['began']} more={more} />
          <p className={styles.count}>
            <Counter className={`${styles.countNum} fx-metal`} value={String(CLIENTS.length)} suffix="+" />
            <span>brands, from founders&apos; first launches to city institutions</span>
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
