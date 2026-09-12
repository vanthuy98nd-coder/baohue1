import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Send,
  Heart,
  Sparkles,
  User,
  Users,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GuestbookEntry } from '../types';
import { addGuestbookEntry, deleteGuestbookEntry } from '../services/firebaseService';

interface GuestbookSectionProps {
  entries: GuestbookEntry[];
  isAdmin?: boolean;
  onEntryAdded: (entry: GuestbookEntry) => void;
  onDeleteEntry?: (id: string) => void;
}

// Basic list of offensive / spam patterns to prevent vandalism
const INAPPROPRIATE_WORDS = [
  'chó', 'đm', 'đmm', 'vcl', 'cl', 'đcm', 'địt', 'lồn', 'buồi', 'cặc', 'cc',
  'óc chó', 'ngu', 'mất dạy', 'khốn nạn', 'đĩ', 'phò', 'đéo', 'dcm', 'vcc'
];

export const GuestbookSection: React.FC<GuestbookSectionProps> = ({
  entries,
  isAdmin = false,
  onEntryAdded,
  onDeleteEntry,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Bạn bè thân thiết');
  const [message, setMessage] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('🌸');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const [likedEntries, setLikedEntries] = useState<Record<string, boolean>>({});

  const stickers = ['🌸', '💖', '📷', '✨', '☕', '💌', '🌿', '🕊️'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarningMsg('');

    if (!name.trim() || !message.trim()) {
      setWarningMsg('Vui lòng điền tên và lời chúc của bạn nhé.');
      return;
    }

    // Check for inappropriate words to protect against vandalism
    const lowerContent = (name + ' ' + message).toLowerCase();
    const hasBadWord = INAPPROPRIATE_WORDS.some((word) =>
      new RegExp(`\\b${word}\\b`, 'i').test(lowerContent)
    );

    if (hasBadWord) {
      setWarningMsg(
        'Lời chúc chứa từ ngữ chưa phù hợp. Vui lòng gửi những lời nhắn lịch sự, văn minh và yêu thương đến Bảo & Huệ nhé ❤️'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const newEntry = await addGuestbookEntry({
        name: name.trim(),
        relationship: relationship.trim(),
        message: message.trim(),
        date: new Date().toLocaleDateString('vi-VN'),
        sticker: selectedSticker,
      });

      onEntryAdded(newEntry);
      setName('');
      setMessage('');

      // Celebrate wish submission with confetti
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFB7C5', '#006994', '#FFCAD4', '#00A896'],
      });
    } catch (err) {
      console.error(err);
      setWarningMsg('Không thể gửi lời chúc lúc này. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entry: GuestbookEntry) => {
    const confirmed = window.confirm(
      `[ADMIN] Bạn có chắc muốn xóa vĩnh viễn lời chúc của "${entry.name}" không?\n\nNội dung: "${entry.message}"`
    );
    if (confirmed) {
      await deleteGuestbookEntry(entry.id);
      if (onDeleteEntry) {
        onDeleteEntry(entry.id);
      }
    }
  };

  const handleLikeEntry = (id: string) => {
    setLikedEntries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="guestbook-section" className="w-full my-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/70 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <MessageSquareHeart className="w-3.5 h-3.5 text-[#006994]" />
            <span>Góc gửi gắm yêu thương</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
            Sổ Lưu Bút Kỷ Niệm
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
            Dành tặng Quốc Bảo &amp; Lại Huệ những lời chúc, nhắn nhủ ngọt ngào nhất của bạn nhé!
          </p>

          {/* Admin Mode Badge Notice */}
          {isAdmin && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-fade-in">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Quyền Admin đang bật: Bạn có toàn quyền kiểm duyệt và bấm nút <strong>Xóa</strong> bất kỳ lời chúc nào không mong muốn.
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form to leave a wish (4 cols) */}
          <div className="lg:col-span-5">
            <div
              className="glass-panel rounded-3xl p-6 sm:p-7 shadow-md relative"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <h3 className="font-serif-display text-lg font-bold text-[#1E293B] mb-1 flex items-center gap-2">
                <span>Viết lời chúc lưu bút</span>
                <span className="text-sm">✍️</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Lời nhắn của bạn sẽ được lưu giữ vĩnh viễn trên trang nhật ký này.
              </p>

              {warningMsg && (
                <div className="mb-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                  <span className="leading-relaxed">{warningMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên hoặc biệt danh của bạn *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="VD: Trâm Anh / Minh Quân"
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mối quan hệ với Bảo &amp; Huệ
                  </label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans"
                    >
                      <option value="Bạn bè thân thiết">Bạn bè thân thiết</option>
                      <option value="Gia đình / Người thân">Gia đình / Người thân</option>
                      <option value="Hội anh em máy film">Hội anh em máy film</option>
                      <option value="Đồng nghiệp vui tính">Đồng nghiệp vui tính</option>
                      <option value="Người quen mến mộ">Người quen mến mộ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chọn tem dán (Sticker xinh)
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {stickers.map((stk) => (
                      <button
                        key={stk}
                        type="button"
                        onClick={() => setSelectedSticker(stk)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all ${
                          selectedSticker === stk
                            ? 'bg-[#006994] text-white scale-110 shadow-xs'
                            : 'bg-white/80 hover:bg-white border border-slate-200'
                        }`}
                      >
                        {stk}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lời chúc gửi đến Bảo &amp; Huệ *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Gửi gắm những lời chúc hạnh phúc, bình yên và vui vẻ nhất..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans"
                  />
                </div>

                <button
                  id="btn-submit-guestbook"
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !message.trim()}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-gradient-to-r from-[#006994] to-[#FFB7C5] hover:opacity-95 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Đang dán vào sổ lưu bút...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Gửi Lời Chúc Yêu Thương
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* List of guest wishes (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            {entries.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center text-slate-500 text-sm">
                Chưa có lời chúc nào trong sổ. Hãy là người đầu tiên gửi lời chúc nhé!
              </div>
            ) : (
              entries.map((entry) => {
                const isLiked = likedEntries[entry.id];
                return (
                  <div
                    key={entry.id}
                    className="glass-card rounded-2xl p-4.5 sm:p-5 shadow-xs hover:shadow-sm transition-all duration-300 relative border border-white/90 group"
                    style={{
                      background: 'rgba(255, 255, 255, 0.82)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    {/* Sticker stamp */}
                    <div className="absolute top-4 right-4 text-2xl filter drop-shadow-xs select-none">
                      {entry.sticker || '🌸'}
                    </div>

                    <div className="pr-10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-[#1E293B]">
                          {entry.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#006994]/10 text-[#006994] font-medium">
                          {entry.relationship}
                        </span>
                      </div>

                      <p className="font-handwriting text-xl sm:text-2xl text-slate-700 leading-snug my-2">
                        "{entry.message}"
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                        <span>{entry.date}</span>

                        <div className="flex items-center gap-3">
                          {/* Admin Delete Button */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(entry)}
                              className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors"
                              title="Xóa lời chúc này (Quyền Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa lời chúc</span>
                            </button>
                          )}

                          {/* Heart Like Button */}
                          <button
                            type="button"
                            onClick={() => handleLikeEntry(entry.id)}
                            className={`flex items-center gap-1 transition-colors ${
                              isLiked ? 'text-rose-500 font-medium' : 'hover:text-rose-500'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                            <span>Thả tim</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
