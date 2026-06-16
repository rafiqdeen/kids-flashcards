// narrationKey — canonicalises a spoken line into a stable lookup key so the
// build-time generator (scripts/gen-narration.mjs) and the runtime player
// (hooks/useSpeech.js) agree exactly. Normalises smart quotes/apostrophes and
// collapses whitespace; everything else (case, punctuation) is preserved.
export const narrationKey = (t) => (t || '')
  .replace(/[‘’]/g, "'")   // ‘ ’ → '
  .replace(/[“”]/g, '"')   // “ ” → "
  .replace(/\s+/g, ' ')
  .trim();
