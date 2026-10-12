import { Magnetic } from '@/components/fx/Magnetic';
import { RotatingBadge } from '@/components/fx/RotatingBadge';
import { SplitText } from '@/components/fx/SplitText';
import { RollText } from '@/components/site/RollText';
import { Arrow } from '@/components/ui/Arrow';
import { SITE } from '@/content/site';
import styles from './Contact.module.css';
import { EnquiryForm } from './EnquiryForm';

const DETAILS = [
  { label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
  { label: 'Phone', value: SITE.phone.display, href: SITE.phone.href },
  { label: 'Instagram', value: SITE.instagram.handle, href: SITE.instagram.url }
];

export function Contact() {
  return (
    <section className={styles.contact} id="contact" aria-labelledby="contact-title">
      <div className={styles.glow} aria-hidden="true" />
      <div className={`container ${styles.layout}`}>
        <div className={styles.side}>
          <p className="eyebrow" style={{ color: 'var(--butter)' }}>
            Ready to build?
          </p>
          <SplitText as="h2" id="contact-title" className={`${styles.title} fx-depth fx-hover`} text={"Let's\ncreate."} by="chars" stagger={0.04} classFor={{ 'create.': 'fx-neon' }} />

          <ul className={styles.details}>
            {DETAILS.map((detail) => (
              <li key={detail.label}>
                <a href={detail.href} className={styles.detail}>
                  <span className={styles.detailLabel}>{detail.label}</span>
                  <span className={styles.detailValue}>
                    <RollText text={detail.value} />
                  </span>
                  <Arrow direction="up-right" className={styles.detailArrow} />
                </a>
              </li>
            ))}
          </ul>

          <Magnetic strength={0.3}>
            <a className={styles.call} href={SITE.phone.href} aria-label={`Book a call: ${SITE.phone.display}`}>
              <RotatingBadge text="Book a call" className={styles.callBadge}>
                <span className={styles.callCore}>
                  <Arrow direction="up-right" />
                </span>
              </RotatingBadge>
            </a>
          </Magnetic>
        </div>

        <EnquiryForm />
      </div>
    </section>
  );
}
