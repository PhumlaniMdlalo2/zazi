# Zazi isiXhosa — Fluency Roadmap

Master list of what a learner needs to get from this app to *conversationally fluent*
isiXhosa. Work items are sized so each can be a focused session. Everything marked
TODO is fair game; tick items off as they ship. Cross-links point at the files you will
touch.

> Honest framing: the current seed (33 units / 84 lessons / 425 exercises, ~330 words)
> takes a motivated learner from zero to "survival small-talk + past/future/negative
> basics + commands/object pronouns". Fluency needs roughly 7–8x the content, real
> audio, and the listening + speaking features that don't exist yet. This
> doc is the plan to get there.

## 0. Target definition

- **Goal:** CEFR B1-ish conversational fluency — hold everyday conversations, describe
  past/present/future, express wants/feelings, understand a slow-ish native speaker,
  order/shop/travel independently.
- **Rough numbers to aim for:** ~2,000–2,500 lemmas, ~60–90 units, ~220–280 lessons,
  ~1,200–1,500 exercises, audio on ~100% of learnable items, 100% native-reviewed content.
- **Explicitly out of scope for "fluent":** literary fluency, formal writing, regional
  dialect sets (Xhosa lects). Revisit later if wanted.

## 1. Content — vocabulary (build as seed units in src/data/seed/xhosa.ts)

Approximate target words per topic; mark ✔ when the unit exists with credible coverage.

| # | Topic | ~words | Status |
|---|-------|--------|--------|
| 1 | Greetings, politeness, introductions | 40 | ✔ (u1, u3, u18) |
| 2 | Numbers 0–100, ordinal, dates | 60 | ✔ (u2, u8, u15) — extend to 100+, this week/year |
| 3 | Time: clock, hours, today/yesterday/soon | 40 | PARTIAL (u12 words) |
| 4 | Family, people, professions | 80 | ✔ (u4) — professions added (u25) |
| 5 | Food & drink, meals, restaurant | 90 | ✔ (u5) — add fruits/veg, cooking verbs |
| 6 | Clothes & shopping | 60 | ✔ (u26) |
| 7 | Home & furniture, rooms | 70 | ✔ (u12, u27) |
| 8 | Town, services, transport, travel | 80 | PARTIAL (u12, u13) |
| 9 | Nature: animals, plants, landscape (mountains, sea) | 100 | ✔ animals (u9) — extend plants/landscape |
| 10 | Weather & seasons | 40 | ✔ (u11) |
| 11 | Body, health, feelings | 90 | ✔ (u10) — add symptoms, "my X hurts" |
| 12 | Colors, sizes, shapes | 40 | ✔ (u6) — add size/quality adjectives |
| 13 | Core verbs (move, sense, talk, want, like, work) | 150 | PARTIAL (u14, u17) — need the full high-frequency set |
| 14 | Adjectives & description | 100 | TODO |
| 15 | Adverbs, prepositions, connectives (kwaye, kodwa, ngoko) | 60 | TODO |
| 16 | Questions & question words | 40 | ✔ (u3) — extend to "which? why? how many?" |
| 17 | School & study | 50 | PARTIAL (u12) |
| 18 | Money, prices, banking | 40 | ✔ (u15) |
| 19 | Work & jobs | 60 | ✔ (u25) |
| 20 | Social life, celebrations, opinions | 80 | TODO |
| 21 | Requests, commands, announcements | 40 | PARTIAL |
| 22 | Idioms, fillers, discourse markers (kanene, usuku…) | 40 | TODO (low priority) |

## 2. Content — grammar curriculum (ordered; each = 2–3 lesson group)

Taught as pattern + sentence-build exercises, like u16–u18. Order matters.

1. ✔ Present tense, all persons (ndi-/u-/si-/ni-/ba- + -ya-) — u17
2. ✔ Noun-class plurals (um-/aba-, u-/oo-, um-/imi-, isi-/izi-, in-/ii-, i-/ama-) — u16
3. ✔ **Object concords** — Ndiyakuthanda / Ndiyambona / Ndiyababona; family of -m-, -ku-, -si-, -ni-, -ba-, -yi- — u22
4. ✔ **Past tense** — perfect -ile (Ndithethile, bahambile) — u19; remote past forms still flagged for review
5. ✔ **Future tense** — -za + ku (Siza kusebenza, Uza kufika ngomso) — u20; negative future form still to confirm
6. ✔ **Negatives** — present a-SC-root-i (Andibhali, Andithethi), past -anga (Andivanga, Andihambanga), future a-SC-na-ku (Asinakubuya) — u21; aka-/asi- forms need reviewer confirmation
7. ✔ **Imperatives** — simple (Yima!/Hamba!/Baleka!), plural -ni (Hambani kakuhle), let's (Masithethe), polite Ndicela/Khawuphinde, negative (Ungandishiyi, Masingabhali), object commands (Ndincede!, Ndiyeke!, Bamba isela!) — u23–u24
8. TODO **Possessive concords by class** — wam/yam/sam/lam (umama wam, iti yam, isikolo sam)
9. TODO **Absolutive pronouns** — mna, wena, yena/yona, thina, nina, bona; emphasis
10. TODO **Copulatives "to be"** — ndinguThabo, ungubani, yintoni (Yi-/Ngu-)
11. TODO **Adjective agreement** — umntu omhle, abantu abahle, colors agreeing with class
12. TODO **Locatives** — eKapa, emsebenzini, endlwini, apha/phaya (u13 has apha/phaya already)
13. TODO **Relative clauses** — umntu othetha isiXhosa
14. TODO **"still / already"** — -sa- / -se- (Ndisafunda exists; generalise)
15. TODO **Subjunctive / ukuba** — bafuna ukuba sitye
16. TODO **Demonstratives** — this/that/that-yonder by class (lo, le, lolu…)
17. TODO **More tenses** — progressive, continuous (ndisathetha), then beyond B1

