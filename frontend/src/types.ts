export interface PhotoFilter {
  id: string;
  name: string;
  className: string;
  description: string;
}

export interface PhotoFrame {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  borderClass: string;
  accentColor: string;
  pattern?: string;
  description: string;
  imageUrl?: string; // Optional overlay frame image (PNG with transparent photo slots)
}

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  category: 'cute' | 'neon' | 'vintage' | 'retro';
}

export interface TextItem {
  id: string;
  text: string;
  color: string;
  fontFamily: string;
  fontSize: number;
  x: number; // persen 0-100
  y: number; // persen 0-100
}

export interface PlacedSticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface PhotostripLayout {
  id: 'strip-4' | 'grid-4' | 'classic-3' | 'single-1';
  name: string;
  cols: number;
  rows: number;
  aspectRatio: string;
  description: string;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
}

// Preset Data
export const LAYOUTS: PhotostripLayout[] = [
  { id: 'single-1', name: '1x1 Solo Portrait', cols: 1, rows: 1, aspectRatio: 'aspect-square', description: 'Fokus pada satu momen epik' },
  { id: 'classic-3', name: '1x3 Classic Strip', cols: 1, rows: 3, aspectRatio: 'aspect-photostrip-vertical', description: 'Gaya photobooth retro yang tak lekang waktu' },
  { id: 'strip-4', name: '1x4 Iconic Strip', cols: 1, rows: 4, aspectRatio: 'aspect-photostrip-vertical', description: 'Format strip paling populer untuk momen seru' },
  { id: 'grid-4', name: '2x2 Bento Grid', cols: 2, rows: 2, aspectRatio: 'aspect-square', description: 'Kolase estetik kekinian' },
];

export const FRAMES: PhotoFrame[] = [
  // --- Image-based custom frames ---
  { id: 'bubble-heart', name: 'Bubble Heart 🩷', bgColor: '#FF85A1', textColor: '#FFFFFF', borderClass: 'border-[#FF85A1]', accentColor: '#FFB3C6', description: 'Pink kawaii photostrip', imageUrl: '/images/frame_bubble_heart.png' },
  { id: 'mint-power', name: 'Mint Power 🌿', bgColor: '#6ECFB0', textColor: '#FFFFFF', borderClass: 'border-[#6ECFB0]', accentColor: '#A8E6D4', description: 'Segar dan menyejukkan', imageUrl: '/images/frame_mint_power.png' },
  { id: 'pop-flash', name: 'Pop Flash ⚡', bgColor: '#FFE566', textColor: '#252631', borderClass: 'border-[#FFE566]', accentColor: '#FFF0A0', description: 'Cerah energik ala pop art', imageUrl: '/images/frame_pop_flash.png' },
  { id: 'sky-kick', name: 'Sky Kick 🩵', bgColor: '#87CEF0', textColor: '#FFFFFF', borderClass: 'border-[#87CEF0]', accentColor: '#B8E4F9', description: 'Langit biru yang dreamy', imageUrl: '/images/frame_sky_kick.png' },
  // --- Solid color fallback frames ---
  { id: 'sleek-minimalist', name: 'Cloud White', bgColor: '#DCDADB', textColor: '#252631', borderClass: 'border-[#DCDADB]', accentColor: '#B2B5C9', description: 'Putih awan yang clean' },
  { id: 'obsidian-matte', name: 'Muted Blue', bgColor: '#B2B5C9', textColor: '#252631', borderClass: 'border-[#B2B5C9]', accentColor: '#F5E8D8', description: 'Biru lembut dan tenang' },
  { id: 'vintage-kodak', name: 'Soft Contrast', bgColor: '#252631', textColor: '#F5E8D8', borderClass: 'border-[#252631]', accentColor: '#B2B5C9', description: 'Aksen gelap untuk premium' },
];

export const FILTERS: PhotoFilter[] = [
  { id: 'normal', name: 'Normal Feed', className: '', description: 'Warna asli tanpa filter' },
  { id: 'glamour', name: 'Glamour Beauty', className: 'brightness-110 saturate-[1.15] contrast-105 sepia-[0.05]', description: 'Cerah merona sempurna' },
  { id: 'kodak', name: 'Kodak Gold 1995', className: 'sepia-[0.25] saturate-[1.2] contrast-[1.1] hue-rotate-[10deg] brightness-[0.98]', description: 'Golden hour setiap saat' },
  { id: 'cyberpunk', name: 'Cyberpunk Duotone', className: 'hue-rotate-[180deg] saturate-150 contrast-125', description: 'Vibe neon kota masa depan' },
  { id: 'monochrome', name: 'Monochrome Noir', className: 'grayscale contrast-[1.3] brightness-[0.95]', description: 'Klasik hitam putih dramatis' },
  { id: 'popart', name: 'Pop Art Sunset', className: 'hue-rotate-[240deg] saturate-[1.6] contrast-[1.1]', description: 'Ledakan warna senja' },
];

export const STICKERS: Sticker[] = [
  { id: 's1', emoji: '💖', name: 'Sparkling Heart', category: 'cute' },
  { id: 's2', emoji: '⭐', name: 'Star', category: 'cute' },
  { id: 's3', emoji: '🐱', name: 'Cat Face', category: 'cute' },
  { id: 's4', emoji: '✨', name: 'Sparkles', category: 'cute' },
  { id: 's5', emoji: '🔥', name: 'Fire', category: 'neon' },
  { id: 's6', emoji: '👽', name: 'Alien', category: 'neon' },
  { id: 's7', emoji: '😎', name: 'Cool Face', category: 'retro' },
  { id: 's8', emoji: '📸', name: 'Camera', category: 'vintage' },
  { id: 's9', emoji: '🍒', name: 'Cherries', category: 'retro' },
  { id: 's10', emoji: '🌈', name: 'Rainbow', category: 'cute' },
  { id: 's11', emoji: '🎉', name: 'Party Popper', category: 'vintage' },
  { id: 's12', emoji: '🎵', name: 'Musical Note', category: 'neon' },
];

export const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: "Siti Rahma", role: "Content Creator", avatar: "https://i.pravatar.cc/150?u=1", rating: 5, comment: "Gila sih hasilnya! Kayak beneran photobooth di mall, padahal cuma pake webcam laptop. Filter Kodak-nya favorit banget!" },
  { id: 2, name: "Budi Santoso", role: "Event Organizer", avatar: "https://i.pravatar.cc/150?u=2", rating: 5, comment: "Sangat membantu buat event kecil-kecilan. QR code bikin gampang share foto ke tamu undangan." },
  { id: 3, name: "Agnes Monica", role: "Mahasiswa", avatar: "https://i.pravatar.cc/150?u=3", rating: 4, comment: "Estetik banget UI-nya! Gampang dipake, frame K-Pop lucu-lucu. Semoga nanti ada fitur video boomerang." },
  { id: 4, name: "Dimas Anggara", role: "Designer", avatar: "https://i.pravatar.cc/150?u=4", rating: 5, comment: "Secara visual aplikasi ini memanjakan mata. Ekspor gambarnya high-res dan nggak pecah pas dicetak." }
];
