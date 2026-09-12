import React from 'react';
import { Heart, Lock, HelpCircle } from 'lucide-react';

interface FooterProps {
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onOpenDeployGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  isAdmin,
  onOpenAdminLogin,
  onOpenDeployGuide,
}) => {
  return (
    <footer className="w-full mt-16 pb-12 pt-8 text-center text-xs text-slate-500 font-sans border-t border-white/60 relative">
      <div className="max-w-4xl mx-auto px-4 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-slate-300" />
          <Heart className="w-4 h-4 fill-[#FFB7C5] text-[#006994]" />
          <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-slate-300" />
        </div>

        <p className="font-handwriting text-xl text-slate-700">
          Từng bức ảnh, từng mẩu chuyện đều được ghi lại bằng tình yêu chân thành.
        </p>

        <p className="text-slate-400">
          © {new Date().getFullYear()} Quốc Bảo &amp; Lại Huệ — Visual Journal &amp; Love Scrapbook.
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] pt-1 text-slate-500">
          <button
            type="button"
            onClick={onOpenDeployGuide}
            className="hover:text-[#006994] transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Hướng dẫn Deploy &amp; Firebase</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="hover:text-[#006994] transition-colors flex items-center gap-1 opacity-70 hover:opacity-100"
          >
            <Lock className="w-3 h-3" />
            <span>{isAdmin ? 'Đã mở khóa Admin' : 'Cổng Quản trị (Ổ khóa)'}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
