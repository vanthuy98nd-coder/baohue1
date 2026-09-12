import React, { useState } from 'react';
import { HelpCircle, X, ExternalLink, Copy, Check, Rocket, Database, Globe, ArrowRight, Download, FileCode, CheckCircle2 } from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'singlefile' | 'deploy' | 'firebase'>('singlefile');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadIndexHtml = async () => {
    setIsDownloading(true);
    try {
      // Try fetching docs/index.html first
      const res = await fetch('docs/index.html');
      if (res.ok) {
        const text = await res.text();
        const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
        return;
      }
    } catch (e) {
      console.warn('Could not fetch docs/index.html, falling back to document source', e);
    }

    try {
      const fullHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
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
              Đóng Gói 1 Tệp index.html &amp; Đưa Web Lên Mạng
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Dành cho Quốc Bảo &amp; Lại Huệ — Chạy offline trên máy tính hoặc xuất bản GitHub Pages miễn phí
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 mb-6 max-w-xl">
          <button
            type="button"
            onClick={() => setActiveTab('singlefile')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'singlefile'
                ? 'bg-white text-[#006994] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>1. Tệp index.html Duy Nhất</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'deploy'
                ? 'bg-white text-[#006994] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>2. Vercel / Netlify</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'firebase'
                ? 'bg-white text-[#006994] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>3. Firebase Realtime</span>
          </button>
        </div>

        {/* TAB 1: Single File index.html */}
        {activeTab === 'singlefile' && (
          <div className="space-y-4 text-xs text-slate-700 font-sans">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-sm text-[#006994] flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Toàn bộ website đã được gộp vào duy nhất 1 tệp index.html!</span>
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tất cả mã HTML, Tailwind CSS, JavaScript, icon Lucide, nhạc đĩa than Acoustic và cấu hình Firebase đã được đóng gói liền mạch không cần bất kỳ file ngoài nào.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadIndexHtml}
                disabled={isDownloading}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#006994] to-[#00A896] hover:opacity-95 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Đang chuẩn bị...' : 'Tải về index.html'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: Double click on computer */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#006994] text-white text-xs flex items-center justify-center font-bold">1</span>
                  <h4 className="font-bold text-sm text-[#1E293B]">Mở ngay trên máy tính (Offline / Zero-Config)</h4>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Sau khi tải file <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[#006994]">index.html</code> về máy, bạn chỉ cần <strong>nhấp đúp chuột để mở trực tiếp trong trình duyệt</strong> (Chrome, Safari, Edge, Cốc Cốc...).
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                  <li>Không cần cài đặt Node.js hay mở dòng lệnh.</li>
                  <li>Nhạc đĩa than acoustic tự tổng hợp Web Audio API chạy mượt mà.</li>
                  <li>Lưu bút và album lưu an toàn tại bộ nhớ trình duyệt (localStorage).</li>
                </ul>
              </div>

              {/* Option 2: Upload to GitHub Pages */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#028090] text-white text-xs flex items-center justify-center font-bold">2</span>
                  <h4 className="font-bold text-sm text-[#1E293B]">Đưa lên GitHub Pages (0 Đồng vĩnh viễn)</h4>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Tải file <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[#028090]">index.html</code> vào thư mục gốc của repository GitHub:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Vào <strong>Settings</strong> trên GitHub repo của bạn.</li>
                  <li>Chọn menu <strong>Pages</strong> ở cột bên trái.</li>
                  <li>Tại <em>Branch</em>, chọn <strong>main</strong> và thư mục <strong>/(root)</strong> (hoặc <strong>/docs</strong>).</li>
                  <li>Bấm <strong>Save</strong> ➔ Website sẽ online ngay tại <code className="text-[#006994] font-semibold">https://username.github.io/repo/</code>!</li>
                </ol>
              </div>
            </div>

            {/* Build command notice */}
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-700">
              <span className="text-slate-500 font-sans">Lệnh tạo lại tệp index.html duy nhất bất cứ lúc nào trong mã nguồn:</span>
              <div className="mt-1 font-bold text-[#006994]">npm run build</div>
              <span className="text-slate-500 font-sans text-[10px]">Tệp sẽ tự động xuất ra tại: <code className="text-slate-700">dist/index.html</code> và <code className="text-slate-700">docs/index.html</code>.</span>
            </div>
          </div>
        )}

        {/* TAB 2: Deploy Netlify / Vercel */}
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
