'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RefreshCcw, Check, Flashlight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser or environment.");
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please ensure permissions are granted.");
    }
  }, []);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const MAX_DIMENSION = 1024;
      let width = video.videoWidth;
      let height = video.videoHeight;

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
          ctx.drawImage(video, 0, 0, width, height);
          const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
          setCapturedImage(imageSrc);
        }
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      onCapture(capturedImage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <div className="flex justify-between items-center p-5 text-white z-10 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-sm">
        <button onClick={onClose} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110">
          <X size={24} />
        </button>
        <div className="font-semibold tracking-wide text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>Scan Device</div>
        <div className="w-11"></div> {/* Spacer for centering */}
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-zinc-950 overflow-hidden">
        {error ? (
          <div className="text-red-400 p-8 text-center bg-zinc-900/80 backdrop-blur-xl rounded-3xl m-6 border border-red-500/20 shadow-2xl">
            <p className="text-lg font-medium">{error}</p>
            <button onClick={startCamera} className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors">Retry</button>
          </div>
        ) : capturedImage ? (
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay targeting box */}
        <AnimatePresence>
          {!capturedImage && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              <div className="w-72 h-72 border border-cyan-400/30 rounded-[2rem] relative shadow-[inset_0_0_50px_rgba(34,211,238,0.1)]">
                <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-cyan-400 rounded-tl-[2rem] shadow-[0_0_15px_rgba(34,211,238,0.4)]"></div>
                <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-cyan-400 rounded-tr-[2rem] shadow-[0_0_15px_rgba(34,211,238,0.4)]"></div>
                <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-cyan-400 rounded-bl-[2rem] shadow-[0_0_15px_rgba(34,211,238,0.4)]"></div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-cyan-400 rounded-br-[2rem] shadow-[0_0_15px_rgba(34,211,238,0.4)]"></div>
              </div>
              <div className="absolute bottom-24 text-cyan-400/80 font-medium tracking-widest uppercase text-sm bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-cyan-500/20">
                Align device in frame
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-8 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center items-center gap-10 pb-12 absolute bottom-0 left-0 right-0">
        {capturedImage ? (
          <>
            <button onClick={retakePhoto} className="flex flex-col items-center gap-3 text-white/70 hover:text-white transition-all duration-300 hover:scale-105 group">
              <div className="p-4 rounded-full bg-white/10 group-hover:bg-white/20 backdrop-blur-md transition-colors">
                <RefreshCcw size={24} />
              </div>
              <span className="text-sm font-semibold tracking-wide">Retake</span>
            </button>
            <button onClick={confirmPhoto} className="flex flex-col items-center gap-3 text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-105 group">
              <div className="p-5 rounded-full bg-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.3)] border border-cyan-500/50 group-hover:bg-cyan-500/30 backdrop-blur-md transition-colors">
                <Check size={32} />
              </div>
              <span className="text-sm font-semibold tracking-wide">Use Photo</span>
            </button>
          </>
        ) : (
          <button
            onClick={capturePhoto}
            disabled={!!error}
            className="w-20 h-20 rounded-full border-[3px] border-white/50 flex items-center justify-center hover:border-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 group"
          >
            <div className="w-[68px] h-[68px] bg-white rounded-full group-hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"></div>
          </button>
        )}
      </div>
    </motion.div>
  );
};
