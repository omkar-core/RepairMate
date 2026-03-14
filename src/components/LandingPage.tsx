import React, { useRef, useState } from 'react';
import { Camera, Upload, Wrench, ChevronRight, PlayCircle, Brain } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onOpenCamera: () => void;
  onUploadImage: (imageSrc: string) => void;
}

const DEMO_IMAGES = [
  {
    name: "Cracked Screen",
    url: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&q=80&w=800",
    description: "Test screen repair analysis"
  },
  {
    name: "Water Damage",
    url: "https://images.unsplash.com/photo-1588508065123-287b28e0141c?auto=format&fit=crop&q=80&w=800",
    description: "Test liquid damage diagnosis"
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenCamera, onUploadImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDemoOptions, setShowDemoOptions] = useState(false);

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
          
          if (width > 0 && height > 0) {
            if (width > height && width > MAX_DIMENSION) {
              height = Math.round(height * (MAX_DIMENSION / width));
              width = MAX_DIMENSION;
            } else if (height > MAX_DIMENSION) {
              width = Math.round(width * (MAX_DIMENSION / height));
              height = MAX_DIMENSION;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              onUploadImage(canvas.toDataURL('image/jpeg', 0.8));
            }
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

  const loadDemoImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        onUploadImage(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Failed to load demo image:", error);
      alert("Failed to load demo image. Please try another method.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-zinc-950 text-white p-6 relative overflow-y-auto">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl flex flex-col items-center text-center z-10 mt-12 mb-20"
      >
        <div className="mb-8 relative group">
          <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full group-hover:bg-cyan-400/40 transition-colors duration-500" />
          <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
            <Wrench size={56} className="text-cyan-400" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Fix Broken Devices <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Instantly with AI</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed font-medium">
          Point your camera at a device and RepairMate AI will diagnose the problem and guide you step-by-step.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl justify-center mb-12">
          <button 
            onClick={onOpenCamera}
            className="group relative flex-1 flex items-center justify-center gap-3 py-6 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-xl rounded-2xl transition-all duration-300 hover:scale-[1.03] shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] border border-white/20"
          >
            <span>📸 Scan Device</span>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative flex-1 flex items-center justify-center gap-3 py-6 px-8 font-bold text-xl rounded-2xl transition-all duration-300 border-2 backdrop-blur-md ${
              isDragging 
                ? 'border-cyan-400 bg-cyan-500/20 scale-[1.03] shadow-[0_0_30px_rgba(34,211,238,0.2)]' 
                : 'border-white/20 bg-zinc-900/60 hover:bg-zinc-800/90 hover:border-white/40 hover:scale-[1.03] shadow-xl'
            }`}
          >
            <span className="text-white">🖼 Upload Photo</span>
          </button>

          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        {/* Quick Demo Section */}
        <div className="w-full max-w-md mb-20">
          <button 
            onClick={() => setShowDemoOptions(!showDemoOptions)}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-medium text-zinc-300 bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5 hover:border-white/10 rounded-xl transition-all"
          >
            <PlayCircle size={18} className="text-cyan-400" />
            Try a Quick Demo
          </button>
          
          {showDemoOptions && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 grid grid-cols-2 gap-3"
            >
              {DEMO_IMAGES.map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => loadDemoImage(demo.url)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800 hover:border-cyan-500/30 transition-all text-left group"
                >
                  <div className="w-full h-24 rounded-lg overflow-hidden relative">
                    <img src={demo.url} alt={demo.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <span className="text-xs font-semibold text-zinc-300 group-hover:text-cyan-400 transition-colors w-full truncate text-center">{demo.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Visual Demo Section */}
        <div className="w-full max-w-5xl">
          <h2 className="text-2xl font-bold text-white mb-8 tracking-wide uppercase text-zinc-500">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-zinc-800/60 transition-colors">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-lg">
                <Camera size={32} className="text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. Capture Device</h3>
              <p className="text-zinc-400 font-medium">Take a photo of the broken item</p>
            </div>
            
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-zinc-800/60 transition-colors">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-lg">
                <Brain size={32} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. AI Diagnoses Issue</h3>
              <p className="text-zinc-400 font-medium">Gemini analyzes the components</p>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-zinc-800/60 transition-colors">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-lg">
                <Wrench size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Fix It Yourself</h3>
              <p className="text-zinc-400 font-medium">Follow step-by-step instructions</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
