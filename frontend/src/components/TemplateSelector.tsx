import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Layout as LayoutIcon, Frame, Check, Camera, X, Upload, Crown, Sparkles, Lock } from 'lucide-react';
import { PhotostripLayout, PhotoFrame, LAYOUTS, FRAMES } from '../types';

interface Props {
  sessionMode: 'free' | 'premium';
  selectedLayout: PhotostripLayout;
  setSelectedLayout: (layout: PhotostripLayout) => void;
  selectedFrame: PhotoFrame;
  setSelectedFrame: (frame: PhotoFrame) => void;
  onBack: () => void;
  onNext: () => void;
}

const TemplateSelector: React.FC<Props> = ({
  sessionMode,
  selectedLayout, setSelectedLayout,
  selectedFrame, setSelectedFrame,
  onBack, onNext
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Custom frame upload premium upsell state
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  React.useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to access camera", err);
      }
    };
    
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="container mx-auto min-h-screen px-6 py-10 text-ink">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-cream shadow-lg transition hover:-translate-y-0.5">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="eyebrow mb-1">LANGKAH 01 DARI 03</h2>
          <h1 className="font-display text-4xl font-black">Konfigurasi Photostrip</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Kiri: Pilihan (8 col) */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Card 1: Layout */}
          <div className="cream-card rounded-[2rem] p-7">
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2 text-xl font-black"><LayoutIcon className="w-5 h-5 text-soft-ink" /> Pilih Layout</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {LAYOUTS.map(layout => (
                <button
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout)}
                  className={`flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all ${selectedLayout.id === layout.id ? 'border-ink bg-muted-blue/55' : 'border-ink/10 bg-white/35 hover:border-ink/30'}`}
                >
                  <div className="flex h-16 w-16 flex-col gap-1 rounded-xl border border-ink/10 bg-warm-cream p-2">
                    {layout.id === 'single-1' && <div className="w-full h-full bg-muted-blue rounded-sm" />}
                    {layout.id === 'classic-3' && Array(3).fill(0).map((_, i) => <div key={i} className="w-full flex-1 bg-muted-blue rounded-sm" />)}
                    {layout.id === 'strip-4' && Array(4).fill(0).map((_, i) => <div key={i} className="w-full flex-1 bg-muted-blue rounded-sm" />)}
                    {layout.id === 'grid-4' && (
                      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1">
                        {Array(4).fill(0).map((_, i) => <div key={i} className="w-full h-full bg-muted-blue rounded-sm" />)}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold">{layout.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Frame */}
          <div className="cream-card rounded-[2rem] p-7">
            <div className="flex items-center justify-between mb-5">
              <h3 className="flex items-center gap-2 text-xl font-black"><Frame className="w-5 h-5 text-soft-ink" /> Pilih Frame Awal</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FRAMES.map(frame => (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame)}
                  className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${selectedFrame.id === frame.id ? 'border-ink bg-muted-blue/55' : 'border-ink/10 bg-white/35 hover:border-ink/30'}`}
                >
                  <div className="w-8 h-8 rounded-full shadow-inner flex-shrink-0 border border-white/20" style={{ backgroundColor: frame.bgColor }} />
                  <div className="flex-1 truncate">
                    <div className="text-sm font-bold truncate">{frame.name}</div>
                  </div>
                  {selectedFrame.id === frame.id && <Check className="absolute right-3 w-4 h-4 text-ink" />}
                </button>
              ))}

              {/* Upload Custom Frame — Premium Feature */}
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="relative flex items-center gap-3 rounded-2xl border border-dashed border-ink/25 bg-white/20 p-4 text-left transition-all hover:border-ink/50 hover:bg-muted-blue/20 group"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted-blue/40 group-hover:bg-muted-blue/60 transition-colors">
                  <Upload className="w-4 h-4 text-soft-ink" />
                </div>
                <div className="flex-1 truncate">
                  <div className="text-sm font-bold truncate text-soft-ink">Frame Kustom</div>
                  <div className="text-[10px] text-soft-ink/70 mt-0.5 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Premium
                  </div>
                </div>
                <Lock className="absolute right-3 w-4 h-4 text-soft-ink/50" />
              </button>
            </div>
          </div>

        </div>

        {/* Kanan: Live Preview (4 col, sticky) */}
        <div className="lg:col-span-4 relative">
          <div className="cream-card sticky top-24 flex flex-col items-center rounded-[2rem] p-7">
            <h3 className="eyebrow mb-6 w-full text-center">LIVE PREVIEW</h3>
            
            {/* The Strip Preview */}
            <motion.div 
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-[220px] rounded-[1.5rem] p-4 shadow-2xl"
              style={{ backgroundColor: selectedFrame.bgColor }}
            >
              {selectedFrame.pattern === 'radial-dot' && (
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '10px 10px', color: selectedFrame.textColor }} />
              )}
              
              <div className={`relative z-10 w-full flex ${selectedLayout.id === 'grid-4' ? 'flex-wrap gap-2' : 'flex-col gap-2'}`}>
                {Array(selectedLayout.rows * selectedLayout.cols).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-muted-blue/30 ${selectedLayout.id === 'grid-4' ? 'w-[calc(50%-4px)] aspect-square' : 'w-full aspect-[4/3]'} border border-ink/10`}
                  >
                    {i === 0 ? (
                      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" />
                    ) : (
                      <Camera className="w-6 h-6 opacity-20" style={{ color: selectedFrame.textColor }} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center text-[10px] font-display font-bold tracking-widest" style={{ color: selectedFrame.textColor }}>
                CTRL+Snap
              </div>
            </motion.div>
            
            <div className="w-full mt-8 pt-6 border-t border-white/10">
              <button 
                onClick={onNext}
                className="soft-btn-primary flex w-full items-center justify-center gap-2 rounded-full py-4 font-black"
              >
                Gaskeun ke Photobooth! 🚀 <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upgrade Modal — Custom Frame Upload */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowUpgradeModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm rounded-[2.5rem] bg-ink p-8 text-warm-cream shadow-2xl"
            >
              {/* Close */}
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-warm-cream/10 transition hover:bg-warm-cream/20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-cream/10">
                  <Crown className="w-8 h-8 text-warm-cream" />
                </div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-blue mb-2">Fitur Premium</p>
                <h2 className="font-display text-3xl font-black leading-tight">Upload Frame<br />Kustom</h2>
                <p className="mt-3 text-sm leading-relaxed text-warm-cream/70">
                  Gunakan gambar sendiri sebagai background frame photostrip kamu — logo brand, foto aesthetic, atau template unik buatanmu.
                </p>
              </div>

              {/* Feature list */}
              <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-warm-cream/5 p-4">
                {[
                  { icon: Upload, text: 'Upload gambar JPG, PNG, atau SVG' },
                  { icon: Sparkles, text: 'Frame eksklusif & maskot premium' },
                  { icon: Crown, text: 'Hasil foto bebas watermark' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-muted-blue/30">
                      <Icon className="w-4 h-4 text-muted-blue" />
                    </div>
                    <span className="text-warm-cream/80">{text}</span>
                  </div>
                ))}
              </div>

              {/* Price + CTA */}
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-warm-cream/60">Harga per sesi</span>
                  <span className="font-mono text-2xl font-black">Rp 10.000</span>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-warm-cream py-4 font-black text-ink transition hover:bg-warm-cream/90"
                >
                  <Crown className="w-5 h-5" /> Upgrade ke Premium
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-center text-sm text-warm-cream/50 hover:text-warm-cream/80 transition py-1"
                >
                  Lanjut gratis aja dulu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateSelector;
