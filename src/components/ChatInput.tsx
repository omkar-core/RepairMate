import React, { useState, useRef, DragEvent, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, image?: string) => void;
  isLoading: boolean;
}

// Add TypeScript support for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const originalMessageRef = useRef('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          
          const newMsg = originalMessageRef.current 
            ? originalMessageRef.current + ' ' + transcript 
            : transcript;
          setMessage(newMsg);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      originalMessageRef.current = message;
      recognitionRef.current?.start();
      setIsListening(true);
    }
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
              setImage(canvas.toDataURL('image/jpeg', 0.8));
            }
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || image) && !isLoading) {
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
      onSendMessage(message, image || undefined);
      setMessage('');
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const SUGGESTIONS = [
    "What is this component?",
    "Is it safe to repair?",
    "Show another fix option"
  ];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
      {!isLoading && (
        <div className="flex flex-wrap gap-2 px-2 justify-center md:justify-start">
          {SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSendMessage(suggestion)}
              className="text-xs md:text-sm px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/80 text-zinc-300 hover:text-cyan-400 border border-white/5 hover:border-cyan-500/30 rounded-full transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col w-full bg-zinc-900/60 backdrop-blur-2xl border rounded-3xl shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/50 transition-all duration-300 ${
          isDragging ? 'border-cyan-500 bg-cyan-950/30 scale-[1.02]' : 'border-white/10 hover:border-white/20'
        }`}
      >
      {isDragging && (
        <div className="absolute inset-0 bg-cyan-950/80 z-10 flex items-center justify-center backdrop-blur-md">
          <div className="flex flex-col items-center text-cyan-400 font-medium">
            <ImageIcon size={36} className="mb-3 animate-bounce" />
            <span className="text-lg tracking-wide">Drop image to upload</span>
          </div>
        </div>
      )}

      {image && (
        <div className="p-4 border-b border-white/5 bg-zinc-800/30 flex items-start">
          <div className="relative inline-block group">
            <img
              src={image}
              alt="Preview"
              className="h-24 w-24 object-cover rounded-2xl border border-white/10 shadow-lg transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-full p-1.5 shadow-xl border border-white/10 transition-all duration-300 z-10"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center p-2.5 gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3.5 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-2xl transition-all duration-300 hover:scale-110 shrink-0"
          disabled={isLoading}
          title="Upload image"
        >
          <ImageIcon size={22} />
        </button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isListening ? "Listening..." : "Ask about your broken device..."}
          className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3.5 px-2 text-white placeholder-zinc-500 outline-none text-base"
          disabled={isLoading}
        />

        {recognitionRef.current && (
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3.5 rounded-2xl transition-all duration-300 hover:scale-110 shrink-0 ${
              isListening 
                ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20 animate-pulse' 
                : 'text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10'
            }`}
            disabled={isLoading}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
        )}

        <button
          type="submit"
          disabled={(!message.trim() && !image) || isLoading}
          className="p-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
        >
          <Send size={20} className="ml-0.5" />
        </button>
      </div>
    </form>
    </div>
  );
};
