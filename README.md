# Playground 🎪

One static site, many little learning apps — built for Harrison, hosted on GitHub Pages.

**Play it here:** https://havanabunny.github.io/violin-sight-reading/

## Sections

### 🎻 Violin (`violin/`)
A Duolingo-style sight-reading trainer for violin — built for iPhone.

- **4 levels** — open strings → first position → low & high → ledger lines
- **Quiz rounds** — see a note on the staff, tap it on the fingerboard; XP, streaks, stars
- **Play Melodies** — guided play-along of classic tunes
- **Note chart** — a visual reference of every note with tap-to-hear
- **Print** — paper quiz worksheet generator

### 🎹 Piano (`piano/`)
A beginner piano corner: simplified public-domain pieces, playable with a real
MIDI keyboard (Web MIDI) or the on-screen touch keys.

Progress (XP, day streak) is shared across sections — same device, same save.

## Tech

Vanilla HTML + CSS + JS. No frameworks, no build step, works offline once loaded.
Notation is hand-drawn SVG; sound is synthesized with the Web Audio API.

Tip: on iPhone use Share → Add to Home Screen to launch it like a native app.
