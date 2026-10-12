import Image from 'next/image';
import markBlue from '@/assets/logos/inizio-im-mark-blue.svg';
import { Parallax } from '@/components/fx/Parallax';
import { RotatingBadge } from '@/components/fx/RotatingBadge';
import { ScrollWords } from '@/components/fx/ScrollWords';
import { SectionTitle, type MoreLink } from '@/components/ui/SectionTitle';
import { SITE } from '@/content/site';
import styles from './About.module.css';

const CHIP_DISTANCES = [-220, -90, -300, -140, -60, -260];

export function About({ more }: { more?: MoreLink }) {
  return (
    <section className={styles.about} id="about" aria-labelledby="about-title">
      <div className="container">
        <SectionTitle eyebrow="About us" title="Every brand needs a beginning." titleId="about-title" accent={['beginning.']} more={more} />

        <div className={styles.grid}>
          <div className={styles.visual}>
            <Parallax distance={-160}>
              <div className={styles.markWrap}>
                <RotatingBadge text="Inizio means beginning • Inizio means beginning • " className={styles.badge}>
                  <Image src={markBlue} alt="" width={150} height={77} unoptimized />
                </RotatingBadge>
              </div>
            </Parallax>
            <div className={styles.chips} aria-hidden="true">
              {SITE.keywords.map((word, i) => (
                <Parallax key={word} distance={CHIP_DISTANCES[i]} className={styles[`chip${i}`]}>
                  <span className={styles.chip}>{word}</span>
                </Parallax>
              ))}
            </div>
          </div>

          <div className={styles.copy}>
            <ScrollWords
              className={styles.statement}
              text="Inizio means “beginning”. For more than eight years we have been the first chapter for founders, families and businesses across Mumbai."
            />
            <p className={styles.body}>
              We are a digital marketing and branding agency that works end to end: we find the story, shape the identity, make the
              content and run the campaigns, then measure what worked. Over 100 projects and 50+ brand builds and events later, the
              brief is still the same: give every brand a confident new start online.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
