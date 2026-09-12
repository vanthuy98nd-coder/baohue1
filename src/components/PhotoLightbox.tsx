import React, { useEffect } from 'react';
import { X, Heart, MapPin, Calendar, Camera, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PhotoItem } from '../types';

interface PhotoLightboxProps {
  photo: PhotoItem | null;
  onClose: () => void;
  onLikePhoto: (photoId: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  onClose,
  onLikePhoto,
  onNext,
  onPrev,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!photo) return null;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikePhoto(photo.id);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#FFB7C5', '#006994', '#E8B4B8', '#00A896'],
      shapes: ['circle'],
    });
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'trip': return 'Chuyến đi xa';
      case 'cafe': return 'Tiệm cà phê';
      case 'daily': return 'Đời thường';
      case 'film35mm': return 'Film 35mm';
      default: return 'Kỷ niệm';
    }
  };

  return (
    <div
      id="photo-lightbox-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Lightbox Modal Card */}
      <div
        className="glass-panel w-full max-w-4xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Close button */}
        <button
          id="btn-lightbox-close"
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 shadow-sm transition-all"
          title="Đóng xem ảnh (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Previous Button */}
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/70 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs transition-all"
            title="Ảnh trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Button */}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-3 md:right-[380px] top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/70 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs transition-all"
            title="Ảnh tiếp theo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Big Image Section */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[55vh] md:max-h-[85vh] relative overflow-hidden">
          <img
            src={photo.url}
            alt={photo.title}
            className="w-full h-full object-contain max-h-[82vh]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Details & Captions Panel */}
        <div className="w-full md:w-[360px] p-6 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[40vh] md:max-h-[85vh] bg-white/70">
          <div>
            {/* Category tag */}
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#006994]/10 text-[#006994] border border-[#006994]/20">
                <Tag className="w-2.5 h-2.5" />
                {getCategoryLabel(photo.category)}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-sans">{photo.date}</span>
            </div>

            {/* Title */}
            <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1E293B] tracking-tight">
              {photo.title}
            </h3>

            {/* Poetic handwritten note */}
            {photo.note && (
              <div className="my-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-100/80">
                <p className="font-handwriting text-xl text-slate-800 leading-relaxed">
                  "{photo.note}"
                </p>
                <div className="text-right text-[11px] font-sans text-amber-800/70 mt-1">
                  — Nhật ký ảnh Bảo &amp; Huệ
                </div>
              </div>
            )}

            {/* Photo Specifications */}
            <div className="space-y-2 text-xs text-slate-600 font-sans mt-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#006994]" />
                <span className="font-medium text-slate-700">Địa điểm:</span>
                <span>{photo.location}</span>
              </div>

              {photo.camera && (
                <div className="flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-[#FFB7C5]" />
                  <span className="font-medium text-slate-700">Máy ảnh &amp; Film:</span>
                  <span>{photo.camera}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-medium text-slate-700">Thời gian:</span>
                <span>{photo.date}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-between">
            <button
              id="btn-lightbox-like"
              type="button"
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-medium text-xs transition-all active:scale-95"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Thả tim ({photo.likes})</span>
            </button>

            <span className="text-[11px] text-slate-400 font-sans italic">
              Bảo &amp; Huệ Scrapbook
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
