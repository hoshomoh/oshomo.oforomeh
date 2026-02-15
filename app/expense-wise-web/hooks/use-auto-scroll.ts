'use client';

import * as React from 'react';

/**
 * Returns a ref to attach to a scrollable container.
 * Automatically scrolls to the bottom whenever `deps` change.
 */
export function useAutoScroll<T extends HTMLElement = HTMLDivElement>(
  deps: React.DependencyList,
) {
  const scrollRef = React.useRef<T>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { scrollRef };
}
