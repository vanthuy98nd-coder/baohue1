import React from 'react';
import { Lock, Unlock, Sparkles, Music2, Upload, BookOpen, Heart, HelpCircle, Database } from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  onOpenUploadModal: () => void;
  onOpenDeployGuide: () => void;
  onOpenFirebaseConfig: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  totalPhotos: number;
  totalStories?: number;
  totalWishes: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenUploadModal,
  onOpenDeployGuide,
  onOpenFirebaseConfig,
  isMusicPlaying,
  onToggleMusic,
  totalPhotos,
  totalWishes,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <nav
          id="main-navbar"
          className="glass-panel rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm"
        >
          {/* Brand & Names */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#006994] to-[#FFB7C5] p-[1.5px] shadow-sm flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#006994]">
                <Heart className="w-4 h-4 fill-[#FFB7C5] text-[#006994]" />
              </div>
            </div>
            <div>
              <a href="#" className="font-serif-display font-semibold text-lg sm:text-xl tracking-tight text-[#1E293B] hover:text-[#006994] transition-colors flex items-center gap-2">
                Quốc Bảo <span className="text-[#FFB7C5] font-light">&amp;</span> Lại Huệ
              </a>
              <p className="text-[11px] text-slate-500 font-sans tracking-wide hidden sm:block">
                Visual Journal • Our Love Scrapbook
              </p>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#album-section" className="hover:text-[#006994] transition-colors flex items-center gap-1.5">
              <span>Cuộn phim</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-cyan-100 text-[#006994]">{totalPhotos}</span>
            </a>
            <a href="#guestbook-section" className="hover:text-[#006994] transition-colors flex items-center gap-1.5">
              <span>Sổ lưu bút</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700">{totalWishes}</span>
            </a>
          </div>

          {/* Action buttons & Music pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Music Player Toggle */}
            <button
              id="btn-nav-music-toggle"
              type="button"
              onClick={onToggleMusic}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isMusicPlaying
                  ? 'bg-gradient-to-r from-[#006994] to-[#028090] text-white shadow-sm'
                  : 'bg-white/70 hover:bg-white text-slate-700 border border-slate-200/80'
              }`}
              title={isMusicPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc đĩa than acoustic'}
            >
              <Music2 className={`w-3.5 h-3.5 ${isMusicPlaying ? 'animate-bounce text-[#FFB7C5]' : ''}`} />
              <span className="hidden sm:inline">
                {isMusicPlaying ? 'Đang phát đĩa than' : 'Acoustic lofi'}
              </span>
              {isMusicPlaying && (
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-0.5 h-3 bg-white/90 animate-pulse" />
                  <span className="w-0.5 h-2 bg-white/90 animate-pulse delay-75" />
                  <span className="w-0.5 h-3 bg-white/90 animate-pulse delay-150" />
                </span>
              )}
            </button>

            {/* Admin Upload Button (Visible only when unlocked) */}
            {isAdmin && (
              <button
                id="btn-nav-admin-upload"
                type="button"
                onClick={onOpenUploadModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#006994] to-[#FFB7C5] text-white shadow-sm hover:opacity-95 transition-opacity"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tải ảnh mới</span>
              </button>
            )}

            {/* Deploy & Setup Guide Helper */}
            <button
              id="btn-nav-deploy-guide"
              type="button"
              onClick={onOpenDeployGuide}
              className="p-2 rounded-full text-slate-500 hover:text-[#006994] hover:bg-white/80 transition-colors"
              title="Hướng dẫn Deploy Vercel/Netlify & Firebase Free"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Firebase Config Modal Button */}
            <button
              id="btn-nav-firebase-config"
              type="button"
              onClick={onOpenFirebaseConfig}
              className="p-2 rounded-full text-slate-500 hover:text-amber-600 hover:bg-white/80 transition-colors"
              title="Cấu hình Firebase Realtime"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Discrete Lock Button for Admin Access */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
                <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Admin Bảo &amp; Huệ
                </span>
                <button
                  id="btn-nav-admin-logout"
                  type="button"
                  onClick={onLogoutAdmin}
                  className="p-2 rounded-full text-emerald-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Khóa lại / Đăng xuất Admin"
                >
                  <Unlock className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-nav-admin-lock"
                type="button"
                onClick={onOpenAdminLogin}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors opacity-70 hover:opacity-100"
                title="Quản trị viên đăng nhập (baohue2026)"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
