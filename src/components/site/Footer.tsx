import { Magnetic } from '@/components/fx/Magnetic';
import { SplitText } from '@/components/fx/SplitText';
import { Arrow } from '@/components/ui/Arrow';
import { NAV_LINKS, SITE } from '@/content/site';
import styles from './Footer.module.css';
import { LiveClock } from './LiveClock';
import { RollText } from './RollText';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <a className={styles.bigLink} href="#contact" data-cursor="Talk">
            <span className={styles.bigKicker}>Have an idea?</span>
            <SplitText as="span" className={`${styles.bigText} fx-depth`} text="Let's make it happen" by="words" />
            <Arrow direction="up-right" className={styles.bigArrow} />
          </a>
        </div>

        <div className={styles.cols}>
          <div>
            <p className={styles.head}>Explore</p>
            <ul className={styles.list}>
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`}>
                    <RollText text={link.label} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.head}>Say hello</p>
            <ul className={styles.list}>
              <li>
                <a href={`mailto:${SITE.email}`}>
                  <RollText text={SITE.email} />
                </a>
              </li>
              <li>
                <a href={SITE.phone.href}>
                  <RollText text={SITE.phone.display} />
                </a>
              </li>
              <li>
                <a href={SITE.instagram.url}>
                  <RollText text={`Instagram ${SITE.instagram.handle}`} />
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className={styles.head}>Studio</p>
            <p className={styles.studio}>
              {SITE.location}
              <br />
              <LiveClock className={styles.clock} />
            </p>
          </div>
          <div className={styles.backWrap}>
            <Magnetic>
              <a className={styles.back} href="#top" aria-label="Back to top">
                <Arrow direction="up" />
              </a>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        <SplitText as="span" text="INIZIO" by="chars" stagger={0.06} />
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>
          © {new Date().getFullYear()} {SITE.name} · {SITE.location}
        </span>
        <span>{SITE.keywords.join(' · ')}</span>
      </div>
    </footer>
  );
}
