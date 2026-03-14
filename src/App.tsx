import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { LandingPage } from './components/LandingPage';
import { CameraCapture } from './components/CameraCapture';
import { LoadingScreen } from './components/LoadingScreen';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { Message } from './types';
import { analyzeRepairIssueStructured, chatWithRepairMate, RepairAnalysis } from './services/geminiService';
import { Wrench, AlertCircle, ArrowLeft } from 'lucide-react';

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
    setLoadingMessage('Analyzing device...');
    
    const timer1 = setTimeout(() => setLoadingMessage('Detecting components...'), 2500);
    const timer2 = setTimeout(() => setLoadingMessage('Generating repair steps...'), 5000);
    
    try {
      let base64Image = '';
      let mimeType = '';
      
      const matches = imageSrc.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Image = matches[2];
      }

      const result = await analyzeRepairIssueStructured(
        "Perform a professional engineering diagnostic analysis on this device image. Identify components, potential faults, and provide precise repair instructions.",
        base64Image,
        mimeType
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
      <LandingPage 
        onOpenCamera={() => setAppState('camera')} 
        onUploadImage={handleImageCapture} 
      />
    );
  }

  if (appState === 'camera') {
    return (
      <CameraCapture 
        onCapture={handleImageCapture} 
        onClose={() => setAppState('landing')} 
      />
    );
  }

  if (appState === 'loading') {
    return <LoadingScreen message={loadingMessage} />;
  }

  if (appState === 'error' && imageError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6 relative overflow-hidden">
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
      {/* Header */}
      <header className="flex-none bg-zinc-950/60 backdrop-blur-xl border-b border-white/5 px-4 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleReset} className="p-2.5 hover:bg-white/5 rounded-full transition-all duration-300 hover:scale-105 mr-1 group">
              <ArrowLeft size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
            </button>
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-2.5 rounded-xl text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <Wrench size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>RepairMate <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span></h1>
              <p className="text-xs text-cyan-400/80 font-medium tracking-wide uppercase mt-0.5">Live Assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <div className="max-w-6xl mx-auto flex flex-col gap-10 pb-36">
          
          {/* Dashboard Section */}
          {analysis && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Analysis Results</h2>
              </div>
              <AnalysisDashboard analysis={analysis} capturedImage={capturedImage} />
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-2 opacity-60">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Follow-up Chat</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          {/* Chat Section */}
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex w-full gap-4 p-5 md:p-6 rounded-3xl bg-zinc-800/30 backdrop-blur-xl border border-white/10 shadow-xl mr-auto max-w-[90%]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-[0_0_15px_rgba(34,211,238,0.15)] bg-zinc-800 text-cyan-400 border border-white/10">
                  <Wrench size={20} className="animate-spin" />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex gap-1.5 items-center h-full">
                    <span className="w-2.5 h-2.5 bg-cyan-400/80 rounded-full animate-bounce shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2.5 h-2.5 bg-cyan-400/80 rounded-full animate-bounce shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2.5 h-2.5 bg-cyan-400/80 rounded-full animate-bounce shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ animationDelay: '300ms' }}></span>
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
          <div className="mt-4 text-center flex items-center justify-center gap-2 text-xs text-zinc-500/80 font-medium">
            <AlertCircle size={14} />
            <span>Always prioritize safety. Unplug devices before attempting repairs.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
