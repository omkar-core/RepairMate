import React from 'react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Message } from '../types';
import { Bot, User } from 'lucide-react';
import { motion } from 'motion/react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
      className={cn(
        'flex w-full gap-4 p-5 md:p-6 rounded-3xl transition-all duration-300',
        isUser ? 'bg-zinc-900/40 backdrop-blur-xl border border-white/5 shadow-lg ml-auto max-w-[90%]' : 'bg-zinc-800/30 backdrop-blur-xl border border-white/10 shadow-xl mr-auto max-w-[90%]'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-inner overflow-hidden',
          isUser ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-zinc-800 border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
        )}
      >
        {isUser ? (
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User&backgroundColor=transparent" alt="User" className="w-full h-full object-cover" />
        ) : (
          <img src="https://api.dicebear.com/7.x/bottts/svg?seed=RepairMate&backgroundColor=transparent" alt="AI" className="w-full h-full object-cover p-1" />
        )}
      </div>

      <div className="flex flex-col gap-2 min-w-0 flex-1 mt-1">
        <div className="font-semibold text-xs text-zinc-500 tracking-widest uppercase mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {isUser ? 'You' : 'RepairMate AI'}
        </div>
        
        {message.image && (
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 shadow-2xl mb-3">
            <img 
              src={message.image} 
              alt="Uploaded device" 
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="prose prose-sm md:prose-base prose-invert max-w-none break-words text-zinc-300 prose-p:leading-relaxed prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-strong:text-white">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

