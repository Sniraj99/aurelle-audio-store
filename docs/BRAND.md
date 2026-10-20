# Brand naming and identity

> **None of these names has been checked for availability.** Before choosing one, search:
> trademarks in Class 9 (audio equipment) and Class 35 (retail) on [IP India](https://ipindiaonline.gov.in/tmrpublicsearch/) and the [WIPO Global Brand Database](https://branddb.wipo.int); company names on the MCA portal; `.com` / `.in` domains; and Instagram, YouTube, and X handles. Have a trademark attorney confirm the final choice.

## Ten candidates

| Name | Meaning / rationale | Possible tagline |
|---|---|---|
| **Aurelle** | From *aural* (of hearing) with a soft, European ending. Elegant, easy to say ("aw-REL"), and wide enough to cover home, portable, and pro audio. | Sound, Refined. |
| **Veyra** | Invented; echoes *verity* and *vera* (truth). Suggests faithful, uncoloured sound. | Hear it as it is. |
| **Oriel** | An oriel is a projecting window that brings light into a room: architecture, clarity, openness. | Let the room open up. |
| **Halcyn** | From *halcyon*: a calm, golden period. Suits a quiet-luxury listening brand. | Calm, then everything. |
| **Lumora** | *Lumen* + *aura*: light and atmosphere. Strong for lifestyle and design-led products. | Precision Meets Emotion. |
| **Cadenz** | From *cadenza*, the virtuoso solo passage. Musical, confident, credible in professional audio. | Designed to Be Heard. |
| **Kairo** | From *kairos*, the right moment. Short, global, memorable. | The moment, exactly. |
| **Novaro** | From *nova*, a new star. Signals a new company with ambition. | Experience Every Detail. |
| **Altvane** | *Alt* (high) + *vane* (direction). Technical and directional; good for engineering-led lines. | Sound with direction. |
| **Tessaro** | From *tessera*, a mosaic tile: many precise parts forming a whole. | Every detail, in place. |

## Shortlist

1. **Aurelle** (provisional choice): the most direct connection to hearing, refined without being fussy, and it carries the "Sound, Refined." line naturally. Risk: similar names may exist in beauty or fashion; check Class 9 specifically.
2. **Oriel**: architectural and distinctive in audio, matches the minimal, light-in-a-dark-room aesthetic. Risk: it is a dictionary word, so domains and broad trademarks may be harder.
3. **Cadenz**: musical credibility that stretches from Hi-Fi to DJ/PA. Risk: closeness to "cadence" and existing music businesses.

## Provisional identity (implemented)

- **Wordmark:** the name set in Manrope Medium, widely tracked capitals, preceded by the *driver mark*.
- **Driver mark / favicon:** a loudspeaker driver seen face-on: an outer surround ring, a fainter inner ring, and a solid dust cap, in Metallic Gold on Obsidian (`src/app/icon.svg`). It also appears as a faint motif in the hero and closing sections.
- **Tagline:** "Sound, Refined."
- **Voice:** calm, precise, plain-spoken. Short sentences. No superlatives, no unverifiable claims. Speaks about rooms and listening rather than specifications for their own sake.

## Changing the name

Edit `src/config/brand.ts` (`name`, `legalName`, `wordmark`, `tagline`). Everything else (header, footer, metadata, emails, legal pages, cart storage key) reads from it. Also update `EMAIL_FROM` in your environment and the `brand` field on products in `src/data/products.ts`.