## 3. App features / exercise types (src/types/content.ts + src/screens/lesson-session/components/)

1. ✔ multiple_choice, translate, word_bank — in place
2. ✔ **match_pairs** — tap to pair Xhosa↔English (2×3 grid) — `match-pairs-card.tsx` + `MatchPairsExercise` type (S5)
3. TODO **listen_choice / listen_type** — play audio, tap/type the right option (depends on §4)
4. TODO **read_passage** — short Xhosa text + 2–3 comprehension questions (great for fluency)
5. TODO **speak** — say it out loud, self-assess or auto-score (needs mic + SDK 54 audio/recognition — research first)
6. ✔ **Speaker button** on every exercise card ✓ (expo-audio `SpeakerButton` renders when `audioUrl` resolves — see §4.3)
7. ✔ **Grammar tips / "teach" screen** — short rule + examples shown before a lesson (u16–u33 all carry tips; `teach/[lessonId]` route + `GrammarTip` type — S8)
8. ✔ **Review / spaced repetition** — "Strengthen" mode, most-recently-wrong words first (wrong-answer tracking → `wrongExercises` collection; `/strengthen` route — S8)
9. TODO **Click characters** — keyboard helper for ǀ ǃ ǁ and apostrophes in typed answers
10. TODO **Dialogue / conversation mode** — scripted 4–6 line scenes; learner picks responses (lightweight chatbot)

## 4. Audio program

1. TODO **Record** every word + every full phrase with a native speaker (or repo of clips). Organisation: Firebase Storage `audio/{languageId}/{exerciseId}.m4a` (`src/lib/audio.ts` resolves `audioUrl` from this convention when the exercise has none stored)
2. ✔ **Data model** — optional `audioUrl` on `Exercise` (BaseExercise, `src/types/content.ts`) + `exerciseAudioUrl`/`configureAudioMode` helpers (`src/lib/audio.ts`)
3. ✔ **Player** — `expo-audio` (SDK 54) speaker button in cards (`src/components/speaker-button.tsx`; boot app config plugin registered in app.json)
4. TODO **Listening exercise types** (drives §3.3)
5. TODO **Pronunciation demo screen** — slow, normal, syllable-by-syllable (nice-to-have)

## 5. Quality gate — native review (your plan)

1. TODO **Full review pass** of all 330 current items (start now; not blocked by new content)
2. TODO **Variant pass** — capture dialectal/alternative accepted forms into acceptedAnswers list (teens already partly done)
3. TODO **Pronunciation/orthography check** on every new grammar pattern before it ships to real learners
4. ✔ **Make the content validator permanent** — scripts/validate-seed.ts wired to `npm run validate` enforces option/wordbank/answer, referral integrity, and grammarTip-coverage rules (S8)
5. TODO **Learner pilot** — 3–5 learners run every lesson; log wrong answers; fix acceptedAnswers that reject valid spelling

## 6. Done-check (how we know we're there)

- [ ] ≥ 2,000 lemmas in seed; 250+ lessons; 1,200+ exercises
- [ ] Grammar checklist §2 all 17 items present, present/past/future/negative/imperative confirmed by a teacher
- [ ] §3.1–3.10 feature list shipped (audio + listening + speaking + review at minimum)
- [ ] §4.3: 100% of learnable items have audio
- [ ] §5.1: 100% content reviewed by native speaker; zero outstanding TODO-review flags in seed header
- [ ] A volunteer who finished all lessons can hold a 10-minute scripted conversation in isiXhosa unprompted

## 7. Suggested session batches (rough order of value)

- ~~**S1**~~ §2.4–2.6 tenses: past + future + negatives — ✔ DONE (u19–u21)
- ~~**S2**~~ §2.3 object concords + §2.7 imperatives — ✔ DONE (u22–u24)
- ~~**S3**~~ §1 vocab expansion batch 1: professions (u25), clothes & shopping (u26), home (u27) — ✔ DONE
- ~~**S4**~~ §2.10–2.12 be/copular, adjective agreement, locatives — ✔ DONE (u28–u30)
- ~~**S7**~~ §1 vocab batch 2: foods & cooking (u31), nature (u32), travel (u33) — ✔ DONE
- ~~**S5**~~ §3.2 match_pairs exercise type — ✔ DONE (new card, wiring, 5×2×3-grid exercises reusing existing vocab)
- **S6** §4 audio recording + §3.6 speaker button → then §3.3 listening exercises — **code portion DONE** (expo-audio player, optional `audioUrl`, SpeakerButton in all 4 cards, `configureAudioMode` boot hook; see §4.2/§4.3 below); recording real clips and listen_* types still TODO
- ~~**S8**~~ §3.7 grammar tips + §3.8 review mode — ✔ DONE (u16–u33 seed tips, `/teach` screen, wrong-answer tracking, `/strengthen` mode)
- **S9** §2.13–2.17 relatives, still/already, subjunctive, demonstratives, more tenses
- **S10** §5 review follow-through + learner pilot; fix acceptedAnswers

Update this doc as items land; keep the Status column honest.