import { describe, it, expect, vi } from 'vitest';
import { checkRateLimit } from '@/lib/rateLimit';

let counter = 0;
const ip = () => `10.0.0.${++counter}`;

describe('checkRateLimit', () => {
  it('allows the first 10 requests from the same IP', () => {
    const testIp = ip();
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(testIp).allowed).toBe(true);
    }
  });

  it('blocks the 11th request', () => {
    const testIp = ip();
    for (let i = 0; i < 10; i++) checkRateLimit(testIp);
    expect(checkRateLimit(testIp).allowed).toBe(false);
  });

  it('includes retryAfter when blocked', () => {
    const testIp = ip();
    for (let i = 0; i < 10; i++) checkRateLimit(testIp);
    const result = checkRateLimit(testIp);
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('allows requests again after the window expires', () => {
    const testIp = ip();
    const spy = vi.spyOn(Date, 'now');

    spy.mockReturnValue(1_000_000);
    for (let i = 0; i < 10; i++) checkRateLimit(testIp);
    expect(checkRateLimit(testIp).allowed).toBe(false);

    // Advance past the 15-minute window
    spy.mockReturnValue(1_000_000 + 900_001);
    expect(checkRateLimit(testIp).allowed).toBe(true);

    spy.mockRestore();
  });

  it('tracks different IPs independently', () => {
    const ip1 = ip();
    const ip2 = ip();
    for (let i = 0; i < 10; i++) checkRateLimit(ip1);
    expect(checkRateLimit(ip1).allowed).toBe(false);
    expect(checkRateLimit(ip2).allowed).toBe(true);
  });
});
