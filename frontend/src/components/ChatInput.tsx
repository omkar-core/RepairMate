'use client';

import React, { useState, useRef, DragEvent, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, image?: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('WebkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).WebkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + ' ' + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in your browser.");
        return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSend = () => {
    if ((message.trim() || selectedImage) && !isLoading) {
      onSendMessage(message, selectedImage || undefined);
      setMessage('');
      setSelectedImage(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      {selectedImage && (
        <div className="absolute bottom-full mb-4 p-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
            <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black transition-colors"
            >
              <X size={12} />
            </button>
          </div>
          <span className="text-xs text-zinc-400 font-medium pr-2">Image attached</span>
        </div>
      )}

      <div className="relative flex items-end gap-3 bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-2 md:p-3 rounded-[2rem] shadow-2xl focus-within:border-cyan-500/30 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all duration-500">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-zinc-400 hover:text-cyan-400 hover:bg-white/5 rounded-2xl transition-all duration-300"
        >
          <ImageIcon size={22} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageSelect}
        />

        <button
          onClick={toggleRecording}
          className={`p-3 rounded-2xl transition-all duration-300 ${isRecording ? 'text-red-400 bg-red-500/10 animate-pulse' : 'text-zinc-400 hover:text-cyan-400 hover:bg-white/5'}`}
        >
          {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a follow-up question..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-500 py-3 resize-none max-h-32 min-h-[44px] text-sm md:text-base leading-relaxed"
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedImage) || isLoading}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 p-3.5 rounded-2xl text-white transition-all duration-300 shadow-lg disabled:shadow-none hover:scale-105 active:scale-95 shrink-0"
        >
          <Send size={20} className={isLoading ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  );
};
