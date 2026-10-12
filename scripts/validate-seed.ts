/**
 * Offline structural validator for the Firestore seed content. Does not hit
 * Firebase — it checks referential integrity, ordering, shape, duplicates,
 * rubric rules (options/match keys/accepted answers), and that every lesson
 * flagged as grammar-heavy carries grammar tips.
 *
 *   npm run validate
 */
import { execSync } from 'node:child_process';

import {
  exercises,
  language,
  lessons,
  units,
} from '../src/data/seed/xhosa';

const EXERCISE_INDEX = [1, 2, 3, 4, 5, 6];
const MATCH_PAIR_SIZES = [2, 3, 4];

const errors: string[] = [];
const warnings: string[] = [];

function check(ok: boolean, message: string) {
  if (!ok) errors.push(message);
}

function expectSyntax(compiles: boolean, message: string) {
  if (!compiles) errors.push(message);
}

function main() {
  const unitIds = new Set(units.map((u) => u.id));
  const lessonIds = new Set(lessons.map((l) => l.id));
  const lessonByUnit = new Map<string, typeof lessons>();

  check(language.id === 'xhosa', 'language.id must be xhosa');
  check(units.length === 33, `expected 33 units, got ${units.length}`);
  check(lessons.length === 84, `expected 84 lessons, got ${lessons.length}`);
  check(exercises.length === 425, `expected 425 exercises, got ${exercises.length}`);

  units.forEach((u) => {
    check((u as { unitId?: string }).unitId === undefined, `unit ${u.id} should not carry unitId`);
    check(u.languageId === 'xhosa', `unit ${u.id} has wrong languageId`);
  });

  lessons.forEach((lesson) => {
    check(unitIds.has(lesson.unitId), `lesson ${lesson.id} references missing unit ${lesson.unitId}`);
    if (!lessonByUnit.has(lesson.unitId)) lessonByUnit.set(lesson.unitId, []);
    lessonByUnit.get(lesson.unitId)!.push(lesson);
  });

  const orderByUnit = new Map<string, Set<number>>();
  for (const [, ls] of lessonByUnit) ls.sort((a, b) => a.order - b.order);
  for (const [unitId, ls] of lessonByUnit) {
    const orders = new Set(ls.map((l) => l.order));
    orderByUnit.set(unitId, orders);
    check(
      orders.size === ls.length,
      `unit ${unitId} has duplicate lesson orders`,
    );
  }

  const exerciseIds = new Set<string>();
  exercises.forEach((ex) => {
    const exId = ex.id;
    if (exerciseIds.has(ex.id)) errors.push(`duplicate exercise id ${ex.id}`);
    exerciseIds.add(ex.id);

    check(lessonIds.has(ex.lessonId), `exercise ${ex.id} references missing lesson ${ex.lessonId}`);
    check(EXERCISE_INDEX.includes(ex.order), `exercise ${ex.id} has unexpected order ${ex.order}`);

    for (const f of ['id', 'lessonId', 'order', 'type', 'prompt']) {
      check(ex[f as keyof typeof ex] !== undefined, `exercise ${ex.id} missing field ${f}`);
    }

    const textFields = [
      'question',
      'sourceText',
    ] as const;
    for (const f of textFields) {
      const v = ex[f as keyof typeof ex];
      if (typeof v === 'string') check(v.trim().length > 0, `exercise ${ex.id} has empty ${f}`);
    }

    const firstLearnedUnit = (() => {
      const m = ex.id.match(/^xhosa-u(\d+)-l(\d+)-e(\d+)$/);
      return m;
    })();

    check(!!firstLearnedUnit, `exercise ${ex.id} does not match id pattern`);
    const [, u, l] = firstLearnedUnit ?? [];
    const expectedLessonId = `xhosa-u${u}-l${l}`;
    check(ex.lessonId === expectedLessonId, `exercise ${ex.id} lessonId/order mismatch`);

    switch (ex.type) {
      case 'multiple_choice': {
        check((ex.options?.length ?? 0) >= 2, `exercise ${ex.id} needs >=2 options`);
        check(
          ex.correctIndex >= 0 && ex.correctIndex < (ex.options?.length ?? 0),
          `exercise ${ex.id} correctIndex out of range`,
        );
        const opts = ex.options ?? [];
        check(
          new Set(opts.map((o) => o.toLowerCase())).size === opts.length,
          `exercise ${ex.id} has duplicate options`,
        );
        break;
      }
      case 'translate': {
        check((ex.acceptedAnswers?.length ?? 0) >= 1, `exercise ${ex.id} needs acceptedAnswers`);
        check(
          ex.acceptedAnswers?.every((a) => a.trim().length > 0),
          `exercise ${ex.id} has blank acceptedAnswer`,
        );
        break;
      }
      case 'word_bank': {
        check(
          (ex.wordBank?.length ?? 0) >= 2,
          `exercise ${exId} needs a word bank`,
        );
        check(
          (ex.correctSequence?.length ?? 0) >= 1,
          `exercise ${exId} needs a correct sequence`,
        );
        // Correct sequence must be a subsequence of the bank (multiset).
        const bankCounts = new Map<string, number>();
        for (const w of ex.wordBank ?? []) {
          bankCounts.set(w.toLowerCase(), (bankCounts.get(w.toLowerCase()) ?? 0) + 1);
        }
        const seqPositions = new Map<string, number[]>();
        (ex.correctSequence ?? []).forEach((token, i) => {
          const key = token.toLowerCase();
          if (!seqPositions.has(key)) seqPositions.set(key, []);
          seqPositions.get(key)!.push(i);
        });
        for (const [token, idxs] of seqPositions) {
          const have = bankCounts.get(token) ?? 0;
          if (idxs.length > have) {
            check(
              false,
              `exercise ${exId} sequence token "${token}" appears ${idxs.length}x but bank only has ${have}x`,
            );
          }
        }
        break;
      }
      case 'match_pairs': {
        check(MATCH_PAIR_SIZES.includes(ex.pairs.length), `exercise ${ex.id} has unexpected pair count ${ex.pairs.length}`);
        const pairDuplicateKeys = new Set<string>();
        ex.pairs.forEach((pair) => {
          if (pairDuplicateKeys.has(pair.left.toLowerCase())) {
            errors.push(`exercise ${ex.id} has duplicate left key ${pair.left}`);
          }
          pairDuplicateKeys.add(pair.left.toLowerCase());
        });
        for (const p of ex.pairs) {
          check(p.left.trim().length > 0, `exercise ${ex.id} has empty left pair`);
          check(p.right.trim().length > 0, `exercise ${ex.id} has empty right pair`);
        }
        break;
      }
      default:
        errors.push(`exercise ${exId} has unknown type ${(ex as { type: string }).type}`);
    }

    const audioOk =
      typeof ex.audioUrl === 'undefined' ||
      (typeof ex.audioUrl === 'string' && ex.audioUrl.trim().length > 0);
    check(audioOk, `exercise ${ex.id} has bad audioUrl`);
  });

  const seen = new Map<string, { lessonId: string; type: string; order: number }>();
  exercises.forEach((ex) => {
    const key = `${ex.lessonId}:${ex.order}`;
    if (seen.has(key)) {
      errors.push(`duplicate lessonId/order key ${key}`);
    }
    seen.set(key, { lessonId: ex.lessonId, type: ex.type, order: ex.order });
  });

  // Grammar tips: every u16-up lesson must carry at least one; none before.
  lessons.forEach((lesson) => {
    const num = Number(lesson.unitId.replace('xhosa-u', '').split('-')[0]);
    if (num >= 16) {
      if (!lesson.grammarTips || lesson.grammarTips.length === 0) {
        errors.push(`lesson ${lesson.id} (u${num}) is missing grammarTips`);
      } else {
        lesson.grammarTips?.forEach((tip) => {
          check(tip.title.trim().length > 0, `lesson ${lesson.id} tip has empty title`);
          check(tip.body.trim().length > 0, `lesson ${lesson.id} tip has empty body`);
        });
      }
    } else {
      check(
        !lesson.grammarTips || lesson.grammarTips.length === 0,
        `lesson ${lesson.id} (u${num}) should not carry grammarTips`,
      );
    }
  });

  // Throws on a parse error via tsx.
  expectSyntax(
    (() => {
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    })(),
    'TypeScript compile failed (see tsc output above)',
  );

  const format = (list: string[]) => list.map((m) => `  - ${m}`).join('\n');
  if (errors.length > 0) {
    console.error(`VALIDATE FAILED: ${errors.length} error(s)\n${format(errors)}`);
    process.exit(1);
  }
  if (warnings.length > 0) {
    console.warn(`VALIDATE WARNINGS: ${warnings.length}\n${format(warnings)}`);
  }
  console.log(
    `VALIDATE OK: ${units.length} units, ${lessons.length} lessons, ${exercises.length} exercises, 1 language.`,
  );
}

main();