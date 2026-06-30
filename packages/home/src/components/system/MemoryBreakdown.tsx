import type { JSX } from 'react';
import type { AdminOverview } from '@/types/admin';
import { formatBytes } from './formatUtils';
import { getMemoryAccounting } from './memoryAccounting';
import './MemoryBreakdown.css';

type MemoryBreakdownProps = {
  metrics: AdminOverview['metrics'];
};

export function MemoryBreakdown({ metrics }: MemoryBreakdownProps): JSX.Element {
  const { total, inUse, available, active, buffcache } = getMemoryAccounting(metrics);
  const inUsePct = total > 0 ? (inUse / total) * 100 : 0;
  const availPct = total > 0 ? (available / total) * 100 : 0;

  return (
    <div className="memory-accounting">
      <dl className="memory-accounting-totals">
        <div>
          <dt>Total</dt>
          <dd>{formatBytes(total)}</dd>
        </div>
        <div>
          <dt>In use</dt>
          <dd>{formatBytes(inUse)}</dd>
        </div>
        <div>
          <dt>Available</dt>
          <dd>{formatBytes(available)}</dd>
        </div>
      </dl>
      <div
        className="memory-accounting-bar"
        role="img"
        aria-label={`${formatBytes(inUse)} in use, ${formatBytes(available)} available`}
      >
        <div className="memory-accounting-bar-inuse" style={{ width: `${inUsePct}%` }} />
        <div className="memory-accounting-bar-avail" style={{ width: `${availPct}%` }} />
      </div>
      <p className="memory-accounting-note">
        Inside in-use: {formatBytes(active)} active · {formatBytes(buffcache)} cache. Those overlap
        (cache is reclaimable and also counted in Unraid &ldquo;used&rdquo;) — only{' '}
        <strong>in use + available = total</strong>.
      </p>
    </div>
  );
}
