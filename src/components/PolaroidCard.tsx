import React, { useState } from 'react';
import { Heart, MapPin, Calendar, Camera, Trash2, ZoomIn } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PhotoItem } from '../types';

interface PolaroidCardProps {
  photo: PhotoItem;
  isAdmin: boolean;
  onOpenLightbox: (photo: PhotoItem) => void;
  onLikePhoto: (photoId: string) => void;
  onDeletePhoto?: (photoId: string) => void;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  photo,
  isAdmin,
  onOpenLightbox,
  onLikePhoto,
  onDeletePhoto,
}) => {
  const [isLikedLocally, setIsLikedLocally] = useState(false);
  const [likesCount, setLikesCount] = useState(photo.likes || 0);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLikedLocally) {
      setIsLikedLocally(true);
      setLikesCount((prev) => prev + 1);
      onLikePhoto(photo.id);

      // Trigger delightful mini heart confetti
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 18,
        spread: 45,
        origin: { x, y },
        colors: ['#FFB7C5', '#006994', '#FFCAD4', '#80CBC4'],
        shapes: ['circle'],
        scalar: 0.8,
        disableForReducedMotion: true,
      });
    }
  };

  const rotationAngle = photo.rotation || 0;

  const washiTapeClass =
    photo.tapeType === 'sakura'
      ? 'washi-tape-sakura'
      : photo.tapeType === 'ocean'
      ? 'washi-tape-ocean'
      : 'washi-tape-mint';

  return (
    <div
      className="group relative transition-all duration-300 transform hover:scale-[1.02] hover:z-20 cursor-pointer"
      style={{
        transform: `rotate(${rotationAngle}deg)`,
      }}
      onClick={() => onOpenLightbox(photo)}
    >
      {/* Decorative Washi Tape at Top */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6.5 z-10 rounded-xs shadow-xs pointer-events-none opacity-90 ${washiTapeClass}`}
        style={{
          transform: `rotate(${(rotationAngle * -1.5).toFixed(1)}deg)`,
        }}
      />

      {/* Polaroid Frame with Frosted Glassmorphism */}
      <div
        className="glass-card rounded-2xl p-3.5 pb-5 polaroid-shadow group-hover:polaroid-shadow-hover transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        {/* Photo Canvas Frame */}
        <div className="relative aspect-4/3 sm:aspect-square w-full rounded-xl overflow-hidden bg-slate-100 shadow-inner group/img">
          <img
            src={photo.url}
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Hover Overlay with Zoom indicator */}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
            <span className="p-2.5 rounded-full bg-white/80 text-slate-800 shadow-md backdrop-blur-xs flex items-center gap-1.5 text-xs font-medium">
              <ZoomIn className="w-4 h-4 text-[#006994]" /> Phóng to cuộn phim
            </span>
          </div>

          {/* Film format badge */}
          {photo.camera && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono flex items-center gap-1">
              <Camera className="w-2.5 h-2.5 text-[#FFB7C5]" />
              <span className="truncate max-w-[130px]">{photo.camera.split('•')[0]}</span>
            </div>
          )}
        </div>

        {/* Polaroid Chin / Handwritten Captions */}
        <div className="pt-3.5 px-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-handwriting text-xl sm:text-2xl font-bold text-[#1E293B] leading-tight tracking-wide">
              {photo.title}
            </h4>

            {/* Like heart button */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-transform active:scale-125 ${
                isLikedLocally
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/60'
              }`}
              title="Thả tim cho bức ảnh"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isLikedLocally ? 'fill-rose-500 text-rose-500' : 'text-slate-400 group-hover:text-rose-500'
                }`}
              />
              <span className="font-mono text-[11px]">{likesCount}</span>
            </button>
          </div>

          {/* Handwritten Note snippet */}
          {photo.note && (
            <p className="font-handwriting text-base sm:text-lg text-slate-700 mt-1 line-clamp-2 leading-snug">
              "{photo.note}"
            </p>
          )}

          {/* Metadata pill footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-500 font-sans">
            <div className="flex items-center gap-1 truncate max-w-[160px]" title={photo.location}>
              <MapPin className="w-3 h-3 text-[#006994] flex-shrink-0" />
              <span className="truncate">{photo.location}</span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Calendar className="w-3 h-3 text-[#FFB7C5]" />
              <span>{photo.date}</span>
            </div>
          </div>

          {/* Admin delete action */}
          {isAdmin && onDeletePhoto && (
            <div className="mt-2.5 pt-2 border-t border-dashed border-rose-200 flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Xóa bức ảnh "${photo.title}"?`)) {
                    onDeletePhoto(photo.id);
                  }
                }}
                className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-0.5 rounded transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa ảnh (Admin)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
