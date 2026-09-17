# Violin Sight Reading 🎻

A Duolingo-style sight-reading trainer for violin — built for iPhone, hosted on GitHub Pages.

**Play it here:** https://havanabunny.github.io/violin-sight-reading/

## What it does

- **4 levels** — open strings → first position → low & high → ledger lines
- **Quiz rounds** — see a note on the staff, tap its name; hearts, XP, streaks, stars
- **Hear every note** — tap 🔊 to play the pitch (Web Audio, no files needed)
- **Note chart** — a visual reference of every note with tap-to-hear
- **Progress saved** on your device (localStorage): XP, day streak, stars, unlocked levels

## Tech

Vanilla HTML + CSS + JS. No frameworks, no build step, works offline once loaded.
Notation is hand-drawn SVG; sound is synthesized with the Web Audio API.

Tip: on iPhone use Share → Add to Home Screen to launch it like a native app.
