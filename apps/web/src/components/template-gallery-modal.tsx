"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

type TemplateGalleryModalProps = {
  images: string[];
  title: string;
};

export function TemplateGalleryModal({ images, title }: TemplateGalleryModalProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  function open(index: number) {
    setActiveIndex(index);
  }

  function close() {
    setActiveIndex(null);
  }

  function previous() {
    setActiveIndex((current) => current === null ? 0 : (current - 1 + images.length) % images.length);
  }

  function next() {
    setActiveIndex((current) => current === null ? 0 : (current + 1) % images.length);
  }

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex]);

  if (!images.length) return null;

  return (
    <>
      <div className="template-album-grid">
        {images.map((src, index) => (
          <button className="template-album-item" key={`${src}-${index}`} onClick={() => open(index)} type="button">
            <img src={src} alt={`${title} - hình ${index + 1}`} />
            <span><Maximize2 size={16} /> Xem ảnh</span>
          </button>
        ))}
      </div>

      {activeImage && activeIndex !== null && (
        <div aria-modal="true" className="gallery-modal" role="dialog">
          <button aria-label="Đóng album" className="gallery-backdrop" onClick={close} type="button" />
          <div className="gallery-panel">
            <div className="gallery-topbar">
              <div>
                <strong>{title}</strong>
                <span>{activeIndex + 1}/{images.length}</span>
              </div>
              <button aria-label="Đóng" onClick={close} type="button"><X size={22} /></button>
            </div>

            <div className="gallery-stage">
              {images.length > 1 && <button aria-label="Ảnh trước" className="gallery-arrow left" onClick={previous} type="button"><ChevronLeft size={28} /></button>}
              <img src={activeImage} alt={`${title} - ảnh lớn ${activeIndex + 1}`} />
              {images.length > 1 && <button aria-label="Ảnh sau" className="gallery-arrow right" onClick={next} type="button"><ChevronRight size={28} /></button>}
            </div>

            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((src, index) => (
                  <button className={index === activeIndex ? "active" : ""} key={`thumb-${src}-${index}`} onClick={() => open(index)} type="button">
                    <img src={src} alt={`${title} - thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
