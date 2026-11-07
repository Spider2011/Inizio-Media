import { LOADER_COVER_CLASS, LOADER_DONE_EVENT, LOADER_DONE_FLAG } from '@/lib/loader';

/* Runs before the page paints: navy behind everything, and the page hidden until the loader has
   built its overlay (it does so once <body> exists); then a flag for when the loader is gone. */
const BOOT = [
  "window.INIZIO_LOADER={theme:'navy'};",
  `var h=document.documentElement;h.classList.add('${LOADER_COVER_CLASS}');`,
  `document.addEventListener('${LOADER_DONE_EVENT}',function(){window.${LOADER_DONE_FLAG}=true});`,
  /* Runs after the loader's own DOMContentLoaded handler, which builds the overlay. */
  `document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){h.classList.remove('${LOADER_COVER_CLASS}')},0)});`
].join('');

/* The loader sits above the custom cursor, so the system pointer shows over it. */
const BOOT_CSS =
  `html.${LOADER_COVER_CLASS}{background:#071c40}html.${LOADER_COVER_CLASS} body>:not(.il){visibility:hidden}` +
  'html.has-cursor .il,html.has-cursor .il *{cursor:auto!important}';

/** The opening loader's tags for <head>: the navy cover and config first, then the loader. */
export function LoaderScripts() {
  return (
    <>
      <style>{BOOT_CSS}</style>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <script src="/inizio-loader.js" defer />
    </>
  );
}
