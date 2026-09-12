import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Send,
  Heart,
  Sparkles,
  User,
  Users,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Lock,
  CheckCircle2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GuestbookEntry } from '../types';
import { addGuestbookEntry, deleteGuestbookEntry } from '../services/firebaseService';

interface GuestbookSectionProps {
  entries: GuestbookEntry[];
  isAdmin?: boolean;
  onEntryAdded: (entry: GuestbookEntry) => void;
  onDeleteEntry?: (id: string) => void;
  onOpenAdminLogin?: () => void;
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
  onOpenAdminLogin,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Bạn bè thân thiết');
  const [message, setMessage] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('🌸');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const [likedEntries, setLikedEntries] = useState<Record<string, boolean>>({});

  // In-app deletion modal state (replaces window.confirm to avoid iframe sandbox blocking)
  const [entryToDelete, setEntryToDelete] = useState<GuestbookEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteGuestbookEntry(entryToDelete.id);
      if (onDeleteEntry) {
        onDeleteEntry(entryToDelete.id);
      }
      setSuccessToast(`Đã xóa thành công lời chúc của "${entryToDelete.name}".`);
      setTimeout(() => setSuccessToast(null), 3500);
      setEntryToDelete(null);
    } catch (err) {
      console.error('Delete guestbook entry failed:', err);
      setWarningMsg('Không thể xóa lời chúc. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLikeEntry = (id: string) => {
    setLikedEntries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="guestbook-section" className="w-full my-12 relative">
      {/* Delete Success Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white text-xs font-semibold rounded-2xl shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
          <span>{successToast}</span>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="ml-1 p-0.5 hover:bg-emerald-700 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Confirmation Modal for Wish Deletion */}
      {entryToDelete && (
        <div
          id="delete-wish-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => !isDeleting && setEntryToDelete(null)}
        >
          <div
            className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-display font-bold text-lg text-slate-800">
                  Xác nhận xóa lời chúc?
                </h3>
                <p className="text-xs text-slate-500">
                  Thao tác kiểm duyệt với tư cách Quản trị viên (Admin)
                </p>
              </div>
            </div>

            {/* Preview of the entry being deleted */}
            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs mb-5">
              <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                <span>{entryToDelete.name}</span>
                <span className="text-slate-500 font-normal text-[11px]">{entryToDelete.relationship}</span>
              </div>
              <p className="font-handwriting text-lg text-slate-700 italic line-clamp-3 my-1">
                "{entryToDelete.message}"
              </p>
              <div className="text-[10px] text-slate-400 mt-1">
                Ngày gửi: {entryToDelete.date}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn lời chúc này khỏi sổ lưu bút không? Thao tác này không thể hoàn tác.
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setEntryToDelete(null)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                id="btn-confirm-delete-wish"
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa vĩnh viễn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

          {/* Admin Mode Status Banner */}
          {isAdmin ? (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium shadow-xs animate-fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Quyền Admin đang bật:</strong> Nút <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">Xóa lời chúc</span> màu đỏ đã xuất hiện dưới mỗi tin nhắn để bạn kiểm duyệt.
              </span>
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-slate-600 text-xs">
              <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>
                Cô dâu / chú rể muốn quản lý hoặc xóa lời chúc?{' '}
                {onOpenAdminLogin && (
                  <button
                    type="button"
                    onClick={onOpenAdminLogin}
                    className="text-[#006994] font-semibold hover:underline cursor-pointer"
                  >
                    Đăng nhập Admin tại đây
                  </button>
                )}{' '}
                (Pass: <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-slate-300">baohue2026</code>)
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form to leave a wish (5 cols) */}
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
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all cursor-pointer ${
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

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                        <span>{entry.date}</span>

                        <div className="flex items-center gap-2.5">
                          {/* Admin Delete Button - Opens In-App Modal */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setEntryToDelete(entry)}
                              className="text-rose-600 hover:text-rose-800 flex items-center gap-1.5 font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1 rounded-xl transition-all cursor-pointer shadow-2xs"
                              title="Xóa lời chúc này khỏi sổ lưu bút"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Xóa lời chúc</span>
                            </button>
                          )}

                          {/* Heart Like Button */}
                          <button
                            type="button"
                            onClick={() => handleLikeEntry(entry.id)}
                            className={`flex items-center gap-1 transition-colors px-2 py-1 rounded-lg cursor-pointer ${
                              isLiked ? 'text-rose-500 font-medium bg-rose-50/50' : 'hover:text-rose-500'
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
