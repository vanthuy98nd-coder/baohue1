import React, { useState } from 'react';
import {
  X,
  Music,
  Plus,
  Trash2,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
  Youtube,
  HardDrive,
  FileAudio,
  Radio,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  detectMusicSource,
  extractYouTubeVideoId,
  extractGoogleDriveFileId,
} from '../utils/urlHelpers';
import { addMusicTrackToFirebase, deleteMusicTrackFromFirebase } from '../services/firebaseService';
import type { MusicTrack } from '../types';

interface AdminPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: MusicTrack[];
  currentTrackId?: string;
  isPlaying: boolean;
  onPlayTrack: (track: MusicTrack) => void;
  onTogglePlay: () => void;
  onPlaylistChanged?: () => void;
}

export const AdminPlaylistModal: React.FC<AdminPlaylistModalProps> = ({
  isOpen,
  onClose,
  playlist,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onTogglePlay,
  onPlaylistChanged,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [trackToDeleteId, setTrackToDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const detectedSource = detectMusicSource(urlInput);
  const detectedYtId = extractYouTubeVideoId(urlInput);
  const detectedDriveId = extractGoogleDriveFileId(urlInput);

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên bài hát.');
      return;
    }
    if (!urlInput.trim()) {
      setErrorMsg('Vui lòng dán đường dẫn nhạc (YouTube, Google Drive hoặc MP3).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await addMusicTrackToFirebase({
        title: title.trim(),
        artist: artist.trim() || 'Quốc Bảo & Lại Huệ Tuyển Chọn',
        url: urlInput.trim(),
        source: detectedSource,
        youtubeId: detectedYtId || undefined,
      });

      setSuccessMsg(`Đã thêm "${title}" vào danh sách phát đĩa than thành công!`);
      setTitle('');
      setArtist('');
      setUrlInput('');

      if (onPlaylistChanged) onPlaylistChanged();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể thêm bài hát. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (trackId: string) => {
    await deleteMusicTrackFromFirebase(trackId);
    setTrackToDeleteId(null);
    if (onPlaylistChanged) onPlaylistChanged();
  };

  return (
    <div
      id="admin-playlist-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <button
          id="btn-playlist-modal-close"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#006994] to-[#FFB7C5] p-[2px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-[#006994]">
              <Music className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-serif-display text-xl font-bold text-[#1E293B]">
              Quản Lý Playlist &amp; Thêm Bài Hát Đĩa Than
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Hỗ trợ link YouTube, Google Drive Audio và file nhạc MP3 trực tiếp
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Add new track form */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#006994] mb-3 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm bài hát mới vào đĩa than</span>
          </h4>

          <form onSubmit={handleAddTrack} className="space-y-3 font-sans text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên bài hát *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Cà Phê Một Mình, Nàng Thơ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên ca sĩ / Nghệ sĩ
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="VD: Hoàng Dũng, Vũ, Acoustic Band..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dán đường dẫn nhạc (Link MP3, Google Drive hoặc Link YouTube) *
              </label>
              <input
                id="music-url-input"
                type="text"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="VD: https://www.youtube.com/watch?v=... hoặc https://drive.google.com/file/d/... hoặc link .mp3"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white"
              />

              {/* Source detection preview */}
              {urlInput.trim() && (
                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <span className="text-slate-500">Định dạng nhận diện:</span>
                  {detectedSource === 'youtube' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                      <Youtube className="w-3 h-3 text-rose-600" />
                      <span>YouTube Video (ID: {detectedYtId})</span>
                    </span>
                  )}
                  {detectedSource === 'drive' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">
                      <HardDrive className="w-3 h-3 text-sky-600" />
                      <span>Google Drive Audio (ID: {detectedDriveId})</span>
                    </span>
                  )}
                  {detectedSource === 'mp3' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      <FileAudio className="w-3 h-3 text-emerald-600" />
                      <span>File MP3 Direct Stream</span>
                    </span>
                  )}
                  {detectedSource === 'synth' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                      <Radio className="w-3 h-3 text-amber-600" />
                      <span>Acoustic Lofi Synth</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                id="btn-add-music-submit"
                type="submit"
                disabled={isSubmitting || !title.trim() || !urlInput.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#006994] to-[#00A896] hover:opacity-95 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu bài hát...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Vào Danh Sách Phát</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Playlist Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-[#1E293B] flex items-center gap-1.5">
              <span>Danh sách bài hát hiện tại</span>
              <span className="text-xs font-normal text-slate-500 font-mono">
                ({playlist.length} bài)
              </span>
            </h4>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Đồng bộ Realtime Firestore
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {playlist.map((track, idx) => {
              const isCurrent = currentTrackId === track.id;
              return (
                <div
                  key={track.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-[#006994]/10 border-[#006994] text-[#006994]'
                      : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-semibold text-slate-400 w-5 text-center">
                      {idx + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (isCurrent) onTogglePlay();
                        else onPlayTrack(track);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                        isCurrent && isPlaying
                          ? 'bg-[#006994] text-white'
                          : 'bg-slate-100 hover:bg-[#006994] hover:text-white text-slate-600'
                      }`}
                      title={isCurrent && isPlaying ? 'Tạm dừng' : 'Phát bài này'}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="truncate">
                      <p className="font-semibold text-xs truncate text-[#1E293B]">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Source badge */}
                    {track.source === 'youtube' && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <Youtube className="w-3 h-3 text-rose-600" />
                        <span>YouTube</span>
                      </span>
                    )}
                    {track.source === 'drive' && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        <HardDrive className="w-3 h-3 text-sky-600" />
                        <span>Drive</span>
                      </span>
                    )}
                    {track.source === 'mp3' && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <FileAudio className="w-3 h-3 text-emerald-600" />
                        <span>MP3</span>
                      </span>
                    )}
                    {track.source === 'synth' && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Radio className="w-3 h-3 text-amber-600" />
                        <span>Synth</span>
                      </span>
                    )}

                    {/* Delete button (Admin only) */}
                    {trackToDeleteId === track.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(track.id)}
                          className="px-2 py-0.5 text-[10px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-xs"
                        >
                          Xóa
                        </button>
                        <button
                          type="button"
                          onClick={() => setTrackToDeleteId(null)}
                          className="px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTrackToDeleteId(track.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa bài hát"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
