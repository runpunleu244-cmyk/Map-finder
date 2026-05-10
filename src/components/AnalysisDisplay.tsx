import React from 'react';
import { Building2, CloudSun, Compass, ShieldAlert, MapPin, Target } from 'lucide-react';
import type { AnalysisResult } from '../lib/gemini';
import { motion } from 'motion/react';

interface AnalysisDisplayProps {
  result: AnalysisResult;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-emerald-400" />
          <span className="font-mono text-sm uppercase tracking-wider text-zinc-400">Certainty Level</span>
        </div>
        <div className="text-2xl font-mono font-bold text-emerald-400">
          {result.certainty}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={item} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-tighter">Architecture</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed italic">"{result.clues.architectural}"</p>
        </motion.div>

        <motion.div variants={item} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <CloudSun className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-tighter">Environmental</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed italic">"{result.clues.environmental}"</p>
        </motion.div>

        <motion.div variants={item} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <Compass className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-tighter">Astronomical</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed italic">"{result.clues.astronomical}"</p>
        </motion.div>

        {result.clues.insane && (
          <motion.div variants={item} className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-tighter">Insane Mode Analysis</span>
            </div>
            <p className="text-sm text-emerald-200/80 leading-relaxed italic">"{result.clues.insane}"</p>
          </motion.div>
        )}
      </div>

      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <MapPin className="w-4 h-4" />
          <span className="text-xs uppercase font-bold tracking-widest">Identified Locations</span>
        </div>
        <div className="space-y-2">
          {result.locationPossible.map((loc, i) => (
            <div key={i} className="p-3 bg-zinc-800 border-l-4 border-emerald-500 rounded-r-md text-sm font-medium text-zinc-200">
              {loc}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
