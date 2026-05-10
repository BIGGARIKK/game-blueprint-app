import React, { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { gamePresets } from '@/data/presets';
import { ConfirmDialog } from './ConfirmDialog';

export default function PresetSelector() {
  const syncFromJSON = useCanvasStore((state) => state.syncFromJSON);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ปิดเมนูอัตโนมัติเมื่อคลิกพื้นที่อื่นบนหน้าจอ
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
      }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  const handleSelectPreset = (preset : any) => {
    setConfirmDialog({
      isOpen: true,
      title: `กระดานปัจจุบันจะถูกแทนที่ด้วยเทมเพลต "${preset.name}"\nคุณต้องการยืนยันหรือไม่?`,
      message: preset.desc,
      onConfirm: () => {
        syncFromJSON(preset.json);
        setIsOpen(false);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  }

  return (
    <div className="relative font-sans" ref={menuRef}>

    <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmLabel="แทนที่"
                cancelLabel="ยกเลิก"
                variant="warning"
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
              />

      {/* ปุ่มกดเปิดเมนู */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
      >
        <span>📁 โหลดเทมเพลต</span>
        <span className="text-[10px] text-slate-500">▼</span>
      </button>

      {/* รายการ Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in-50 duration-100">
          <div className="p-2 bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            เลือกเทมเพลตเกมตั้งต้น
          </div>
          
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
            {gamePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="w-full text-left p-2.5 hover:bg-slate-800 transition-colors block group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                  {preset.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  {preset.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}