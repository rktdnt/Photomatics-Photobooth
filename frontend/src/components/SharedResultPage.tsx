import { Download, Camera } from 'lucide-react';

interface Props {
  imageUrl: string;
  onReset: () => void;
}

const SharedResultPage: React.FC<Props> = ({ imageUrl, onReset }) => {
  return (
    <div className="container mx-auto min-h-screen px-6 py-10 text-ink">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="eyebrow mb-2">SHARED PHOTOSTRIP</h2>
        <h1 className="font-display text-5xl font-black">Momen Photobooth</h1>
        <p className="mt-3 text-soft-ink">Seseorang telah membagikan photostrip ini dengan Anda.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-center">
        {/* Kiri: Result Image (6 col) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-[430px] rounded-[2.5rem] bg-muted-blue p-7 shadow-2xl shadow-ink/10">
            <img src={imageUrl} alt="Shared Photostrip" className="w-full rounded-[1.75rem] shadow-xl" />
          </div>
        </div>

        {/* Kanan: Actions (6 col) */}
        <div className="lg:col-span-6 flex flex-col justify-center gap-6">
          <div className="cream-card flex flex-col gap-5 rounded-[2.5rem] p-9">
            <h3 className="mb-1 text-3xl font-black">Simpan Momen Ini</h3>
            <p className="text-soft-ink">Unduh photostrip ini ke perangkat Anda atau buat photostrip Anda sendiri!</p>
            
            <a 
              href={imageUrl} 
              target="_blank"
              rel="noreferrer"
              download="photomatics-strip.jpg"
              className="soft-btn-primary flex w-full items-center justify-center gap-3 rounded-full py-4 text-lg font-black text-center"
            >
              <Download className="w-5 h-5" /> Amankan Kualitas HD ⚡
            </a>
            
            <button 
              onClick={onReset}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-muted-blue py-4 text-lg font-black transition-colors cursor-pointer"
            >
              <Camera className="w-5 h-5" /> Mulai Bikin Foto Baru Kuy! 📸
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedResultPage;
