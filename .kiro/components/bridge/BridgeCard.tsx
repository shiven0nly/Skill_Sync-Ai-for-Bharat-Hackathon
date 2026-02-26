// BridgeUI.tsx
import { motion } from 'framer-motion';

export const BridgeCard = ({ originalConcept, translatedConcept, metaphor }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 border-l-4 border-blue-500 bg-slate-900 rounded-r-lg"
    >
      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">The Bridge</h3>
      <div className="mt-2">
          <span className="line-through text-slate-500">{originalConcept}</span>
          <span className="mx-2 text-white">→</span>
          <span className="text-green-400 font-mono">{translatedConcept}</span>
      </div>
      <p className="mt-3 text-sm italic text-slate-300">
        "💡 {metaphor}"
      </p>
    </motion.div>
  );
};