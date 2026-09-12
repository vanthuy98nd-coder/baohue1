import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc3,
  ListMusic,
  Youtube,
  HardDrive,
  FileAudio,
  Radio,
  Plus,
} from 'lucide-react';
import { musicController } from '../services/unifiedMusicController';
import type { MusicTrack } from '../types';

interface VinylPlayerProps {
  playlist: MusicTrack[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  isAdmin: boolean;
  onTogglePlay: () => void;
  onSelectTrack: (track: MusicTrack) => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onOpenPlaylistModal: () => void;
}

export const VinylPlayer: React.FC<VinylPlayerProps> = ({
  playlist,
  currentTrack,
  isPlaying,
  isAdmin,
  onTogglePlay,
  onSelectTrack,
  onNextTrack,
  onPrevTrack,
  onOpenPlaylistModal,
}) => {
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    musicController.setVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      const restore = volume || 0.4;
      musicController.setVolume(restore);
      setIsMuted(false);
    } else {
      musicController.setVolume(0);
      setIsMuted(true);
    }
  };

  const activeTrack = currentTrack || playlist[0];

  return (
    <section id="vinyl-player-section" className="w-full my-8">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-lg relative overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-gradient-to-br from-[#006994]/10 to-[#FFB7C5]/20 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
          {/* Turntable Vinyl Record View */}
          <div className="relative flex-shrink-0">
            {/* Turntable wood-metal base frame */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/90 p-4 border border-white shadow-inner flex items-center justify-center relative">
              {/* Rotating Vinyl Disc */}
              <div
                className={`w-48 h-48 sm:w-54 sm:h-54 rounded-full vinyl-disc relative flex items-center justify-center transition-transform duration-700 ${
                  isPlaying ? 'animate-spin-slow' : ''
                }`}
                style={{
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.06)',
                }}
              >
                {/* Vinyl Grooves rings */}
                <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />

                {/* Center Record Label */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-[#006994] via-[#028090] to-[#FFB7C5] p-[2px] shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#1A1816] flex flex-col items-center justify-center text-center p-1 border border-white/20">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-[#FFB7C5]">Bảo &amp; Huệ</span>
                    <span className="text-[7px] text-slate-300 font-serif">SIDE A</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/90 border border-slate-700 my-0.5" />
                    <span className="text-[6px] text-cyan-200">33⅓ RPM</span>
                  </div>
                </div>
              </div>

              {/* Tonearm (Kim đĩa than) */}
              <div
                className="absolute top-4 right-5 w-7 h-28 origin-top-right transition-transform duration-700 pointer-events-none z-10"
                style={{
                  transform: isPlaying ? 'rotate(26deg)' : 'rotate(0deg)',
                }}
              >
                {/* Pivot base */}
                <div className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 border border-amber-500 shadow-sm ml-auto" />
                {/* Metal arm */}
                <div className="w-1.5 h-20 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 mx-auto rounded-full shadow" />
                {/* Cartridge & Stylus head */}
                <div className="w-3.5 h-6 bg-slate-800 rounded-sm -ml-1 mt-0.5 shadow-sm border border-slate-600 flex items-center justify-center">
                  <div className="w-1 h-2 bg-rose-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Music Controls & Information */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-[11px] font-medium text-slate-700 border border-white/80">
                <Disc3 className="w-3.5 h-3.5 text-[#006994] animate-spin" style={{ animationDuration: '6s' }} />
                <span>Máy Hát Đĩa Than Cổ Điển</span>
              </div>

              {/* Source badge */}
              {activeTrack?.source === 'youtube' && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                  <Youtube className="w-3 h-3 text-rose-600" />
                  <span>YouTube Audio</span>
                </span>
              )}
              {activeTrack?.source === 'drive' && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">
                  <HardDrive className="w-3 h-3 text-sky-600" />
                  <span>Drive Audio</span>
                </span>
              )}
              {activeTrack?.source === 'mp3' && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  <FileAudio className="w-3 h-3 text-emerald-600" />
                  <span>MP3 Stream</span>
                </span>
              )}
              {activeTrack?.source === 'synth' && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                  <Radio className="w-3 h-3 text-amber-600" />
                  <span>Acoustic Synth</span>
                </span>
              )}

              {/* Admin Manage Playlist Button */}
              {isAdmin && (
                <button
                  id="btn-admin-manage-playlist"
                  type="button"
                  onClick={onOpenPlaylistModal}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#006994] to-[#00A896] text-white font-medium hover:opacity-95 shadow-xs transition-transform active:scale-95"
                >
                  <ListMusic className="w-3 h-3" />
                  <span>Quản lý Playlist &amp; Thêm bài</span>
                </button>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-serif-display font-bold text-[#1E293B] tracking-tight truncate">
              {activeTrack?.title || 'Kỷ Niệm Bên Tách Cà Phê'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5 truncate">
              {activeTrack?.artist || 'Quốc Bảo & Lại Huệ Tuyển Chọn'}
            </p>

            {/* Track progress simulation & chill sound wave */}
            <div className="my-3.5 flex items-center justify-center md:justify-start gap-1">
              {[40, 75, 55, 90, 65, 80, 45, 95, 70, 60, 85, 50, 75, 65].map((height, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying ? 'bg-gradient-to-t from-[#006994] to-[#FFB7C5]' : 'bg-slate-300'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(12, height * (isPlaying ? 0.35 : 0.15))}px` : '6px',
                    animation: isPlaying ? `pulse 1.2s ease-in-out infinite ${i * 0.1}s` : 'none',
                  }}
                />
              ))}
              <span className="text-[11px] text-slate-500 font-mono ml-3">
                {isPlaying ? 'Đĩa than đang xoay • Playing' : 'Đang tạm dừng'}
              </span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <button
                id="btn-vinyl-prev"
                type="button"
                onClick={onPrevTrack}
                className="p-2.5 rounded-full bg-white/70 hover:bg-white text-slate-700 hover:text-[#006994] border border-white shadow-sm transition-all"
                title="Bản nhạc trước"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                id="btn-vinyl-play"
                type="button"
                onClick={onTogglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#006994] to-[#00A896] hover:from-[#005577] hover:to-[#00897B] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all"
                title={isPlaying ? 'Tạm dừng đĩa than' : 'Hạ kim & Thả hồn theo nhạc'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              <button
                id="btn-vinyl-next"
                type="button"
                onClick={onNextTrack}
                className="p-2.5 rounded-full bg-white/70 hover:bg-white text-slate-700 hover:text-[#006994] border border-white shadow-sm transition-all"
                title="Bản nhạc kế tiếp"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-slate-300/60">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-slate-600 hover:text-[#006994] transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#006994]"
                  title="Âm lượng"
                />
              </div>

              {/* Playlist button for all users */}
              <button
                type="button"
                onClick={onOpenPlaylistModal}
                className="p-2 rounded-xl bg-white/70 hover:bg-white text-slate-600 border border-slate-200 text-xs flex items-center gap-1 ml-auto hidden sm:flex"
                title="Danh sách bài hát"
              >
                <ListMusic className="w-3.5 h-3.5 text-[#006994]" />
                <span className="text-[11px]">Playlist ({playlist.length})</span>
              </button>
            </div>

            {/* Quick Track list pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mt-3.5">
              {playlist.slice(0, 5).map((t, idx) => {
                const isSelected = activeTrack?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTrack(t)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all truncate max-w-[150px] ${
                      isSelected
                        ? 'bg-[#006994] text-white border-[#006994] shadow-xs'
                        : 'bg-white/50 text-slate-600 border-white/80 hover:bg-white'
                    }`}
                  >
                    {idx + 1}. {t.title}
                  </button>
                );
              })}
              {playlist.length > 5 && (
                <button
                  type="button"
                  onClick={onOpenPlaylistModal}
                  className="text-[11px] px-2 py-1 rounded-lg bg-white/40 text-slate-500 hover:text-slate-800"
                >
                  +{playlist.length - 5} bài khác...
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
