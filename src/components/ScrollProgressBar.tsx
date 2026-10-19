import React, { useEffect, useState } from 'react';
import { PageId } from '../data/servicesData';

interface ScrollProgressBarProps {
  page: PageId;
}

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({ page }) => {
  const [progress, setProgress] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const calculateScroll = () => {
      const docEl = document.documentElement;
      const scrollTop = window.scrollY || docEl.scrollTop || 0;
      const maxScroll = docEl.scrollHeight - docEl.clientHeight;

      if (maxScroll <= 32) {
        setIsScrollable(false);
        setProgress(0);
        return;
      }

      setIsScrollable(true);
      const pct = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
      setProgress(pct);
    };

    const handleScrollOrResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        calculateScroll();
        rafId = null;
      });
    };

    calculateScroll();

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleScrollOrResize);
      resizeObserver.observe(document.body);
    }

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [page]);

  if (!isScrollable) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[70] h-[2.5px] bg-transparent pointer-events-none overflow-hidden"
    >
      <div
        style={{
          width: `${progress}%`,
          background:
            'linear-gradient(90deg, #2E54F5 0%, #3FCFE6 55%, #3FD9B4 100%)',
          boxShadow: '0 0 10px rgba(63, 207, 230, 0.55)',
        }}
        className="h-full transition-[width] duration-75 ease-out"
      />
    </div>
  );
};
