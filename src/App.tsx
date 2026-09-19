import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { Message, type RepairAnalysis } from './types';
import { analyzeRepairIssueStructured, chatWithRepairMate } from './services/api';
import { Wrench, AlertCircle, ArrowLeft } from 'lucide-react';
import {
  LandingPageSkeleton,
  CameraCaptureSkeleton,
  LoadingScreenSkeleton,
  AnalysisDashboardSkeleton,
} from './components/SkeletonLoaders';

const LandingPage = lazy(() => import('./components/LandingPage').then((m) => ({ default: m.LandingPage })));
const CameraCapture = lazy(() => import('./components/CameraCapture').then((m) => ({ default: m.CameraCapture })));
const LoadingScreen = lazy(() => import('./components/LoadingScreen').then((m) => ({ default: m.LoadingScreen })));
const AnalysisDashboard = lazy(() => import('./components/AnalysisDashboard').then((m) => ({ default: m.AnalysisDashboard })));

type AppState = 'landing' | 'camera' | 'loading' | 'dashboard' | 'error';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [analysis, setAnalysis] = useState<RepairAnalysis | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing device...');
  const [imageError, setImageError] = useState<{ issue: string; message: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setAppState('loading');
    setLoadingMessage('🔍 Detecting device...');
    
    const timer1 = setTimeout(() => setLoadingMessage('🧠 Identifying components...'), 2000);
    const timer2 = setTimeout(() => setLoadingMessage('⚙️ Diagnosing possible faults...'), 4000);
    const timer3 = setTimeout(() => setLoadingMessage('📋 Generating repair instructions...'), 6000);
    
    try {
      const result = await analyzeRepairIssueStructured(
        "Perform a professional engineering diagnostic analysis on this device image. Identify components, potential faults, and provide precise repair instructions.",
        imageSrc
      );
      
      if (result.imageQuality && !result.imageQuality.isClear) {
        setImageError({
          issue: result.imageQuality.issue || 'Unidentifiable',
          message: result.imageQuality.feedbackMessage || 'The image is not clear enough to diagnose. Please take a better picture.'
        });
        setAppState('error');
        return;
      }
      
      setAnalysis(result);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `I've analyzed the image. It looks like a **${result.deviceIdentification.name}**. You can see the detailed breakdown above. Do you have any specific questions about the repair?`,
        }
      ]);
      setAppState('dashboard');
    } catch (error: any) {
      console.error('Error during analysis:', error);
      setImageError({
        issue: 'Analysis Failed',
        message: error.message || 'Failed to analyze the image. Please try again.'
      });
      setAppState('error');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    }
  };

  const handleSendMessage = async (content: string, image?: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content || 'Can you help me fix this?',
      image,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages.map(msg => {
        const parts: any[] = [{ text: msg.content }];
        if (msg.image) {
          const matches = msg.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            parts.push({
              inlineData: {
                mimeType: matches[1],
                data: matches[2]
              }
            });
          }
        }
        return {
          role: msg.role === 'user' ? 'user' as const : 'model' as const,
          parts
        };
      });

      // Ensure the first message is from the user for Gemini API
      if (history.length > 0 && history[0].role === 'model') {
        const initialParts: any[] = [{ text: "Perform a professional engineering diagnostic analysis on this device image." }];
        if (capturedImage) {
          const matches = capturedImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            initialParts.push({
              inlineData: {
                mimeType: matches[1],
                data: matches[2]
              }
            });
          }
        }
        history.unshift({ role: 'user', parts: initialParts });
      }

      const responseText = await chatWithRepairMate(history, content, image);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Error:** ${error.message || 'I encountered an issue while trying to process your request. Please try again.'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAppState('landing');
    setAnalysis(null);
    setMessages([]);
    setCapturedImage(null);
  };

  if (appState === 'landing') {
    return (
      <Suspense fallback={<LandingPageSkeleton />}>
        <LandingPage 
          onOpenCamera={() => setAppState('camera')} 
          onUploadImage={handleImageCapture} 
        />
      </Suspense>
    );
  }

  if (appState === 'camera') {
    return (
      <Suspense fallback={<CameraCaptureSkeleton />}>
        <CameraCapture 
          onCapture={handleImageCapture} 
          onClose={() => setAppState('landing')} 
        />
      </Suspense>
    );
  }

  if (appState === 'loading') {
    return (
      <Suspense fallback={<LoadingScreenSkeleton />}>
        <LoadingScreen message={loadingMessage} />
      </Suspense>
    );
  }

  if (appState === 'error' && imageError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6 relative overflow-hidden w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="z-10 flex flex-col items-center text-center max-w-md bg-zinc-900/40 backdrop-blur-xl p-8 rounded-3xl border border-red-500/20 shadow-2xl">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <AlertCircle size={48} className="text-red-400" />
          </div>
          
          <h2 className="text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Image Issue: {imageError.issue}</h2>
          <p className="text-zinc-400 mb-10 text-lg leading-relaxed">{imageError.message}</p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={handleReset}
              className="flex-1 py-3.5 px-4 bg-zinc-800/50 hover:bg-zinc-800 border border-white/10 hover:border-white/20 rounded-2xl font-semibold transition-all duration-300"
            >
              Cancel
            </button>
            <button 
              onClick={() => setAppState('camera')}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white rounded-2xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
            >
              Retake Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-transparent font-sans text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-cyan-500 focus:text-zinc-950 focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
      >
        Skip to content
      </a>
      {/* Header */}
      <header className="flex-none bg-zinc-950/60 backdrop-blur-xl border-b border-white/5 px-4 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleReset} aria-label="Back to start" className="p-2.5 hover:bg-white/5 rounded-full transition-all duration-300 hover:scale-105 mr-1 group">
              <ArrowLeft size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
            </button>
            <div aria-hidden="true" className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-2.5 rounded-xl text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <Wrench size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>RepairMate <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span></p>
              <p className="text-xs text-cyan-400/80 font-medium tracking-wide uppercase mt-0.5">Live Assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <div className="max-w-6xl mx-auto flex flex-col gap-10 pb-36">
          
          {/* Dashboard Section */}
          {analysis && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Analysis Results</h2>
              </div>
              <Suspense fallback={<AnalysisDashboardSkeleton />}>
                <AnalysisDashboard analysis={analysis} capturedImage={capturedImage} />
              </Suspense>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-2 opacity-60">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Follow-up Chat</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          {/* Chat Section */}
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full" aria-live="polite">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div role="status" aria-label="RepairMate is typing" className="flex w-full gap-4 p-5 md:p-6 rounded-3xl bg-zinc-800/30 backdrop-blur-xl border border-white/10 shadow-xl mr-auto max-w-[90%]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-inner overflow-hidden bg-zinc-800 border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=RepairMate&backgroundColor=transparent" alt="AI" className="w-full h-full object-cover p-1" />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex gap-1.5 items-center h-full" aria-hidden="true">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <div className="flex-none bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-12 pb-6 px-4 fixed bottom-0 left-0 right-0 z-20 backdrop-blur-[2px]">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          <div className="mt-4 text-center flex items-center justify-center gap-2 text-xs text-zinc-400/80 font-medium">
            <AlertCircle size={14} aria-hidden="true" />
            <span>Always prioritize safety. Unplug devices before attempting repairs.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
