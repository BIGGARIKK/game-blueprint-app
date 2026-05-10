import React from 'react';
import { NodeProps } from '@xyflow/react';

export default function StickyNote({ data, selected }: NodeProps<{ label: string }>) {
  return (
    // ดีไซน์ทรงสี่เหลี่ยมจตุรัส สีเหลืองนวลโปร่งแสง สไตล์ Post-it
    <div className={`w-48 h-48 p-4 bg-amber-200/90 backdrop-blur-sm border-2 transition-all shadow-lg rotate-1 ${
      selected ? 'border-amber-500 scale-105 shadow-amber-500/20' : 'border-amber-300/50 hover:border-amber-400'
    } flex flex-col items-center justify-center text-center overflow-hidden`}>
      
      {/* ลายกระดาษด้านบน */}
      <div className="absolute top-0 left-0 w-full h-2 bg-amber-300/50" />
      
      {/* ข้อความโน้ต */}
      <p className="text-slate-800 text-sm font-medium leading-relaxed overflow-y-auto w-full break-words whitespace-pre-wrap">
        {data.label || 'พิมพ์โน้ตตรงนี้...'}
      </p>

      {/* ไอคอนจางๆ มุมขวา */}
      <div className="absolute bottom-1 right-2 text-amber-600/30 text-[10px] font-bold italic select-none">
        STICKY NOTE
      </div>
    </div>
  );
}