/* next/font only works inside Next's compiler; tests get a font object with stable class names. */
const font = () => ({ className: 'font', variable: 'font-variable', style: { fontFamily: 'font' } });

export const Caveat = font;
export const Space_Mono = font;
export const Syne = font;
export const Manrope = font;
