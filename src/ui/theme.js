/**
 * "Ember" — warm charcoal base, a single gold/ember signature accent instead
 * of a generic purple, and semantic colors retuned so none of them fight the
 * warm base (the old palette's cool blue/mint/purple read as a random SaaS
 * default; these are chosen to sit in the same family as `acc`).
 */
export const C = {
  bg: '#0A0908',
  surf: '#151210',
  // One step brighter than `surf` — hover/active backgrounds for elements
  // that are already `surf`/`high` at rest.
  high: '#1E1A16',
  higher: '#28221D',
  // Translucent, paired with backdrop-filter blur. Reserved for the handful
  // of *singular* chrome elements (sidebar panel, modal, toast, mobile menu)
  // — never the repeated Card primitive, where stacking blur across dozens
  // of list rows would cost real scroll performance for no visible gain.
  glass: 'rgba(21,18,16,0.72)',
  bord: 'rgba(255,255,255,0.08)',
  // Hover/focus-adjacent border, brighter than `bord`.
  bordStrong: 'rgba(255,255,255,0.18)',
  text: '#F4EFE7',
  mut: '#9C9188',
  acc: '#F0A548',
  accBg: 'rgba(240,165,72,0.13)',
  accBord: 'rgba(240,165,72,0.38)',
  // Gold is light-mid brightness — white text on it (the old purple accent's
  // default) has weak contrast. Use this dark warm ink wherever text sits
  // directly on a solid `acc`/`accGrad` fill (primary buttons, the logo
  // mark, a filled DayToggle's checkmark).
  onAccent: '#241C12',
  // The signature gradient — gold through to a deeper ember-red. Used
  // sparingly (primary buttons, progress fills, the logo mark) so it reads
  // as "the one thing to notice," not decoration repeated everywhere.
  accGrad: 'linear-gradient(135deg, #FFC875 0%, #F0A548 55%, #E2703D 100%)',
  // Ambient glow layered behind hero moments (Login card, loading screen).
  heroGlow: 'radial-gradient(circle at 25% 15%, rgba(240,165,72,0.16), transparent 55%)',
  suc: '#72C08D',
  sucBg: 'rgba(114,192,141,0.13)',
  war: '#CB7B4A',
  warBg: 'rgba(203,123,74,0.13)',
  dan: '#E2685A',
  danBg: 'rgba(226,104,90,0.13)',
  blue: '#63A9A1',
  blueBg: 'rgba(99,169,161,0.13)',
  pink: '#D992A6',
  pinkBg: 'rgba(217,146,166,0.13)',
};

/** Font stacks. The variables are defined by next/font in app/layout.tsx. */
export const SANS =
  "var(--font-plus-jakarta), -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
export const MONO =
  "var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace";
/** Editorial display serif — page titles, hero greetings, empty-state headlines. Never body text. */
export const DISPLAY = "var(--font-fraunces), Georgia, serif";

/** Elevation shadows. Layered (ambient + contact) so depth reads at a glance. */
export const SHADOW = {
  sm: '0 1px 2px rgba(0,0,0,0.4)',
  md: '0 14px 32px -10px rgba(0,0,0,0.55), 0 2px 8px -2px rgba(0,0,0,0.35)',
  lg: '0 36px 72px -24px rgba(0,0,0,0.65), 0 14px 28px -10px rgba(0,0,0,0.4)',
  // Accent-tinted glow for hover/focus on the most important controls.
  glow: '0 0 0 1px rgba(240,165,72,0.35), 0 14px 32px -8px rgba(240,165,72,0.3)',
  // A faint top highlight that sells "physical card catching light from
  // above" without needing a real light source — layer onto boxShadow.
  inset: 'inset 0 1px 0 rgba(255,255,255,0.05)',
};

/** Corner-radius scale (px). Deliberately soft/generous for containers; controls stay at sm/md. */
export const RADIUS = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 };

/** CSS-side motion tokens, for the few remaining plain-CSS transitions (input focus, scrollbar, etc). */
export const MOTION = {
  dur: { fast: 120, base: 220, slow: 380 },
  ease: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

/**
 * Motion (motion/react) transition presets — pass directly as a
 * `<motion.div transition={SPRING}>` prop. Two weights only, so every spring
 * in the app feels like it belongs to the same object rather than each
 * component inventing its own stiffness/damping:
 * - SPRING: small/quick things (buttons, chips, toggles, the nav pill).
 * - SPRING_SOFT: larger things (modals, page transitions, layout reflow).
 */
export const SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 };
export const SPRING_SOFT = { type: 'spring', stiffness: 220, damping: 28, mass: 1 };
/** Confident "expo-out" easing for duration-based (non-spring) transitions. */
export const EASE_EXPO = [0.16, 1, 0.3, 1];
