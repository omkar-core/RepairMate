import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Search, Wrench, Zap } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Analyzing device..." }) => {
  
  const getStageConfig = () => {
    if (message.toLowerCase().includes('detecting')) {
      return {
        icon: Search,
        color: "text-cyan-400",
        ring: "border-cyan-500/30",
        innerRing: "border-blue-500/50",
        shadow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]",
        bgGlow: "bg-cyan-500/10"
      };
    }
    if (message.toLowerCase().includes('identifying')) {
      return {
        icon: Cpu,
        color: "text-emerald-400",
        ring: "border-emerald-500/30",
        innerRing: "border-green-500/50",
        shadow: "shadow-[0_0_30px_rgba(16,185,129,0.5)]",
        bgGlow: "bg-emerald-500/10"
      };
    }
    if (message.toLowerCase().includes('diagnosing')) {
      return {
        icon: Zap,
        color: "text-purple-400",
        ring: "border-purple-500/30",
        innerRing: "border-fuchsia-500/50",
        shadow: "shadow-[0_0_30px_rgba(168,85,247,0.5)]",
        bgGlow: "bg-purple-500/10"
      };
    }
    if (message.toLowerCase().includes('generating')) {
      return {
        icon: Wrench,
        color: "text-amber-400",
        ring: "border-amber-500/30",
        innerRing: "border-yellow-500/50",
        shadow: "shadow-[0_0_30px_rgba(245,158,11,0.5)]",
        bgGlow: "bg-amber-500/10"
      };
    }
    return {
      icon: Search,
      color: "text-cyan-400",
      ring: "border-cyan-500/30",
      innerRing: "border-blue-500/50",
      shadow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]",
      bgGlow: "bg-cyan-500/10"
    };
  };

  const config = getStageConfig();
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6 relative overflow-hidden transition-colors duration-1000">
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${config.bgGlow} blur-[100px] rounded-full pointer-events-none transition-colors duration-1000`} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center z-10"
      >
        <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
          {/* Outer rotating ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 border-2 border-dashed ${config.ring} rounded-full transition-colors duration-1000`}
          />
          
          {/* Inner pulsing ring */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute inset-4 border ${config.innerRing} rounded-full ${config.shadow} transition-all duration-1000`}
          />
          
          {/* Center Icon */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={message}
              initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative z-10 bg-zinc-900 p-4 rounded-2xl border border-white/10">
                <Icon size={32} className={`${config.color} transition-colors duration-500`} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.h2 
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-wide text-center max-w-md h-10"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {message}
          </motion.h2>
        </AnimatePresence>
        
        <div className="mt-12 flex gap-4">
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              borderColor: message.toLowerCase().includes('detecting') ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.05)',
              color: message.toLowerCase().includes('detecting') ? '#22d3ee' : '#71717a'
            }} 
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} 
            className="p-3 bg-zinc-900/60 backdrop-blur-md rounded-2xl border transition-colors duration-500 shadow-lg"
          >
            <Search size={22} />
          </motion.div>
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              borderColor: message.toLowerCase().includes('identifying') ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.05)',
              color: message.toLowerCase().includes('identifying') ? '#34d399' : '#71717a'
            }} 
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} 
            className="p-3 bg-zinc-900/60 backdrop-blur-md rounded-2xl border transition-colors duration-500 shadow-lg"
          >
            <Cpu size={22} />
          </motion.div>
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              borderColor: message.toLowerCase().includes('diagnosing') ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.05)',
              color: message.toLowerCase().includes('diagnosing') ? '#a855f7' : '#71717a'
            }} 
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} 
            className="p-3 bg-zinc-900/60 backdrop-blur-md rounded-2xl border transition-colors duration-500 shadow-lg"
          >
            <Zap size={22} />
          </motion.div>
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              borderColor: message.toLowerCase().includes('generating') ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.05)',
              color: message.toLowerCase().includes('generating') ? '#fbbf24' : '#71717a'
            }} 
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} 
            className="p-3 bg-zinc-900/60 backdrop-blur-md rounded-2xl border transition-colors duration-500 shadow-lg"
          >
            <Wrench size={22} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
