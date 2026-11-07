/* Names shared by the opening loader's head script (LoaderScripts) and IntroProvider. The loader
   itself is public/inizio-loader.js. */

/** Fired on document by the loader once it has left the screen. */
export const LOADER_DONE_EVENT = 'inizio:loaded';
/** Set on window by the head script, for when the loader finishes before React is listening. */
export const LOADER_DONE_FLAG = '__inizioLoaded';
/** Class on <html> that paints the page navy and hides it until the loader's overlay exists. */
export const LOADER_COVER_CLASS = 'il-on';
