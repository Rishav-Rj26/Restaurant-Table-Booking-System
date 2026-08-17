import { describe, expect, it } from 'vitest';
import { generateSlug } from './slug.js';

describe('generateSlug', () => {
  it('normalizes whitespace, punctuation, and casing', () => {
    expect(generateSlug('  The Rustic Table!  ')).toBe('the-rustic-table');
  });

  it('does not leave separator characters at either end', () => {
    expect(generateSlug('---Sakura Garden---')).toBe('sakura-garden');
  });
});
