import { describe, it, expect } from 'vitest';
import {
  parseConfirmations,
  updateChecklist,
  getProgress,
  buildProgressComment,
  buildCompletionComment,
} from '../src/validator.js';

describe('parseConfirmations', () => {
  it('parses a single confirmation pattern', () => {
    const comment = 'Confirm checkpoint 3: Added unit tests for validator';
    const result = parseConfirmations(comment);
    expect(result).toEqual([{ checkpoint: '3', evidence: 'Added unit tests for validator' }]);
  });

  it('parses multiple confirmations from one comment', () => {
    const comment = 'Confirm checkpoint 1: Setup done\nConfirm checkpoint 2: Tests written';
    const result = parseConfirmations(comment);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ checkpoint: '1', evidence: 'Setup done' });
    expect(result[1]).toEqual({ checkpoint: '2', evidence: 'Tests written' });
  });

  it('is case-insensitive', () => {
    const result = parseConfirmations('CONFIRM CHECKPOINT 5: Done');
    expect(result).toEqual([{ checkpoint: '5', evidence: 'Done' }]);
  });

  it('returns empty array when no pattern found', () => {
    expect(parseConfirmations('Just a regular comment')).toEqual([]);
    expect(parseConfirmations('')).toEqual([]);
    expect(parseConfirmations(null)).toEqual([]);
  });

  it('trims whitespace from evidence', () => {
    const result = parseConfirmations('Confirm checkpoint 2:   evidence with spaces   ');
    expect(result[0].evidence).toBe('evidence with spaces');
  });
});

describe('updateChecklist', () => {
  it('marks a checkbox as confirmed and appends evidence', () => {
    const body = '- [ ] **Checkpoint 3:** Add unit tests';
    const result = updateChecklist(body, '3', 'Added unit tests');
    expect(result).toContain('- [x] **Checkpoint 3:** Add unit tests');
    expect(result).toContain('📝 _Confirmed: Added unit tests_');
  });

  it('does not modify already-confirmed checkpoints', () => {
    const body = '- [x] **Checkpoint 3:** Add unit tests\n  📝 _Confirmed: done_';
    const result = updateChecklist(body, '3', 'new evidence');
    // Already confirmed — pattern requires [ ] (space) so it won't match [x]
    expect(result).toBe(body);
  });

  it('only updates the targeted checkpoint number', () => {
    const body =
      '- [ ] **Checkpoint 1:** First step\n- [ ] **Checkpoint 2:** Second step';
    const result = updateChecklist(body, '1', 'First step done');
    expect(result).toContain('- [x] **Checkpoint 1:**');
    expect(result).toContain('- [ ] **Checkpoint 2:**');
  });
});

describe('getProgress', () => {
  it('counts total and confirmed checkpoints', () => {
    const body =
      '- [ ] **Checkpoint 1:** First\n' +
      '- [x] **Checkpoint 2:** Second\n' +
      '- [x] **Checkpoint 3:** Third';
    expect(getProgress(body)).toEqual({ total: 3, confirmed: 2 });
  });

  it('returns zeros for empty body', () => {
    expect(getProgress('')).toEqual({ total: 0, confirmed: 0 });
  });

  it('handles all checkpoints confirmed', () => {
    const body = '- [x] **Checkpoint 1:** A\n- [x] **Checkpoint 2:** B';
    expect(getProgress(body)).toEqual({ total: 2, confirmed: 2 });
  });
});

describe('buildProgressComment', () => {
  it('shows partial progress', () => {
    const comment = buildProgressComment(2, 5);
    expect(comment).toContain('2/5');
    expect(comment).toContain('40%');
    expect(comment).toContain('3 confirmation(s) remaining');
    expect(comment).not.toContain('ALL CONFIRMATIONS COMPLETE');
  });

  it('shows completion message when all done', () => {
    const comment = buildProgressComment(3, 3);
    expect(comment).toContain('3/3');
    expect(comment).toContain('100%');
    expect(comment).toContain('ALL CONFIRMATIONS COMPLETE');
  });

  it('includes automation signature', () => {
    expect(buildProgressComment(1, 2)).toContain('Automated by Fibonrose Task Validator');
  });
});

describe('buildCompletionComment', () => {
  it('contains congratulations message', () => {
    const comment = buildCompletionComment();
    expect(comment).toContain('Congratulations');
    expect(comment).toContain('Fibonrose sequence');
  });
});
