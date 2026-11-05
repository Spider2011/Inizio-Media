import Image from 'next/image';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { isExternal, type WorkProject } from '@/data/work';
import styles from './WorkGrid.module.css';

/* Every project once, as a plain grid, for anyone who would rather scan than spin. */
export function WorkGrid({ projects }: { projects: readonly WorkProject[] }) {
  return (
    <section className={styles.section} id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionTitle eyebrow="All projects" title="Every beginning, at a glance." titleId="projects-title" accent={['glance.']} />
        <ul className={styles.grid}>
          {projects.map((project) => {
            const external = isExternal(project.href);
            return (
              <li key={project.slug}>
                <a
                  className={styles.card}
                  href={project.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  data-cursor="Open"
                >
                  <span className={styles.media}>
                    {project.cover ? (
                      <Image className={styles.cover} src={project.cover} alt="" fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw" />
                    ) : (
                      project.logo && <Image className={styles.logo} src={project.logo} alt="" sizes="160px" />
                    )}
                  </span>
                  <span className={styles.client}>{project.client}</span>
                  <span className={styles.meta}>
                    {project.title} · {project.category}
                    {external && <span className="sr-only"> (opens in a new tab)</span>}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
