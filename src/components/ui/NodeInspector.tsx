import React, { useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function NodeInspector() {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData, addTask, deleteTask, deleteNode } = useCanvasStore();
  const [newTaskText, setNewTaskText] = useState('');

  // หาโหนดที่กำลังถูกเลือกอยู่
  const node = nodes.find((n) => n.id === selectedNodeId);

  // ถ้าไม่มีการเลือกโหนด ให้ซ่อนแผงนี้ไป
  if (!node) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(node.id, newTaskText);
    setNewTaskText('');
  };

  return (
    <div className="w-80 h-full bg-slate-950 border-l border-slate-800 flex flex-col font-sans z-10 animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Node Inspector</h2>
          <p className="text-[10px] text-slate-500 font-mono">ID: {node.id}</p>
        </div>
        <button 
          onClick={() => setSelectedNodeId(null)}
          className="text-slate-500 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded"
        >
          ✕ ปิด
        </button>
      </div>

      {/* Form แก้ไขข้อมูล */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        
        {/* 1. แก้ไขชื่อโหนด */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">ชื่อระบบ (Label)</label>
          <input
            type="text"
            value={node.data.label}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 2. เปลี่ยนแผนก (Category) */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">แผนก (Category)</label>
          <select
            value={node.data.category}
            onChange={(e) => updateNodeData(node.id, { category: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="UI">UI</option>
            <option value="Scripting">Scripting</option>
            <option value="Database">Database</option>
            <option value="Networking">Networking</option>
            <option value="Art">Art</option>
            <option value="Sound">Sound</option>
          </select>
        </div>

        {/* 3. รายการ Tasks ย่อย */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2">งานย่อย (To-do Tasks)</label>
          
          {/* ฟอร์มพิมพ์เพิ่ม Task สดๆ */}
          <form onSubmit={handleAddTask} className="flex gap-1 mb-3">
            <input
              type="text"
              placeholder="พิมพ์เพิ่มงาน..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-lime-500"
            />
            <button type="submit" className="bg-lime-500 hover:bg-lime-400 text-slate-950 px-3 py-1 rounded text-xs font-bold">
              เพิ่ม
            </button>
          </form>

          {/* รายการ Task ที่มีอยู่ (กดลบได้) */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {node.data.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between bg-slate-900/50 border border-slate-800 px-2 py-1 rounded text-xs">
                <span className={`truncate text-slate-300 ${task.done ? 'line-through text-slate-500' : ''}`}>
                  {task.done ? '✔️ ' : ''}{task.text}
                </span>
                <button
                  onClick={() => deleteTask(node.id, task.id)}
                  className="text-rose-500 hover:text-rose-400 font-bold ml-2 text-[10px]"
                  title="ลบงานนี้"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer: ปุ่มอันตราย (ลบโหนด) */}
      <div className="p-3 bg-slate-900/50 border-t border-slate-800">
        <button
          onClick={() => {
            if (confirm(`ยืนยันการลบโหนด "${node.data.label}"?`)) deleteNode(node.id);
          }}
          className="w-full bg-rose-950/40 hover:bg-rose-900 text-rose-400 hover:text-white border border-rose-800/50 rounded py-1.5 text-xs font-bold transition-all"
        >
          🗑️ ลบโหนดนี้ทิ้ง
        </button>
      </div>

    </div>
  );
}