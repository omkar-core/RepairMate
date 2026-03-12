import React, { useState } from 'react';
import { RepairAnalysis } from '../types';
import { 
  Camera, AlertTriangle, Wrench, ShieldAlert, CheckCircle, Clock, 
  Activity, Target, Share2, Cpu, MapPin, Lightbulb, UserCog, DollarSign, Leaf, BookOpen, Check, Recycle, Download, ChevronRight, AlertOctagon, Info, Cloud
} from 'lucide-react';
import { motion } from 'motion/react';

interface AnalysisDashboardProps {
  analysis: RepairAnalysis;
  capturedImage?: string | null;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis, capturedImage }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const handleShare = async () => {
    const shareText = `RepairMate AI Analysis for ${analysis.deviceIdentification.name}\n\nDifficulty: ${analysis.difficulty}\nEstimated Time: ${analysis.estimatedTime}\n\nTools Needed:\n${analysis.toolsNeeded.map(t => '- ' + t).join('\n')}\n\nSteps:\n${analysis.repairSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Repair Guide: ${analysis.deviceIdentification.name}`,
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Repair guide copied to clipboard!');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        alert('Failed to copy to clipboard. Please try manually.');
      }
    }
  };

  const handleDownload = () => {
    const shareText = `RepairMate AI Analysis for ${analysis.deviceIdentification.name}\n\nDifficulty: ${analysis.difficulty}\nEstimated Time: ${analysis.estimatedTime}\n\nTools Needed:\n${analysis.toolsNeeded.map(t => '- ' + t).join('\n')}\n\nSteps:\n${analysis.repairSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    const blob = new Blob([shareText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repair-guide-${analysis.deviceIdentification.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const primaryIssue = analysis.possibleIssues?.length > 0 
    ? analysis.possibleIssues.reduce((prev, current) => (prev.likelihood > current.likelihood) ? prev : current)
    : null;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full max-w-6xl mx-auto relative pb-12"
    >
      {/* Action Buttons */}
      <div className="absolute -top-14 right-0 z-10 flex items-center gap-2">
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-800 text-cyan-400 rounded-xl border border-white/10 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Download size={16} />
          <span className="text-sm font-medium hidden sm:inline">Download</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-800 text-cyan-400 rounded-xl border border-white/10 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Share2 size={16} />
          <span className="text-sm font-medium hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Hero Section: The Diagnosis */}
      <motion.div variants={itemVariants} className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          {/* Image Preview */}
          {capturedImage && (
            <div className="w-full md:w-1/3 shrink-0 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <img 
                src={capturedImage} 
                alt="Analyzed Device" 
                className="w-full aspect-square object-cover rounded-2xl border border-white/20 shadow-2xl relative z-10"
              />
              <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <Target size={14} className="text-cyan-400" />
                <span className="text-xs font-medium text-white">Analyzed Subject</span>
              </div>
            </div>
          )}

          {/* Main Info */}
          <div className="flex-1 flex flex-col justify-center w-full">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-bold uppercase tracking-widest">
                Diagnostic Report
              </span>
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 border border-white/10 rounded-full text-xs font-medium">
                {analysis.deviceIdentification.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {analysis.deviceIdentification.name}
            </h1>
            <p className="text-lg text-zinc-400 mb-8 font-medium">
              by {analysis.deviceIdentification.brand}
            </p>

            {primaryIssue && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl text-red-400 shrink-0">
                  <AlertOctagon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-1">Primary Fault Detected</h3>
                  <p className="text-white text-lg font-medium">{primaryIssue.issue}</p>
                  <p className="text-zinc-400 text-sm mt-1">{analysis.faultLocationDescription}</p>
                </div>
                <div className="sm:ml-auto text-left sm:text-right shrink-0 mt-2 sm:mt-0">
                  <span className="block text-3xl font-bold text-red-400">{primaryIssue.likelihood}%</span>
                  <span className="text-xs text-red-400/70 uppercase font-bold tracking-wider">Likelihood</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-zinc-800/60 transition-colors">
          <div className="p-3 bg-zinc-800 rounded-xl text-cyan-400 border border-white/5">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Difficulty</p>
            <p className={`text-sm font-bold ${getDifficultyColor(analysis.difficulty).split(' ')[0]}`}>{analysis.difficulty}</p>
          </div>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-zinc-800/60 transition-colors">
          <div className="p-3 bg-zinc-800 rounded-xl text-cyan-400 border border-white/5">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Est. Time</p>
            <p className="text-sm font-bold text-white">{analysis.estimatedTime}</p>
          </div>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-zinc-800/60 transition-colors">
          <div className="p-3 bg-zinc-800 rounded-xl text-green-400 border border-white/5">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Est. Cost</p>
            <p className="text-sm font-bold text-white">{analysis.estimatedCost}</p>
          </div>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-zinc-800/60 transition-colors">
          <div className="p-3 bg-zinc-800 rounded-xl text-purple-400 border border-white/5">
            <Target size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-0.5">AI Confidence</p>
            <p className="text-sm font-bold text-white">{analysis.confidenceScore}%</p>
          </div>
        </div>
      </motion.div>

      {/* Safety Critical (Only show if there are warnings) */}
      {analysis.safetyWarnings?.length > 0 && (
        <motion.div variants={itemVariants} className="bg-orange-500/10 border-2 border-orange-500/30 rounded-2xl p-6 relative overflow-hidden">
          {/* Hazard stripes background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #f97316 0, #f97316 10px, transparent 10px, transparent 20px)' }}></div>
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <ShieldAlert size={24} className="text-orange-500" />
            <h3 className="text-xl font-bold text-orange-500 uppercase tracking-wide">Critical Safety Warnings</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
            {analysis.safetyWarnings.map((warning, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-orange-500/5 p-3 rounded-xl border border-orange-500/10">
                <AlertTriangle size={16} className="text-orange-400 shrink-0 mt-0.5" />
                <span className="text-orange-200/90 text-sm font-medium leading-relaxed">{warning}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tools & Components */}
        <div className="flex flex-col gap-6">
          {/* Tools Needed */}
          <motion.div variants={itemVariants} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                <Wrench size={20} />
              </div>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Required Tools</h3>
            </div>
            <ul className="space-y-3">
              {analysis.toolsNeeded?.length > 0 ? (
                analysis.toolsNeeded.map((tool, idx) => (
                  <li key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-white/5 hover:bg-zinc-800 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/5 shrink-0">
                      <Wrench size={14} className="text-blue-400/70" />
                    </div>
                    <span className="text-zinc-200 text-sm font-medium">{tool}</span>
                  </li>
                ))
              ) : (
                <li className="text-zinc-500 text-sm italic p-3">No specific tools identified.</li>
              )}
            </ul>
          </motion.div>

          {/* Components Detected */}
          <motion.div variants={itemVariants} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                <Cpu size={20} />
              </div>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Detected Components</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.componentsDetected?.length > 0 ? (
                analysis.componentsDetected.map((comp, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm border border-white/5 font-medium">
                    {comp}
                  </span>
                ))
              ) : (
                <span className="text-zinc-500 text-sm italic">No specific components identified.</span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Repair Steps */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Repair Protocol</h3>
            </div>
            <div className="text-sm font-bold text-zinc-500 bg-zinc-800 px-4 py-1.5 rounded-full border border-white/5">
              {completedSteps.size} / {analysis.repairSteps?.length || 0} COMPLETED
            </div>
          </div>

          <div className="relative space-y-0 before:absolute before:inset-0 before:ml-[1.375rem] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/20 before:via-white/10 before:to-transparent">
            {analysis.repairSteps?.length > 0 ? (
              analysis.repairSteps.map((step, idx) => {
                const parts = step.split(/(?<=\.)\s+/);
                const firstPart = parts[0];
                const rest = parts.slice(1).join(' ');
                const isCompleted = completedSteps.has(idx);
                
                return (
                  <div key={idx} className="relative flex items-start gap-6 pb-8 last:pb-0 group">
                    <button 
                      onClick={() => toggleStep(idx)}
                      className={`flex-shrink-0 w-11 h-11 rounded-full bg-zinc-950 border-2 flex items-center justify-center font-bold text-base z-10 transition-all duration-300 cursor-pointer ${
                        isCompleted
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110' 
                          : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400'
                      }`}
                    >
                      {isCompleted ? <Check size={20} strokeWidth={3} /> : idx + 1}
                    </button>
                    <div 
                      onClick={() => toggleStep(idx)}
                      className={`flex-1 p-5 md:p-6 rounded-2xl border transition-all duration-300 mt-[-4px] cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' 
                          : 'bg-zinc-800/40 hover:bg-zinc-800/80 border-white/5 hover:border-white/10 shadow-lg'
                      }`}
                    >
                      <p className={`text-base leading-relaxed transition-all duration-300 ${isCompleted ? 'text-zinc-500' : 'text-zinc-300'}`}>
                        {rest ? (
                          <>
                            <strong className={`block mb-2 text-lg font-bold transition-colors ${isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>{firstPart}</strong>
                            <span className={`transition-colors ${isCompleted ? 'text-zinc-600' : 'text-zinc-400'}`}>{rest}</span>
                          </>
                        ) : (
                          <span className={isCompleted ? 'line-through' : ''}>{step}</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-zinc-500 italic p-4">No repair steps provided.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Extra Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {/* Pro Recommendation */}
        <motion.div variants={itemVariants} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-zinc-800/60 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <UserCog size={18} className="text-blue-400" />
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Pro Advice</h4>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {analysis.professionalRecommendation?.join(' ') || "No specific professional advice provided."}
          </p>
        </motion.div>

        {/* Alternative Solutions */}
        <motion.div variants={itemVariants} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-zinc-800/60 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <Lightbulb size={18} className="text-yellow-400" />
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Alternatives</h4>
          </div>
          <ul className="text-sm text-zinc-400 leading-relaxed space-y-1">
            {analysis.alternativeSolutions?.map((sol, i) => (
              <li key={i} className="flex items-start gap-2">
                <ChevronRight size={14} className="shrink-0 mt-0.5 text-yellow-500/50" />
                <span>{sol}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Sustainability */}
        <motion.div variants={itemVariants} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-zinc-800/60 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <Leaf size={18} className="text-emerald-400" />
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Eco Impact</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-zinc-800/50 p-2 rounded-lg">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                <Recycle size={14} /> E-Waste
              </div>
              <span className="text-emerald-400 font-bold text-sm">{analysis.sustainabilityImpact.eWasteSaved}</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-800/50 p-2 rounded-lg">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                <Cloud size={14} /> Carbon
              </div>
              <span className="text-emerald-400 font-bold text-sm">{analysis.sustainabilityImpact.carbonSaved}</span>
            </div>
          </div>
        </motion.div>

        {/* Learning */}
        <motion.div variants={itemVariants} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-zinc-800/60 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen size={18} className="text-indigo-400" />
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Did You Know?</h4>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed italic">
            "{analysis.learningSection}"
          </p>
        </motion.div>
      </div>

    </motion.div>
  );
};
