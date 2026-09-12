import React, { useState } from 'react';
import { Lock, KeyRound, CheckCircle2, AlertCircle, X, Eye, EyeOff, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Default password as specified in requirements: baohue2026
    if (password === 'baohue2026') {
      setIsSuccess(true);

      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#006994', '#FFB7C5', '#028090', '#F3C5D0'],
      });

      setTimeout(() => {
        onLoginSuccess();
        onClose();
        setIsSuccess(false);
        setPassword('');
      }, 700);
    } else {
      setError('Mật khẩu chưa chính xác. Vui lòng thử lại!');
    }
  };

  return (
    <div
      id="admin-login-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <button
          id="btn-admin-modal-close"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#006994] to-[#FFB7C5] p-[2px] mx-auto shadow-sm flex items-center justify-center mb-3">
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-[#006994]">
              <Lock className="w-6 h-6" />
            </div>
          </div>
          <h3 className="font-serif-display text-xl font-bold text-[#1E293B]">
            Xác thực Quyền Quản Trị
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Dành riêng cho Quốc Bảo &amp; Lại Huệ để tải ảnh và quản lý album
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Mở khóa thành công! Chào mừng Bảo &amp; Huệ.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mật khẩu Admin
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu Admin..."
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#006994] bg-white font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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
              id="btn-admin-login-submit"
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#006994] to-[#00A896] hover:opacity-95 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mở khóa Quản trị</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
