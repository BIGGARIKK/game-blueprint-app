import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FeatureNodeData, useCanvasStore } from '@/store/useCanvasStore';

const categoryStyles: Record<string, { bg: string; text: string; border: string; glow: string; bar: string; handle: string }> = {
  UI: { bg: 'bg-pink-950/40', text: 'text-pink-400', border: 'border-pink-500/30', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.15)]', bar: 'from-pink-500 to-rose-400', handle: '!bg-pink-500' },
  Scripting: { bg: 'bg-lime-950/40', text: 'text-lime-400', border: 'border-lime-500/30', glow: 'shadow-[0_0_15px_rgba(132,204,22,0.15)]', bar: 'from-lime-500 to-emerald-400', handle: '!bg-lime-500' },
  Database: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]', bar: 'from-amber-500 to-orange-400', handle: '!bg-amber-500' },
  Networking: { bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]', bar: 'from-cyan-500 to-blue-500', handle: '!bg-cyan-500' },
  Art: { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]', bar: 'from-purple-500 to-indigo-400', handle: '!bg-purple-500' },
  Sound: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', bar: 'from-emerald-500 to-teal-400', handle: '!bg-emerald-500' },
};

export default function FeatureNode({ id, data }: NodeProps<FeatureNodeData>) {
  const toggleTask = useCanvasStore((state) => state.toggleTask);
  
  const style = categoryStyles[data.category || 'Scripting'] || {
    bg: 'bg-slate-900/40', text: 'text-slate-400', border: 'border-slate-700/50', glow: 'shadow-xl', bar: 'from-slate-500 to-slate-400', handle: '!bg-slate-400',
  };

  const totalTasks = (data.tasks || []).length;
  const completedTasks = (data.tasks || []).filter((t) => t.done).length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // +++ ฟังก์ชันเรนเดอร์ป้ายความสำคัญ +++
  const renderPriority = () => {
    if (data.priority === 'high') return <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 px-1.5 py-0.5 rounded text-[9px] font-bold">🔥 HIGH</span>;
    if (data.priority === 'medium') return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded text-[9px] font-bold">⚡ MED</span>;
    return null; // แบบ Low หลบให้หน้าจอไม่รก
  };

  // +++ ฟังก์ชันเรนเดอร์ป้ายสถานะ (ป้าย Bug จะสว่างเรืองแสงและกะพริบเด่นที่สุด) +++
  const renderStatus = () => {
    if (data.status === 'bug') {
      return (
        <span className="bg-rose-500/20 text-rose-400 border border-rose-500 px-2 py-0.5 rounded text-[9px] font-black animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]">
          🚨 BUG
        </span>
      );
    }
    if (data.status === 'in_progress') return <span className="bg-sky-500/20 text-sky-400 border border-sky-500/40 px-1.5 py-0.5 rounded text-[9px] font-bold">⏳ IN PROGRESS</span>;
    if (data.status === 'review') return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/40 px-1.5 py-0.5 rounded text-[9px] font-bold">🔍 REVIEW</span>;
    return <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[9px]">💡 PLANNED</span>;
  };

  return (
    <div className={`w-72 bg-slate-900/80 backdrop-blur-md border ${style.border} rounded-xl ${style.glow} transition-all duration-200 hover:border-slate-400/50 relative`}>
      <Handle type="target" position={Position.Left} className={`!w-2.5 !h-8 ${style.handle} !border-2 !border-slate-950 !rounded-md !-left-3 cursor-crosshair transition-transform hover:scale-125 z-20`} />

      <div className="rounded-xl overflow-hidden">
        {/* Header แผนก */}
        <div className={`p-2.5 px-3 ${style.bg} border-b border-slate-800/80 flex items-center justify-between`}>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border border-current/20 ${style.text}`}>
            {data.category || 'Scripting'}
          </span>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-950/50 px-2 py-0.5 rounded-full">
            {completedTasks}/{totalTasks}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950/60 h-1">
          <div className={`bg-gradient-to-r ${style.bar} h-1 transition-all duration-500 ease-out`} style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Body */}
        <div className="p-4">
          
          {/* +++ โซนป้าย Priority และ Status ลอยอยู่เหนือชื่อโหนด +++ */}
          <div className="flex items-center gap-1.5 mb-2">
            {renderStatus()}
            {renderPriority()}
          </div>

          <h3 className="text-slate-100 font-medium text-sm mb-3 tracking-wide leading-snug">
            {data.label}
          </h3>

          {/* Tasks */}
          <div className="space-y-2">
            {(data.tasks || []).map((task) => (
              <label 
                key={task.id} 
                onClick={(e) => e.stopPropagation()} 
                className="flex items-start gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer group select-none"
              >
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(id, task.id)}
                    className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer transition-colors"
                  />
                </div>
                <span className={`transition-all duration-200 leading-relaxed ${task.done ? 'line-through text-slate-500 opacity-60' : 'text-slate-300 group-hover:text-slate-100'}`}>
                  {task.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className={`!w-2.5 !h-8 ${style.handle} !border-2 !border-slate-950 !rounded-md !-right-3 cursor-crosshair transition-transform hover:scale-125 z-20`} />
    </div>
  );
}