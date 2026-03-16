'use client';

import { useState } from 'react';
import { ChevronDown, Tag } from 'lucide-react';
import type { ChangelogEntry } from '@/lib/productChangelogs';

interface Props {
  entries: ChangelogEntry[];
}

export function ChangelogAccordion({ entries }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!entries || entries.length === 0) return null;

  return (
    <div className="mt-10">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <Tag size={14} className="text-[#8b1a1a]" />
        <p className="text-xs font-semibold text-[oklch(0.4_0.005_0)] uppercase tracking-widest">
          Notes de version
        </p>
      </div>

      <div className="space-y-2">
        {entries.map((entry, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={entry.version}
              className="rounded-xl overflow-hidden border transition-colors duration-200"
              style={{
                background: 'oklch(0.11 0 0)',
                borderColor: isOpen ? 'rgba(139,26,26,0.45)' : 'oklch(0.18 0 0)',
              }}
            >
              {/* Summary row */}
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  {/* Version badge */}
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                    style={{
                      background: 'rgba(139,26,26,0.12)',
                      border: '1px solid rgba(139,26,26,0.3)',
                      color: '#c94040',
                    }}
                  >
                    {entry.version.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-white">{entry.label}</span>
                  {entry.date && (
                    <span className="text-xs text-[oklch(0.35_0.005_0)]">{entry.date}</span>
                  )}
                </div>
                <ChevronDown
                  size={15}
                  className="text-[oklch(0.4_0.005_0)] shrink-0 ml-4 transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {/* Content */}
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: isOpen ? '600px' : '0px' }}
              >
                <div className="px-5 pb-4 border-t border-[oklch(0.15_0_0)] pt-3">
                  <ul className="space-y-2">
                    {entry.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-[oklch(0.6_0.005_0)]">
                        <span
                          className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: 'rgba(139,26,26,0.8)' }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
