import React from 'react';
import { Heart, Sparkles, Film, Compass, Coffee } from 'lucide-react';

interface ScrapbookHeroProps {
  totalPhotos: number;
  totalLikes: number;
}

export const ScrapbookHero: React.FC<ScrapbookHeroProps> = ({ totalPhotos, totalLikes }) => {
  return (
    <section className="relative pt-6 pb-10 text-center max-w-4xl mx-auto px-4">
      {/* Mini top badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-medium text-slate-700 shadow-xs mb-4">
        <Sparkles className="w-3.5 h-3.5 text-[#FFB7C5]" />
        <span>Góc Nhỏ Kỷ Niệm • Scrapbook Yêu Thương</span>
        <span className="text-slate-300">•</span>
        <span className="text-[#006994] font-semibold">Since 2022</span>
      </div>

      {/* Main Title with Elegant Typography */}
      <h1 className="font-serif-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1E293B] leading-tight">
        Quốc Bảo <span className="text-[#FFB7C5] italic font-normal font-cormorant">&amp;</span> Lại Huệ
      </h1>

      {/* Poetic Subtitle */}
      <p className="font-handwriting text-2xl sm:text-3xl text-slate-700 mt-2 max-w-xl mx-auto leading-relaxed">
        "Một góc nhỏ lưu giữ từng cuộn phim, khoảnh khắc ngọt ngào và những buổi chiều bình yên bên nhau."
      </p>

      {/* Couple Milestone Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6">
        <div className="glass-card px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-slate-700 shadow-xs">
          <Film className="w-3.5 h-3.5 text-[#006994]" />
          <span>{totalPhotos} khoảnh khắc cuộn phim</span>
        </div>

        <div className="glass-card px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-slate-700 shadow-xs">
          <Coffee className="w-3.5 h-3.5 text-amber-600" />
          <span>Hơn 100+ quán cà phê ghé thăm</span>
        </div>

        <div className="glass-card px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-slate-700 shadow-xs">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>{totalLikes} lượt yêu thương</span>
        </div>
      </div>
    </section>
  );
};
