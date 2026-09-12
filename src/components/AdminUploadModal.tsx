import React, { useState } from 'react';
import {
  X,
  Link as LinkIcon,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Upload,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  convertToGoogleDriveDirectImageUrl,
  extractGoogleDriveFileId,
} from '../utils/urlHelpers';
import { compressImageToUnder500KB, type CompressionResult } from '../services/imageCompressor';
import { savePhotoMetadata } from '../services/firebaseService';
import type { PhotoItem } from '../types';

interface AdminUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoAdded: (photo: PhotoItem) => void;
}

export const AdminUploadModal: React.FC<AdminUploadModalProps> = ({
  isOpen,
  onClose,
  onPhotoAdded,
}) => {
  // Mode: 'drive' (primary requested) or 'upload' (from device)
  const [inputMode, setInputMode] = useState<'drive' | 'device'>('drive');

  // Google Drive state
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [resolvedImageUrl, setResolvedImageUrl] = useState('');
  const [detectedFileId, setDetectedFileId] = useState<string | null>(null);

  // Device file upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // General form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'trip' | 'cafe' | 'daily' | 'film35mm'>('trip');
  const [date, setDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [location, setLocation] = useState('');
  const [camera, setCamera] = useState('');
  const [note, setNote] = useState('');
  const [tapeType, setTapeType] = useState<'mint' | 'sakura' | 'ocean'>('sakura');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle Google Drive Link change with instant conversion
  const handleDriveUrlChange = (rawUrl: string) => {
    setDriveUrlInput(rawUrl);
    setErrorMsg('');

    if (!rawUrl.trim()) {
      setResolvedImageUrl('');
      setDetectedFileId(null);
      return;
    }

    const fileId = extractGoogleDriveFileId(rawUrl);
    if (fileId) {
      const directUrl = convertToGoogleDriveDirectImageUrl(rawUrl);
      setDetectedFileId(fileId);
      setResolvedImageUrl(directUrl);
    } else if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      // Direct image URL
      setDetectedFileId(null);
      setResolvedImageUrl(rawUrl.trim());
    } else {
      setDetectedFileId(null);
      setResolvedImageUrl('');
    }
  };

  // Handle device file upload with < 500KB compressor
  const handleDeviceFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn file hình ảnh (JPG, PNG, WebP).');
      return;
    }
    setErrorMsg('');
    setSelectedFile(file);
    setIsCompressing(true);

    try {
      const result = await compressImageToUnder500KB(file);
      setCompressionResult(result);
      setResolvedImageUrl(result.dataUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg('Lỗi nén ảnh từ máy tính. Thử lại với ảnh khác nhé.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resolvedImageUrl) {
      setErrorMsg(
        inputMode === 'drive'
          ? 'Vui lòng dán link chia sẻ ảnh từ Google Drive hợp lệ.'
          : 'Vui lòng chọn ảnh từ máy tính.'
      );
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên / tiêu đề khoảnh khắc.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newPhoto = await savePhotoMetadata({
        title: title.trim(),
        url: resolvedImageUrl,
        category,
        date: date.trim() || new Date().toLocaleDateString('vi-VN'),
        location: location.trim() || 'Hà Nội / Việt Nam',
        camera: camera.trim() || 'Olympus OM-1 • Kodak ColorPlus 200',
        note: note.trim() || 'Những ngày nắng thật đẹp bên nhau.',
        tapeType,
        likes: 0,
        rotation: (Math.random() - 0.5) * 4, // subtle -2 to 2 tilt
      });

      onPhotoAdded(newPhoto);

      // Reset and close
      onClose();
      setTitle('');
      setDriveUrlInput('');
      setResolvedImageUrl('');
      setDetectedFileId(null);
      setSelectedFile(null);
      setCompressionResult(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể lưu ảnh. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="admin-upload-backdrop"
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
          id="btn-upload-modal-close"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#006994] to-[#FFB7C5] text-white shadow-sm">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-display text-xl font-bold text-[#1E293B]">
              Thêm Bức Ảnh Kỷ Niệm Mới
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Dành riêng cho Bảo &amp; Huệ cập nhật album nhật ký
            </p>
          </div>
        </div>

        {/* Mode Selector: Google Drive (Primary) or Device Upload */}
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 mb-4 max-w-md">
          <button
            type="button"
            onClick={() => setInputMode('drive')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              inputMode === 'drive'
                ? 'bg-white text-[#006994] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Dán link Google Drive</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('device')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              inputMode === 'device'
                ? 'bg-white text-[#006994] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Chọn file từ máy tính</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SECTION: Image Input */}
          {inputMode === 'drive' ? (
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#006994]" />
                  <span>Dán link ảnh từ Google Drive *</span>
                </label>
                <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                  Tự động chuyển Direct Link
                </span>
              </div>

              <input
                id="google-drive-link-input"
                type="text"
                value={driveUrlInput}
                onChange={(e) => handleDriveUrlChange(e.target.value)}
                placeholder="VD: https://drive.google.com/file/d/1a2b3c4d5e.../view?usp=sharing"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans text-slate-800"
              />

              <div className="text-[11px] text-slate-500 space-y-1">
                <p className="flex items-center gap-1 text-slate-600">
                  <HelpCircle className="w-3 h-3 text-[#006994] flex-shrink-0" />
                  <span>Hỗ trợ mọi link Drive (Bảo &amp; Huệ nhớ để chế độ <strong>"Bất kỳ ai có đường liên kết đều có thể xem"</strong> nhé).</span>
                </p>
                {detectedFileId && (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] break-all">
                    ✓ File ID: <strong>{detectedFileId}</strong> ➔ Direct Link:{' '}
                    <span className="text-blue-700 underline">{resolvedImageUrl}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Chọn file ảnh từ máy tính (Tự động nén &lt; 500KB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleDeviceFile(e.target.files[0]);
                  }
                }}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#006994] file:text-white hover:file:bg-[#005577] cursor-pointer"
              />
              {isCompressing && (
                <div className="text-xs text-[#006994] flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Đang nén ảnh xuống dưới 500KB chuẩn web...</span>
                </div>
              )}
              {compressionResult && (
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] flex items-center justify-between">
                  <span>Kích thước gốc: {compressionResult.originalSizeKB}KB</span>
                  <span className="font-bold">Đã nén còn: {compressionResult.compressedSizeKB}KB ({compressionResult.compressionRatio}%)</span>
                </div>
              )}
            </div>
          )}

          {/* Image Preview inside Mini Polaroid */}
          {resolvedImageUrl && (
            <div className="flex justify-center my-3">
              <div className="bg-white p-3 pb-6 rounded-xl shadow-md border border-slate-200 max-w-[220px] text-center">
                <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden relative">
                  <img
                    src={resolvedImageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setErrorMsg(
                        'Không thể tải ảnh. Hãy kiểm tra xem file Google Drive đã được bật quyền "Bất kỳ ai có liên kết đều có thể xem" chưa nhé!'
                      );
                    }}
                  />
                </div>
                <p className="font-handwriting text-base text-slate-700 mt-2 truncate">
                  {title || 'Xem trước khung ảnh Polaroid'}
                </p>
              </div>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tiêu đề ảnh / Tên khoảnh khắc *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Chiều hoàng hôn Hồ Tây"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Chuyên mục Album
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white"
              >
                <option value="trip">Chuyến đi xa ✈️</option>
                <option value="cafe">Tiệm cà phê ☕</option>
                <option value="daily">Đời thường ngọt ngào 🌿</option>
                <option value="film35mm">Cuộn phim Film 35mm 📷</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày chụp
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="VD: 14/02/2024"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Địa điểm chụp
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Đà Lạt / Hội An / Hà Nội"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Máy ảnh / Cuộn film
              </label>
              <input
                type="text"
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                placeholder="VD: Olympus OM-1 • Kodak Gold 200"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Màu băng dính Washi Tape
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'sakura', label: 'Hồng Đào', bg: 'bg-[#FFB7C5]' },
                  { id: 'ocean', label: 'Biển Ngọc', bg: 'bg-[#90E0EF]' },
                  { id: 'mint', label: 'Bạc Hà', bg: 'bg-[#B7E4C7]' },
                ].map((tape) => (
                  <button
                    key={tape.id}
                    type="button"
                    onClick={() => setTapeType(tape.id as any)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-medium border flex items-center justify-center gap-1.5 ${
                      tapeType === tape.id
                        ? 'border-[#006994] ring-1 ring-[#006994] bg-white text-[#006994]'
                        : 'border-slate-200 bg-white/70 text-slate-600'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${tape.bg}`} />
                    <span>{tape.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú / Cảm xúc viết tay trên ảnh Polaroid
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Buổi chiều gió mát rượi, hai đứa ngồi uống cà phê trứng và ngắm hoàng hôn buông xuống..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              id="btn-upload-photo-submit"
              type="submit"
              disabled={isSubmitting || !resolvedImageUrl || !title.trim()}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#006994] to-[#FFB7C5] hover:opacity-95 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Đang dán vào album...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu Khoảnh Khắc Lên Album</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
