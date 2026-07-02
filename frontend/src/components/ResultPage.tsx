import React, { useEffect, useState } from 'react';
import { Home, Share2, Download, History, Trash2, Camera, ExternalLink } from 'lucide-react';
import { PhotostripLayout, PhotoFrame } from '../types';

interface Props {
  dataUrl: string;
  layout: PhotostripLayout;
  frame: PhotoFrame;
  sessionMode: 'trial' | 'premium';
  onReset: () => void;
}

interface SessionRecord {
  id: number;
  image_url: string;
  created_at: string;
}

const ResultPage: React.FC<Props> = ({ dataUrl, layout, frame, sessionMode, onReset }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(true);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [waNumber, setWaNumber] = useState('');

  // Get or create stable device_id
  const getDeviceId = () => {
    let id = localStorage.getItem('pm_device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('pm_device_id', id);
    }
    return id;
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const processResult = async () => {
      try {
        setIsUploading(true);
        // 1. Upload to Cloudinary via Backend
        const resUpload = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl })
        });
        if (!resUpload.ok) throw new Error("Upload failed");
        const uploadData = await resUpload.json();
        const finalUrl = uploadData.url;
        setUploadedImageUrl(finalUrl);

        // 2. Log Session to MySQL
        const deviceId = getDeviceId();
        await fetch(`${API_BASE}/api/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_id: deviceId,
            layout_id: layout.id,
            frame_id: frame.id,
            session_mode: sessionMode,
            image_url: finalUrl
          })
        });

        // 3. Fetch History
        fetchHistory(deviceId);

      } catch (err) {
        console.error("Error processing result:", err);
        // Fallback for demo purposes if backend is down
        setUploadedImageUrl(dataUrl);
      } finally {
        setIsUploading(false);
      }
    };

    processResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async (deviceId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/sessions?device_id=${deviceId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.warn("Could not fetch history");
    }
  };

  const handleShowQR = async () => {
    setShowQRModal(true);
    if (!qrCodeDataUrl && uploadedImageUrl) {
      try {
        const res = await fetch(`${API_BASE}/api/qrcode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: uploadedImageUrl })
        });
        if (res.ok) {
          const data = await res.json();
          setQrCodeDataUrl(data.qr_data_url);
        }
      } catch (err) {
        console.error("QR gen failed", err);
      }
    }
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await fetch(`${API_BASE}/api/sessions/${id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error("Delete failed");
    }
  };

  const handleShareWA = () => {
    const shareUrl = uploadedImageUrl.startsWith('http') ? uploadedImageUrl : 'https://photomatics.app';
    const text = encodeURIComponent(`Lihat hasil photobooth AI saya dari Photomatics! ✨📸\n${shareUrl}`);
    const cleanNumber = waNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const handleShareWAStatus = () => {
    const shareUrl = uploadedImageUrl.startsWith('http') ? uploadedImageUrl : 'https://photomatics.app';
    const text = encodeURIComponent(`Lihat hasil photobooth AI saya dari Photomatics! ✨📸\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="container mx-auto min-h-screen px-6 py-10 text-ink">
      <div className="text-center mb-10">
        <h2 className="eyebrow mb-2">SELESAI</h2>
        <h1 className="font-display text-5xl font-black">Momenmu sudah siap</h1>
        <p className="mt-3 text-soft-ink">Hasil photostrip siap diunduh dan dibagikan.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 max-w-5xl mx-auto">
        {/* Kiri: Result Image (6 col) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-[430px] rounded-[2.5rem] bg-muted-blue p-7 shadow-2xl shadow-ink/10">
            {isUploading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-[2.5rem] bg-ink/70 backdrop-blur">
                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-warm-cream border-t-transparent" />
                <p className="font-mono text-sm tracking-widest text-warm-cream">MENGUNGGAH...</p>
              </div>
            )}
            <img src={dataUrl} alt="Final Photostrip" className="w-full rounded-[1.75rem] shadow-xl" />
          </div>
        </div>

        {/* Kanan: Actions (6 col) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="cream-card flex flex-col gap-4 rounded-[2.5rem] p-9">
            <h3 className="mb-1 text-3xl font-black">Simpan & Bagikan</h3>
            <p className="mb-2 text-soft-ink">Pilih cara paling cepat buat menyimpan hasilnya.</p>
            
            <a 
              href={dataUrl} 
              download="photomatics-strip.jpg"
              className="soft-btn-primary flex w-full items-center justify-center gap-3 rounded-full py-4 text-lg font-black"
            >
              <Download className="w-5 h-5" /> Download File Kualitas HD
            </a>
            
            <button 
              onClick={handleShowQR}
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-muted-blue py-4 text-lg font-black transition-colors disabled:opacity-50"
            >
              <Share2 className="w-5 h-5" /> Tampilkan QR Code
            </button>
            
            <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs text-soft-ink">
              <Camera className="w-3 h-3" /> Foto disimpan sementara di browser Anda dan akan terhapus otomatis dalam 24 jam.
            </p>

            <div className="mt-4 border-t border-ink/10 pt-6">
              <h4 className="mb-4 text-sm font-black uppercase text-soft-ink">Kirim via WhatsApp</h4>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input 
                    type="tel" 
                    placeholder="Nomor WA (contoh: 62812...)" 
                    className="flex-1 rounded-2xl border border-ink/10 bg-white/55 px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                  />
                  <button 
                    onClick={handleShareWA}
                    className="cursor-pointer rounded-2xl bg-ink px-6 py-3 text-sm font-black text-warm-cream transition-colors"
                  >
                    Kirim
                  </button>
                </div>
                <button 
                  onClick={handleShareWAStatus}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-ink/10 py-3 text-sm font-black transition-colors hover:border-ink"
                >
                  <Share2 className="w-4 h-4" /> Atau Bagikan ke Status / Kontak Lain
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={onReset}
            className="soft-btn-secondary flex w-full items-center justify-center gap-2 rounded-full py-4 font-black"
          >
            <Home className="w-5 h-5" /> Kembali ke Beranda & Mulai Baru
          </button>
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-24 max-w-5xl mx-auto">
          <h3 className="mb-8 flex items-center gap-3 font-display text-3xl font-black">
            <History className="h-6 w-6 text-soft-ink" /> Riwayat Photostrip Anda
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map(item => (
              <div key={item.id} className="cream-card group relative rounded-2xl p-2">
                <a href={item.image_url} target="_blank" rel="noreferrer" className="relative block aspect-[1/2] overflow-hidden rounded-xl border border-ink/10">
                  <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="History" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                </a>
                <button 
                  onClick={() => handleDeleteHistory(item.id)}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-6 backdrop-blur-sm">
          <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-warm-cream p-8 text-center shadow-2xl">
            
            <h3 className="mb-2 font-display text-3xl font-black">Scan QR Code</h3>
            <p className="mb-8 text-sm text-soft-ink">Pindai QR Code untuk mengunduh ke galeri HP</p>
            
            <div className="bg-white p-4 rounded-2xl mb-8 mx-auto w-64 h-64 flex items-center justify-center">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-cloud-white border-t-ink" />
              )}
            </div>
            
            <button 
              onClick={() => setShowQRModal(false)}
              className="soft-btn-secondary w-full rounded-full py-3 font-black"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
