import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Wrench, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onOpenCamera: () => void;
  onUploadImage: (imageSrc: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenCamera, onUploadImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIMENSION = 1024;
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            onUploadImage(canvas.toDataURL('image/jpeg', 0.8));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md flex flex-col items-center text-center z-10"
      >
        <div className="mb-10 relative group">
          <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full group-hover:bg-cyan-400/40 transition-colors duration-500" />
          <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
            <Wrench size={56} className="text-cyan-400" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
          RepairMate <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span>
        </h1>
        
        <p className="text-lg text-zinc-400 mb-12 max-w-sm leading-relaxed font-medium">
          Fix Anything with AI Guidance. Snap a photo of your broken device and get step-by-step repair instructions.
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={onOpenCamera}
            className="group relative w-full flex items-center justify-between p-5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] border border-white/10"
          >
            <div className="flex items-center gap-4">
              <Camera size={26} className="text-white" />
              <span className="text-lg tracking-wide">Scan with Camera</span>
            </div>
            <ChevronRight size={22} className="opacity-80 group-hover:translate-x-1.5 transition-transform" />
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative w-full flex items-center justify-between p-5 font-semibold rounded-2xl transition-all duration-300 border backdrop-blur-sm ${
              isDragging 
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02] shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                : 'border-white/10 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-white/20 hover:scale-[1.02]'
            }`}
          >
            <div className="flex items-center gap-4">
              <ImageIcon size={26} className={isDragging ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-cyan-400 transition-colors'} />
              <div className="flex flex-col items-start">
                <span className="text-lg text-white tracking-wide">{isDragging ? 'Drop image here' : 'Upload from Gallery'}</span>
                <span className="text-sm text-zinc-500 font-normal hidden sm:block mt-0.5">Or drag and drop a file</span>
              </div>
            </div>
            <ChevronRight size={22} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1.5 transition-all" />
          </button>

          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      </motion.div>
    </div>
  );
};
