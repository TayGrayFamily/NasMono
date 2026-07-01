import { describe, expect, it } from 'vitest';
import { formatImageVersion } from '../../src/components/system/dockerImage.js';

describe('formatImageVersion', () => {
  it('extracts tag from image reference', () => {
    expect(formatImageVersion('ghcr.io/taygrayfamily/nasmono-home:latest')).toBe('latest');
    expect(formatImageVersion('postgres:16-alpine')).toBe('16-alpine');
  });

  it('handles digest references', () => {
    expect(formatImageVersion('nginx@sha256:abc123')).toBe('nginx');
  });
});
