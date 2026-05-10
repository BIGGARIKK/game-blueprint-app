import React from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';

const categories = ['UI', 'Scripting', 'Database', 'Networking', 'Art', 'Sound'] as const;

export default function QuickAddBar() {
  const { addNode, addGroup, addStickyNote } = useCanvasStore();
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 z-10 overflow-x-auto max-w-full">
      <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">➕ Quick Add:</span>
      
      {/* +++ ปุ่มเพิ่มกล่องกลุ่ม (Group Container) +++ */}
      <button
        onClick={addGroup}
        className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/60 border border-dashed border-cyan-400 text-cyan-300 hover:bg-cyan-900 hover:scale-105 transition-all shadow-sm flex items-center gap-1 mr-1"
      >
        📦 Group
      </button>
      <button
        onClick={addStickyNote}
        className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 border border-dashed border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-950 hover:scale-105 transition-all shadow-sm flex items-center gap-1 mr-1"
      >
        📝 Note
      </button>

      <span className="text-slate-700 select-none">|</span>

      {categories.map((cat) => {
        let btnColor = 'hover:border-slate-400 text-slate-300';
        if (cat === 'UI') btnColor = 'hover:border-pink-500 hover:text-pink-400';
        if (cat === 'Scripting') btnColor = 'hover:border-lime-500 hover:text-lime-400';
        if (cat === 'Database') btnColor = 'hover:border-amber-500 hover:text-amber-400';
        if (cat === 'Networking') btnColor = 'hover:border-cyan-500 hover:text-cyan-400';
        if (cat === 'Art') btnColor = 'hover:border-purple-500 hover:text-purple-400';
        if (cat === 'Sound') btnColor = 'hover:border-emerald-500 hover:text-emerald-400';

        return (
          <button
            key={cat}
            onClick={() => addNode(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium bg-slate-950 border border-slate-800 transition-all duration-200 hover:scale-105 shadow-sm ${btnColor}`}
          >
            + {cat}
          </button>
          
        );
      })}
    </div>
  );
}