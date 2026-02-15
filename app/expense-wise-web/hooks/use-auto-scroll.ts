'use client';

import * as React from 'react';

const SCROLL_THRESHOLD = 80;

/**
 * Returns a ref to attach to a scrollable container.
 * Automatically scrolls to the bottom whenever `deps` change,
 * but only if the user is already near the bottom (within SCROLL_THRESHOLD px).
 */
export function useAutoScroll<T extends HTMLElement = HTMLDivElement>(deps: React.DependencyList) {
  const scrollRef = React.useRef<T>(null);
  const isNearBottomRef = React.useRef(true);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    function handleScroll() {
      if (!scrollRef.current) {
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
    }

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (isNearBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { scrollRef };
}
