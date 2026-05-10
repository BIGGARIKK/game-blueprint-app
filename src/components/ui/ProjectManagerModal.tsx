import React, { useState, useRef } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function ProjectManagerModal({ onClose }: { onClose: () => void }) {
  const { projects, currentProjectId, createNewProject, switchProject, deleteProject, renameProject } = useCanvasStore();
  const [newProjName, setNewProjName] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // อ้างอิงตัว input file สำหรับกด Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. ฟังก์ชันสร้างโปรเจกต์ใหม่จากชื่อ ---
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    createNewProject(newProjName.trim());
    setNewProjName('');
    onClose();
  };

  // --- 2. ฟังก์ชัน Export ดาวน์โหลดไฟล์ .json ลงเครื่อง ---
  const handleExportProject = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // ไม่ให้ทะลุไปทริกเกอร์สลับโปรเจกต์
    const jsonStr = localStorage.getItem(`BLUEPRINT_DATA_${id}`);
    if (!jsonStr) {
      alert('ไม่พบข้อมูลของโปรเจกต์นี้ในระบบ');
      return;
    }

    try {
      // สร้างไฟล์ Blob สำหรับดาวน์โหลด
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.toLowerCase().replace(/\s+/g, '-')}-backup.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการ Export ไฟล์');
    }
  };

  // --- 3. ฟังก์ชัน Import อ่านไฟล์ .json ขึ้นมาสร้างเป็นโปรเจกต์ ---
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // ลอง parse ดูก่อนว่า JSON ถูกต้องไหม
        const parsed = JSON.parse(content);
        
        // ดึงชื่อระบบจากไฟล์ ถ้าไม่มีให้ใช้ชื่อไฟล์แทน
        const importedName = parsed.systemName || file.name.replace('.json', '');
        
        // สั่งสร้างโปรเจกต์ใหม่โดยยัด JSON ก้อนนี้เข้าไปเลย
        createNewProject(importedName, content);
        onClose();
      } catch (err) {
        alert('❌ ไฟล์ JSON ไม่ถูกต้อง หรือไม่สามารถอ่านโครงสร้าง Blueprint นี้ได้');
      }
    };
    reader.readAsText(file);
    
    // รีเซ็ตค่า input เพื่อให้กดอัปโหลดไฟล์เดิมซ้ำได้ในอนาคต
    e.target.value = '';
  };

  // --- ฟังก์ชันจัดการ Rename ---
  const handleStartRename = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleSaveRename = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editValue.trim()) {
      renameProject(id, editValue.trim());
    }
    setEditingId(null);
  };

  const sortedProjects = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-black tracking-wider text-cyan-400 uppercase flex items-center gap-2">
            <span>📁 จัดการโปรเจกต์ & แบ็กอัป</span>
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white font-bold text-xs px-2 py-1 bg-slate-800 rounded transition-colors">✕</button>
        </div>

        {/* โซนที่ 1: สร้างใหม่ และ Import ไฟล์ */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 space-y-3">
          
          {/* ฟอร์มสร้างโปรเจกต์เปล่า */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              placeholder="ตั้งชื่อเกม / โปรเจกต์ใหม่..."
              value={newProjName}
              onChange={(e) => setNewProjName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded text-xs font-bold shadow-md transition-all">
              ➕ สร้าง
            </button>
          </form>

          {/* +++ ปุ่ม Import JSON ภายนอก +++ */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span className="text-[11px] text-slate-400 font-medium">มีไฟล์ผังเก่าอยู่แล้ว?</span>
            
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              onChange={handleImportFile} 
              className="hidden" 
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 shadow-sm"
            >
              📂 Import JSON
            </button>
          </div>

        </div>

        {/* โซนที่ 2: รายชื่อโปรเจกต์ทั้งหมด */}
        <div className="flex-1 max-h-80 overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-800/30">
          {sortedProjects.map((proj) => {
            const isActive = proj.id === currentProjectId;
            const dateStr = new Date(proj.updatedAt).toLocaleString('th-TH', { 
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
            });
            const isEditing = editingId === proj.id;

            return (
              <div 
                key={proj.id}
                onClick={() => !isEditing && (switchProject(proj.id), onClose())}
                className={`p-3 rounded-lg flex items-center justify-between transition-all ${
                  isActive && !isEditing
                    ? 'bg-cyan-950/40 border border-cyan-500/50 text-white' 
                    : isEditing ? 'bg-slate-800 border border-slate-600' : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                } ${!isEditing ? 'cursor-pointer' : ''}`}
              >
                <div className="truncate pr-2 flex-1">
                  {isEditing ? (
                    <form onSubmit={(e) => handleSaveRename(e, proj.id)} className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-xs text-white w-full focus:outline-none"
                        onBlur={(e) => handleSaveRename(e as any, proj.id)}
                      />
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">{proj.name}</span>
                        {isActive && <span className="bg-cyan-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">ACTIVE</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">อัปเดตเมื่อ: {dateStr}</div>
                    </>
                  )}
                </div>

                {/* ปุ่มเครื่องมือ: Export / Rename / Delete */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {!isEditing && (
                    <>
                      {/* +++ ปุ่ม Export แบ็กอัป .json +++ */}
                      <button
                        onClick={(e) => handleExportProject(e, proj.id, proj.name)}
                        className="p-1.5 text-slate-400 hover:text-lime-400 hover:bg-slate-900 rounded transition-colors"
                        title="ดาวน์โหลดไฟล์ .json"
                      >
                        💾
                      </button>

                      <button
                        onClick={(e) => handleStartRename(e, proj.id, proj.name)}
                        className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-900 rounded transition-colors"
                        title="เปลี่ยนชื่อ"
                      >
                        ✏️
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`ลบโปรเจกต์ "${proj.name}" ถาวร?`)) deleteProject(proj.id);
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-950/50 rounded transition-colors"
                    title="ลบทิ้ง"
                  >
                    🗑️
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          💡 แนะนำให้กด 💾 แบ็กอัปไฟล์เก็บไว้ ป้องกันข้อมูลหายเมื่อล้างประวัติเบราว์เซอร์
        </div>

      </div>
    </div>
  );
}