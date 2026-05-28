"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalSliderWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalSliderWrapper({ children, className }: HorizontalSliderWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    
    // Show prev button if we have scrolled right by more than 10px
    setShowPrev(el.scrollLeft > 10);
    
    // Show next button if we have more content to scroll to the right
    const maxScroll = el.scrollWidth - el.clientWidth;
    setShowNext(el.scrollLeft < maxScroll - 10);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check scroll on init and event listeners
    el.addEventListener("scroll", checkScroll, { passive: true });
    
    // Delay to let layout render completely
    const timeoutId = setTimeout(checkScroll, 300);
    
    // Listen to resize to re-check
    window.addEventListener("resize", checkScroll);

    // Mutation observer to re-check if children load dynamically
    const observer = new MutationObserver(checkScroll);
    observer.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener("scroll", checkScroll);
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkScroll);
      observer.disconnect();
    };
  }, [children]);

  const handleScroll = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;

    // Scroll by 80% of the visible container width
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative-slider-wrapper">
      {showPrev && (
        <button
          type="button"
          className="slider-nav-btn prev"
          onClick={() => handleScroll("left")}
          aria-label="Xem hình trước"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {showNext && (
        <button
          type="button"
          className="slider-nav-btn next"
          onClick={() => handleScroll("right")}
          aria-label="Xem hình tiếp theo"
        >
          <ChevronRight size={22} />
        </button>
      )}
      <div ref={containerRef} className={className}>
        {children}
      </div>
    </div>
  );
}
