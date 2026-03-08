'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimateIn({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`${className} ${visible ? 'animate-fade-up' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
}
