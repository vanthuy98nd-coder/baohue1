import React, { useState } from 'react';
import { HelpCircle, X, ExternalLink, Copy, Check, Rocket, Database, Globe, ArrowRight } from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'firebase' | 'deploy'>('deploy');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      id="deploy-guide-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <button
          id="btn-guide-modal-close"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#006994] to-[#FFB7C5] text-white shadow-sm">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1E293B]">
              Hướng Dẫn Đưa Web Lên Mạng &amp; Firebase 0 Đồng
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Các bước đơn giản nhất dành cho Quốc Bảo &amp; Lại Huệ để chia sẻ cho bạn bè
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 mb-6 max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'deploy'
                ? 'bg-white text-[#006994] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. Deploy Vercel / Netlify (0đ)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'firebase'
                ? 'bg-white text-[#006994] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>2. Tạo Firebase Free (Realtime)</span>
          </button>
        </div>

        {/* TAB 1: Deploy Netlify / Vercel */}
        {activeTab === 'deploy' && (
          <div className="space-y-6 text-sm text-slate-700 font-sans">
            {/* Option A: Vercel */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-[#006994] text-base flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#006994] text-white text-xs flex items-center justify-center font-mono">A</span>
                  Cách 1: Deploy qua Vercel (Khuyên dùng — Cực nhanh &amp; Tự động cập nhật)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  100% Miễn phí
                </span>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed pl-1 text-slate-600">
                <li>
                  Đẩy toàn bộ mã nguồn lên kho lưu trữ GitHub cá nhân (như repo <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[#006994]">vanthuy98nd-coder/baohue</code>).
                </li>
                <li>
                  Truy cập <strong>vercel.com</strong> và đăng nhập bằng tài khoản GitHub (chọn Free Hobby Plan).
                </li>
                <li>
                  Bấm nút <strong>"Add New..." ➔ "Project"</strong>, chọn repository chứa mã nguồn này.
                </li>
                <li>
                  Vercel tự động nhận diện framework là <strong>Vite</strong>. Bấm nút <strong>"Deploy"</strong>.
                </li>
                <li>
                  Sau khoảng 40 giây, bạn sẽ nhận được một đường link cực đẹp dạng: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-emerald-700 font-bold">baohue.vercel.app</code> có thể gửi ngay cho bạn bè và người thân!
                </li>
              </ol>
            </div>

            {/* Option B: Netlify Drag & Drop */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-[#028090] text-base flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#028090] text-white text-xs flex items-center justify-center font-mono">B</span>
                  Cách 2: Kéo thả trên Netlify Drop (Không cần cài Git)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold">
                  0 Đồng
                </span>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed pl-1 text-slate-600">
                <li>
                  Chạy lệnh xuất file tĩnh: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[#006994]">npm run build</code>
                </li>
                <li>
                  Một thư mục tên là <strong>dist</strong> sẽ được tạo ra chứa toàn bộ mã nguồn website đã đóng gói.
                </li>
                <li>
                  Truy cập vào <strong>app.netlify.com/drop</strong>.
                </li>
                <li>
                  Kéo và thả cả thư mục <strong>dist</strong> vào khung tải lên của Netlify.
                </li>
                <li>
                  Trang web sẽ lập tức online với tên miền dạng <code className="bg-slate-200 px-1.5 py-0.5 rounded text-teal-700 font-bold">quocbao-laihue.netlify.app</code>!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: Firebase Free Setup */}
        {activeTab === 'firebase' && (
          <div className="space-y-4 text-xs text-slate-700 font-sans">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900">
              💡 <strong>Lưu ý tiện lợi:</strong> Website đã được tích hợp sẵn hệ thống <strong>Lưu trữ Cục bộ + Nén ảnh 500KB tự động</strong>. Ngay lúc này trang web đã hoạt động hoàn hảo 100%! Nếu muốn lưu trữ trực tuyến vĩnh viễn trên đám mây Realtime giữa nhiều điện thoại/máy tính, bạn làm theo 4 bước miễn phí sau:
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-sm text-[#006994] mb-1">
                  Bước 1: Tạo dự án tại Firebase Console (Miễn phí 100%)
                </h4>
                <p className="text-slate-600">
                  Vào <strong>console.firebase.google.com</strong> bằng tài khoản Gmail của bạn ➔ Bấm <strong>"Add Project"</strong> (Thêm dự án) ➔ Đặt tên là <em>BaoHue-Journal</em>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-sm text-[#006994] mb-1">
                  Bước 2: Kích hoạt Cloud Firestore &amp; Storage
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  • Vào menu trái ➔ <strong>Firestore Database</strong> ➔ Bấm "Create Database" ➔ Chọn chế độ <em>"Start in test mode"</em> để mọi người đều có thể thả tim và viết lưu bút.<br />
                  • Vào menu trái ➔ <strong>Storage</strong> ➔ Bấm "Get Started" ➔ Chọn test mode (Gói Free cho phép 5GB lưu trữ ảnh miễn phí).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-sm text-[#006994] mb-1">
                  Bước 3: Lấy mã cấu hình Web App (Firebase Config)
                </h4>
                <p className="text-slate-600">
                  Tại màn hình chính Project Overview ➔ Bấm vào biểu tượng <strong>Web ( &lt;/&gt; )</strong> ➔ Đặt tên app là <em>BaoHueWeb</em> ➔ Bạn sẽ thấy một đoạn mã config dạng:
                </p>
                <div className="mt-2 p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto relative">
                  <pre>{`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "baohue.firebaseapp.com",
  projectId: "baohue",
  storageBucket: "baohue.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};`}</pre>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-sm text-[#006994] mb-1">
                  Bước 4: Dán vào Web
                </h4>
                <p className="text-slate-600">
                  Bạn chỉ cần bấm vào biểu tượng <strong>Cơ sở dữ liệu (Database)</strong> trên thanh menu ở góc trên website này, rồi dán các thông tin vào là xong ngay! Không cần sửa code phức tạp.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Cần hỗ trợ? Hãy lưu lại hướng dẫn này để sử dụng bất kỳ lúc nào.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#006994] text-white font-semibold hover:bg-[#005577] transition-colors"
          >
            Đã hiểu &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
