"use client";
import { useEffect, useRef } from "react";

export default function Petals({ count = 30 }: { count?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const nodes: HTMLDivElement[] = [];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "petal";
      const sz = 8 + Math.random() * 8;
      el.style.left = Math.random() * 100 + "%";
      el.style.width = sz + "px";
      el.style.height = sz * 1.3 + "px";
      el.style.animationDelay = Math.random() * 22 + "s";
      el.style.animationDuration = 9 + Math.random() * 13 + "s";
      el.style.opacity = String(0.25 + Math.random() * 0.3);
      c.appendChild(el);
      nodes.push(el);
    }
    return () => {
      nodes.forEach((n) => n.remove());
    };
  }, [count]);

  return (
    <>
      <style>{`
        .petals {
          position: fixed; inset: 0;
          pointer-events: none; overflow: hidden;
          z-index: 4;
        }
        .petal {
          position: absolute; top: -20px;
          border-radius: 0 60% 60% 60%;
          background: #F4B8A8;
          animation: fallPetal linear infinite;
          opacity: 0;
          will-change: transform, top, opacity;
        }
        @keyframes fallPetal {
          0%   { opacity: 0; top: -20px; transform: rotate(0deg) translateX(0) }
          10%  { opacity: .55 }
          90%  { opacity: .2 }
          100% { opacity: 0; top: 110vh; transform: rotate(540deg) translateX(60px) }
        }
        @media (prefers-reduced-motion: reduce) {
          .petals { display: none; }
        }
      `}</style>
      <div ref={ref} className="petals" aria-hidden="true" />
    </>
  );
}
