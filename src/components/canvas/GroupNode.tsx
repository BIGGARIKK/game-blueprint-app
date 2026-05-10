import React from 'react';
import { NodeProps } from '@xyflow/react';

export default function GroupNode({ data, selected }: NodeProps<{ label: string }>) {
  return (
    // w-full h-full จะถูกขยายขนาดอัตโนมัติตามที่ Dagre คำนวณมาให้
    <div 
      className={`w-full h-full bg-slate-950/30 backdrop-blur-[2px] border-2 border-dashed rounded-2xl transition-colors ${
        selected ? 'border-cyan-400 bg-slate-900/40' : 'border-slate-700 hover:border-slate-500'
      } relative pointer-events-none`}
    >
      {/* แท็บชื่อกลุ่ม ลอยอยู่ด้านบนซ้าย (pointer-events-auto เพื่อให้คลิกเลือกกลุ่มจากป้ายชื่อได้) */}
      <div className="absolute -top-7 left-4 bg-slate-900 border border-slate-700 px-3 py-1 rounded-t-lg shadow-md pointer-events-auto flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-xs font-bold text-slate-200 tracking-wide">
          {data.label}
        </span>
      </div>

      {/* ป้ายบอกสถานะจางๆ มุมขวาล่าง */}
      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-600 select-none">
        MODULE CONTAINER
      </div>
    </div>
  );
}