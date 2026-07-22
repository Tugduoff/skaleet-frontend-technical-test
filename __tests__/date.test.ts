import { describe, expect, it } from '@jest/globals';

import { formatDate } from '../src/utils/date';

describe('formatDate', () => {
  it('formats an ISO timestamp as YYYY-MM-DD HH:mm in local time', () => {
    // Local-time ISO (no timezone suffix) parses deterministically in any TZ.
    expect(formatDate('2026-07-22T09:05:00')).toBe('2026-07-22 09:05');
  });

  it('pads single-digit date and time parts', () => {
    expect(formatDate('2026-01-02T03:04:00')).toBe('2026-01-02 03:04');
  });

  it('returns the raw value when it cannot be parsed', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});
