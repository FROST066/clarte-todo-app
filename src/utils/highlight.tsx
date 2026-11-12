import React from 'react';

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !query.trim() || !text) return text;

  const trimmedQuery = query.trim();
  // Escape regex special chars
  const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark
            key={index}
            className="bg-amber-200 dark:bg-amber-500/35 text-amber-950 dark:text-amber-100 font-semibold rounded-xs px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
