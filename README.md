# Zazi 🇿🇦

A Duolingo-style language app for South African languages, built with Expo Router. **v1 ships isiXhosa only** — the content model supports more languages later (see [Adding a language](#adding-a-language)).

## Stack

- **Expo Router** (TypeScript) — file-based routing, `src/app` as the routes root
- **Firebase** — Auth (email/password + guest/anonymous) and Firestore, doubling as both the backend *and* the content CMS (lessons are Firestore documents, editable via the Firebase console or the seed script below)
- **Zustand** — local session state (current exercise, hearts, XP) during a lesson
- **TanStack Query** — Firestore reads/writes, caching, and cache invalidation
- **react-native-svg** — decorative SA-flag-palette/geometric motifs (no image assets)

See [`src/constants/theme.ts`](src/constants/theme.ts) for the color system and [`src/types/content.ts`](src/types/content.ts) / [`src/types/progress.ts`](src/types/progress.ts) for the data model.

## Get started

```bash
npm install
cp .env.example .env   # then fill in your Firebase project's keys
npm start
```

Until `.env` has real values, the app boots straight to a "Firebase isn't configured yet" screen instead of crashing — see below to fix that.

## Firebase setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → enable **Email/Password** and **Anonymous**.
3. **Firestore Database** → create a database (start in test mode for local dev; lock down rules before shipping — see [Security rules](#security-rules-not-included) below).
4. Project settings → General → add a **Web app** → copy the config values into `.env` (as `EXPO_PUBLIC_FIREBASE_*`, see `.env.example`). These are safe to expose client-side; Firestore security rules are what actually gate access.
5. Project settings → **Service accounts** → *Generate new private key* → save the downloaded file as `serviceAccountKey.json` at the repo root (already gitignored — never commit it).
6. Push the starter isiXhosa content into Firestore:
   ```bash
   npm run seed
   ```
   Re-running it is safe — it overwrites the same document IDs.

### Security rules (not included)

This scaffold doesn't ship Firestore rules. Before any real users touch it, lock the DB down along these lines: `languages`/`units`/`lessons`/`exercises` readable by any authenticated user, writable only from the Admin SDK (i.e. never from the client); `userProfiles/{uid}` and its `lessonProgress` subcollection readable/writable only by `request.auth.uid == uid`.

## Content model

Flat top-level Firestore collections, each row carrying its parent's ID (`units.languageId`, `lessons.unitId`, `exercises.lessonId`) rather than nesting, so the seed script and future security rules stay simple:

```
languages/{id}
units/{id}            { languageId, order, title, description, theme }
lessons/{id}           { unitId, order, title, xpReward, grammarTips? }   # grammarTips = {title, body, examples[]}
exercises/{id}          { lessonId, order, type, ..., audioUrl? }        # multiple_choice | translate | word_bank | match_pairs
userProfiles/{uid}      { displayName, xp, streak, lastActiveDate }
  └ lessonProgress/{lessonId}  { completed, bestAccuracy, lastAttemptISO }
  └ wrongExercises/{exerciseId}  { wrongCount, lastWrongISO }            # feeds /strengthen review mode
```

Edit `src/data/seed/xhosa.ts` and re-run `npm run seed` to change lesson content, or edit documents directly in the Firebase console.

## ⚠️ Content accuracy

The isiXhosa seed content (greetings, numbers 1–100 & money, essential phrases & question words, family, food & drink, colors, days of the week, animals, body parts & feelings, weather & seasons, places & school, travel & directions, everyday verbs, plurals & noun classes, present-tense verb conjugation, everyday conversation, past/future/negative verb forms, object concords, commands, professions/clothes/home vocabulary, copular/adjective/locative grammar, and fruit & food/nature/travel vocabulary — 33 units, 84 lessons) was drafted from widely-cited beginner vocabulary and grammar (SADiLaR ALGraP, Unisa Open eXhosa, siyafunda, BU's "200 Word Project", Wild Coast/Omniglot phrasebooks), **not reviewed by a fluent/native speaker**. isiXhosa has real dialectal variation and noun-class agreement (word forms change based on what's being counted/described, and plural formation varies by noun class) that a beginner word list glosses over. The noun-class plurals, verb conjugations, and adjective/locative agreement in particular must be checked against a native speaker. The teens have several accepted forms, `luhlaza` covers both green and blue, and the past `-ile` / future `-za ku-` / negative forms in u19–u21 follow standard ALGraP patterns but include regular-form extensions (e.g. Ndisebenzile, Andihambanga) that a reviewer should confirm; u22–u24 object-concord and command forms likewise follow verified patterns but with some regular-form extensions, u25–u27 professions/clothes/home content (including forms like uyasebenza, izihlangu, igumbi lokulala) should be confirmed, u28–u30 copular/adjective/locative items (Ndingumfundi-style forms were avoided in favor of ALGraP-verified examples like Singabafundi; fixed noun+adjective pairs like indlu enkulu and e-…-ni locatives like esikolweni, phezu kwetafile, sisekhabhathini) still need native review, and u31–u33 fruit/nature/travel items (iapple-style loanwords like iapile, ibhanana, iorenji, itapile; ukupheka; nature terms from BU/101languages like inyanga, intaba, umlambo, ulwandle; and travel loanwords like ibhasi, uloliwe, inqwelomoya, ihotele, ithikiti) should be double-checked — several are English loanwords whose orthography varies. The S5 match_pairs exercises (order-6 ×2×3 grids in u6, u9, u31, u32, u33) reuse only already-listed vocabulary. Treat it as a scaffold to demo the app mechanics, not launch-ready content — get it checked before real learners rely on it. The u16–u33 classroom "grammar tip" cards (each a short rule + examples, shown before a lesson via the `/teach` screen) were drafted from the same AI-sourced grammar notes above and carry the same caveat — they summarize patterns rather than quote a grammar book, so a native/fluent speaker should confirm the wording and examples.

## Features

- **Linear unit path with locked lessons** — finish lesson *n* to unlock *n+1*; 33 units / 84 lessons / 425 exercises of isiXhosa across 4 exercise types: multiple choice, type-the-translation (with fuzzy answer matching), word-bank sentence building, and match-pairs grids.
- **Grammar tips ("teach")** — lessons with tips (u16–u33) open a `/teach` screen of short rule cards + Xhosa/English examples before the practice.
- **Strengthen / review mode** — wrong answers get queued (tracked per exercise with a wrong count + most-recent timestamp); the Learn screen shows "Strengthen (N)" and runs a review lesson of your most-recently-wrong items.
- **Hearts, XP, streaks, per-lesson accuracy** — classic goof-style session state.
- **Speaker button** — an `expo-audio` play button renders on every exercise card whenever the exercise resolves an `audioUrl` (stored field or `audio/{lang}/{exerciseId}.m4a` convention; no clips recorded yet).

## Known v1 simplifications

- **Hearts are per-lesson-session**, not a persistent global resource with regen timers (unlike Duolingo). Run out mid-lesson and you retry that lesson; hearts reset to 5 either way.
- **No audio clips yet.** The plumbing is in: `expo-audio` (SDK 54) powers a `SpeakerButton` on every exercise card whenever an exercise has audio — either a stored `audioUrl` field or a clip dropped at the conventional Storage path `audio/{languageId}/{exerciseId}.m4a` (see `src/lib/audio.ts`). But no real isiXhosa clips are recorded yet, so no button ever appears in practice; device text-to-speech doesn't reliably support isiXhosa, so real pronunciation needs recorded audio.
- **No anonymous→email account linking.** Guest progress lives under that anonymous Firebase UID; signing out and creating a real account starts fresh rather than migrating it (Firebase supports `linkWithCredential` for this — not implemented here).
- **Lesson unlocking** is strictly linear (finish lesson *n* to unlock *n+1*) across the whole flattened unit → lesson order; no branching/skipping.

## Adding a language

1. Add a `Language` doc and its `Unit`/`Lesson`/`Exercise` docs (see `src/data/seed/xhosa.ts` as a template, or add a new seed file and push it the same way).
2. `src/constants/app.ts`'s `DEFAULT_LANGUAGE_ID` is the only hardcoded language reference in the UI — everything else (`useLearnPath`, exercises, progress) is already keyed generically. Swapping it, or building a language picker that sets it dynamically, is the extension point.

## Project structure

Follows [Expo's recommended layout](https://expo.dev/blog/expo-app-folder-structure-best-practices): `src/app` is routes-only, screen bodies live in `src/screens`, shared UI in `src/components`, Firebase/query logic in `src/lib` + `src/hooks`, ephemeral lesson-session state in `src/store`.
