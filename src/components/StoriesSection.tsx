import React, { useState } from 'react';
import { BookOpen, Feather, Sparkles, Plus, Calendar, MapPin, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import type { StoryItem } from '../types';
import { addStoryEntry } from '../services/firebaseService';

interface StoriesSectionProps {
  stories: StoryItem[];
  isAdmin: boolean;
  onStoryAdded: (story: StoryItem) => void;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  stories,
  isAdmin,
  onStoryAdded,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(`Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1}, ${new Date().getFullYear()}`);
  const [location, setLocation] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const newStory = await addStoryEntry({
        title: title.trim(),
        date: date.trim(),
        location: location.trim() || 'Hà Nội',
        excerpt: excerpt.trim() || content.trim().slice(0, 100) + '...',
        content: content.trim(),
        tags: tags.length ? tags : ['Kỷ niệm', 'Yêu thương'],
      });

      onStoryAdded(newStory);
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setExcerpt('');
      setTagsInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="stories-section" className="w-full my-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/70 text-[#E8B4B8] text-xs font-semibold uppercase tracking-wider mb-2">
              <Feather className="w-3.5 h-3.5 text-[#006994]" />
              <span>Chương hồi ký ức</span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
              Những Mẩu Chuyện Nhỏ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Ghi lại những trang nhật ký dịu dàng trên hành trình trưởng thành cùng nhau.
            </p>
          </div>

          {/* Admin Create Story Button */}
          {isAdmin && (
            <button
              id="btn-add-story"
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#006994] to-[#FFB7C5] shadow-sm hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Viết mẩu chuyện mới</span>
            </button>
          )}
        </div>

        {/* Story List */}
        <div className="space-y-5">
          {stories.map((story) => {
            const isExpanded = expandedId === story.id;
            return (
              <article
                key={story.id}
                className="glass-card rounded-2xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.78)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3 mb-3 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[#006994] font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {story.date}
                    </span>
                    {story.location && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-[#FFB7C5]" />
                        {story.location}
                      </span>
                    )}
                  </div>

                  {story.tags && story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {story.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 font-sans"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#1E293B] mb-2 hover:text-[#006994] transition-colors">
                  {story.title}
                </h3>

                <p className="text-sm text-slate-700 font-sans leading-relaxed">
                  {isExpanded ? story.content : story.excerpt}
                </p>

                <div className="mt-4 pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleExpand(story.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#006994] hover:text-[#028090] transition-colors"
                  >
                    <span>{isExpanded ? 'Thu gọn lại' : 'Đọc trọn vẹn câu chuyện'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-[11px] font-handwriting text-slate-400 text-base">
                    Quốc Bảo &amp; Lại Huệ
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Modal Viết mẩu chuyện mới (Admin only) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-100 text-[#E8B4B8]">
                  <Feather className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-display text-xl font-bold text-[#1E293B]">
                    Viết Mẩu Chuyện Mới
                  </h3>
                  <p className="text-xs text-slate-500">Kỷ niệm dành riêng cho hai đứa</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề mẩu chuyện *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Cơn mưa rào đầu hạ và tách socola nóng"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày tháng
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Địa điểm
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="VD: Đà Lạt"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lời mở đầu ngắn (Trích đoạn)
                </label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="VD: Buổi tối hôm đó gió lạnh tràn về..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung chi tiết *
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Kể lại chi tiết những cảm xúc, kỷ niệm đáng nhớ..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thẻ tags (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Đà Lạt, Kỷ niệm, Mưa"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  id="btn-submit-story"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#006994] to-[#FFB7C5] hover:opacity-95 rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Đăng mẩu chuyện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
