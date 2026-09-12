import React from 'react';
import { Compass, Coffee, HeartHandshake, Film, LayoutGrid } from 'lucide-react';
import type { PhotoCategory } from '../types';

interface CategoryFilterProps {
  currentCategory: PhotoCategory;
  onSelectCategory: (category: PhotoCategory) => void;
  counts: Record<PhotoCategory, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  currentCategory,
  onSelectCategory,
  counts,
}) => {
  const tabs: { id: PhotoCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tất cả', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'trip', label: 'Chuyến đi xa', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'cafe', label: 'Tiệm cà phê', icon: <Coffee className="w-3.5 h-3.5" /> },
    { id: 'daily', label: 'Đời thường', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
    { id: 'film35mm', label: 'Film 35mm', icon: <Film className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center justify-center my-6 px-2">
      <div className="glass-panel p-1.5 rounded-2xl flex flex-wrap items-center justify-center gap-1.5 shadow-sm max-w-full">
        {tabs.map((tab) => {
          const isActive = currentCategory === tab.id;
          return (
            <button
              key={tab.id}
              id={`filter-tab-${tab.id}`}
              type="button"
              onClick={() => onSelectCategory(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#006994] to-[#028090] text-white shadow-sm scale-102'
                  : 'text-slate-600 hover:text-[#006994] hover:bg-white/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {counts[tab.id] || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
