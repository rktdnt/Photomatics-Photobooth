import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Layout as LayoutIcon, Frame, Sparkles, Check, Camera } from 'lucide-react';
import { PhotostripLayout, PhotoFrame, LAYOUTS, FRAMES } from '../types';

interface Props {
  sessionMode: 'trial' | 'premium';
  setSessionMode: (mode: 'trial' | 'premium') => void;
  selectedLayout: PhotostripLayout;
  setSelectedLayout: (layout: PhotostripLayout) => void;
  selectedFrame: PhotoFrame;
  setSelectedFrame: (frame: PhotoFrame) => void;
  onBack: () => void;
  onNext: () => void;
}

const TemplateSelector: React.FC<Props> = ({
  sessionMode, setSessionMode,
  selectedLayout, setSelectedLayout,
  selectedFrame, setSelectedFrame,
  onBack, onNext
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

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
  
  const handleNext = () => {
    // If trial, force to single layout
    if (sessionMode === 'trial') {
      setSelectedLayout(LAYOUTS.find(l => l.id === 'single-1') || LAYOUTS[0]);
    }
    onNext();
  };

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
          
          {/* Card 1: Session Mode */}
          <div className="cream-card rounded-[2rem] p-7">
            <h3 className="mb-5 flex items-center gap-2 text-xl font-black"><Sparkles className="w-5 h-5 text-soft-ink" /> Pilih Mode Sesi</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setSessionMode('trial')}
                className={`rounded-2xl border p-5 text-left transition-all ${sessionMode === 'trial' ? 'border-ink bg-muted-blue/55 shadow-lg' : 'border-ink/10 bg-white/35 hover:border-ink/30'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold">Trial Sesi</div>
                  {sessionMode === 'trial' && <Check className="w-5 h-5 text-ink" />}
                </div>
                <div className="mb-2 text-sm text-soft-ink">1 Jepretan, Frame Dasar, Ada Watermark</div>
                <div className="font-mono font-bold text-ink">Rp 0</div>
              </button>
              
              <button 
                onClick={() => setSessionMode('premium')}
                className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${sessionMode === 'premium' ? 'border-ink bg-ink text-warm-cream shadow-lg' : 'border-ink/10 bg-white/35 hover:border-ink/30'}`}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold">Premium Sesi</div>
                    {sessionMode === 'premium' && <Check className="w-5 h-5 text-warm-cream" />}
                  </div>
                  <div className={`mb-2 text-sm ${sessionMode === 'premium' ? 'text-warm-cream/70' : 'text-soft-ink'}`}>Semua Layout, Full Frame, HD Tanpa Watermark</div>
                  <div className="font-mono font-bold">Rp 10.000</div>
                </div>
              </button>
            </div>
          </div>

          {/* Card 2: Layout */}
          <div className={`cream-card rounded-[2rem] p-7 transition-opacity ${sessionMode === 'trial' ? 'opacity-55 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2 text-xl font-black"><LayoutIcon className="w-5 h-5 text-soft-ink" /> Pilih Layout</h3>
              {sessionMode === 'trial' && <span className="rounded-full bg-muted-blue px-3 py-1 font-mono text-xs font-bold text-ink">TERKUNCI DI TRIAL</span>}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {LAYOUTS.map(layout => (
                <button
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout)}
                  className={`flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all ${selectedLayout.id === layout.id ? 'border-ink bg-muted-blue/55' : 'border-ink/10 bg-white/35 hover:border-ink/30'}`}
                >
                  <div className="flex h-16 w-16 flex-col gap-1 rounded-xl border border-ink/10 bg-warm-cream p-2">
                    {/* Visual representation of layout */}
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

          {/* Card 3: Frame */}
          <div className="cream-card rounded-[2rem] p-7">
            <h3 className="mb-5 flex items-center gap-2 text-xl font-black"><Frame className="w-5 h-5 text-soft-ink" /> Pilih Frame Awal</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FRAMES.map(frame => {
                const isLocked = sessionMode === 'trial' && frame.id !== 'sleek-minimalist';
                return (
                  <button
                    key={frame.id}
                    onClick={() => !isLocked && setSelectedFrame(frame)}
                    className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${isLocked ? 'cursor-not-allowed opacity-45' : selectedFrame.id === frame.id ? 'border-ink bg-muted-blue/55' : 'border-ink/10 bg-white/35 hover:border-ink/30'}`}
                  >
                    <div className="w-8 h-8 rounded-full shadow-inner flex-shrink-0 border border-white/20" style={{ backgroundColor: frame.bgColor }} />
                    <div className="flex-1 truncate">
                      <div className="text-sm font-bold truncate">{frame.name}</div>
                      {isLocked && <div className="mt-1 text-[10px] text-soft-ink">Premium Only</div>}
                    </div>
                    {selectedFrame.id === frame.id && <Check className="absolute right-3 w-4 h-4 text-ink" />}
                  </button>
                );
              })}
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
                {Array(sessionMode === 'trial' ? 1 : selectedLayout.rows * selectedLayout.cols).fill(0).map((_, i) => (
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
                PHOTOMATICS
              </div>
            </motion.div>
            
            <div className="w-full mt-8 pt-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-soft-ink">Total Tagihan</span>
                <span className="font-mono text-xl font-bold text-ink">
                  Rp {sessionMode === 'trial' ? '0' : '10.000'}
                </span>
              </div>
              <button 
                onClick={handleNext}
                className="soft-btn-primary flex w-full items-center justify-center gap-2 rounded-full py-4 font-black"
              >
                Lanjutkan ke Photobooth <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
