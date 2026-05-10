import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function TodoListSidebar({ onClose }: { onClose: () => void }) {
  const { nodes, edges, setSelectedNodeId, toggleTask } = useCanvasStore();
  const { fitView } = useReactFlow();

  const targetIds = new Set(edges.map((e) => e.target));
  const rootNodes = nodes.filter((n) => n.type !== 'groupNode' && n.type !== 'stickyNote' && !targetIds.has(n.id));

  // +++ 1. กรองเฉพาะโหนดที่ผู้ใช้แปะป้ายว่าติดบั๊ก (status === 'bug') +++
  const bugNodes = nodes.filter((n) => n.type !== 'groupNode' && n.type !== 'stickyNote' && n.data.status === 'bug');

  const groupNodes = nodes.filter((n) => n.type === 'groupNode');
  const standaloneNodes = nodes.filter((n) => n.type !== 'groupNode' && n.type !== 'stickyNote' && !n.parentId);

  const handleFocusNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    fitView({ nodes: [{ id: nodeId }], duration: 600, maxZoom: 1.2, padding: 0.3 });
  };

  // Helper เรนเดอร์ป้ายสถานะจิ๋วสำหรับใช้ในลิสต์
  const renderMiniStatus = (s?: string) => {
    if (s === 'bug') return <span className="bg-rose-500 text-slate-950 px-1 py-0.2 rounded font-black text-[8px] animate-pulse">BUG</span>;
    if (s === 'in_progress') return <span className="bg-sky-500/20 text-sky-400 px-1 py-0.2 rounded font-bold text-[8px]">⏳ DEV</span>;
    if (s === 'review') return <span className="bg-purple-500/20 text-purple-400 px-1 py-0.2 rounded font-bold text-[8px]">🔍 REV</span>;
    return null; 
  };

  return (
    <div className="w-80 h-full bg-slate-950 border-l border-slate-800 flex flex-col font-sans z-10 animate-in slide-in-from-right duration-200">
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-black text-lime-400 uppercase tracking-wider flex items-center gap-1.5">📋 Master Todo List</h2>
          <p className="text-[10px] text-slate-400">คลิกเพื่อโฟกัสบนกระดาน</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded">✕ ปิด</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5 divide-y divide-slate-800/60">
        
        {/* +++ 2. โซนพิเศษบนสุด: โหนดที่กำลังเกิด Bug (แจ้งเตือนให้รีบแก้) +++ */}
        {bugNodes.length > 0 && (
          <div className="bg-rose-950/40 border-2 border-rose-500/60 rounded-lg p-2.5 shadow-lg animate-in fade-in">
            <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">🚨 กำลังเกิด Bug (ต้องแก้ไขด่วน)</span>
              <span className="bg-rose-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[9px]">{bugNodes.length}</span>
            </div>

            <div className="space-y-1.5">
              {bugNodes.map((node) => (
                <div
                  key={`buglist-${node.id}`}
                  onClick={() => handleFocusNode(node.id)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-rose-800/80 hover:border-rose-500 rounded cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-rose-400 truncate flex items-center gap-1.5">
                      <span>{node.data.label}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5 truncate">
                      แผนก: {node.data.category || 'Scripting'}
                    </div>
                  </div>
                  <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/40 px-1 rounded shrink-0 font-mono font-bold">
                    {node.data.priority === 'high' ? '🔥 HIGH' : 'BUG'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* โซนที่ 1: หัวโหนดพร้อมลุย (Root Nodes) */}
        <div className={bugNodes.length > 0 ? 'pt-4' : ''}>
          <div className="text-[10px] font-black text-lime-400 uppercase tracking-wider mb-2 bg-lime-950/40 border border-lime-800/40 px-2 py-1 rounded flex items-center justify-between">
            <span>🚀 หัวโหนดพร้อมทำ (No Dependencies)</span>
            <span className="bg-lime-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[9px]">{rootNodes.length}</span>
          </div>

          {rootNodes.length === 0 ? (
            <div className="text-xs text-slate-600 italic px-2 py-1">ไม่มีหัวโหนดอิสระ...</div>
          ) : (
            <div className="space-y-2">
              {rootNodes.map((node) => {
                const tasks = node.data.tasks || [];
                const doneCount = tasks.filter((t) => t.done).length;
                const isAllDone = tasks.length > 0 && doneCount === tasks.length;

                return (
                  <div
                    key={`root-${node.id}`} onClick={() => handleFocusNode(node.id)}
                    className={`p-2 bg-slate-900/60 hover:bg-slate-800/80 border rounded-lg cursor-pointer transition-all group ${isAllDone ? 'border-slate-800 opacity-60' : 'border-slate-700 hover:border-lime-500/50 shadow-sm'}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1 truncate pr-1">
                        {renderMiniStatus(node.data.status)}
                        <span className="text-xs font-bold text-white group-hover:text-lime-400 transition-colors truncate">{node.data.label}</span>
                      </div>
                      <span className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 shrink-0">{doneCount}/{tasks.length}</span>
                    </div>

                    <div className="space-y-1 pl-1">
                      {tasks.map((task) => (
                        <div key={`rtask-${task.id}`} onClick={(e) => { e.stopPropagation(); toggleTask(node.id, task.id); }} className="flex items-center gap-2 text-[11px] text-slate-300 hover:text-white">
                          <input type="checkbox" checked={task.done} readOnly className="w-3 h-3 rounded bg-slate-950 border-slate-700 text-lime-500 focus:ring-0 cursor-pointer" />
                          <span className={`truncate ${task.done ? 'line-through text-slate-500' : ''}`}>{task.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* โซนที่ 2: งานแยกตามกลุ่ม */}
        <div className="pt-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 px-1">📦 รายการงานแยกตามระบบ</div>
          <div className="space-y-3">
            {groupNodes.map((group) => {
              const childNodes = nodes.filter((n) => n.parentId === group.id);
              return (
                <div key={`glist-${group.id}`} className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-2">
                  <div className="text-xs font-bold text-cyan-400 mb-2 truncate px-1 flex items-center justify-between"><span>📁 {group.data.label}</span></div>
                  <div className="space-y-1.5 pl-2 border-l border-slate-800 ml-1">
                    {childNodes.length === 0 ? (<div className="text-[10px] text-slate-600 italic">ไม่มีระบบย่อย...</div>) : (
                      childNodes.map((child) => (
                        <div key={`child-${child.id}`} onClick={() => handleFocusNode(child.id)} className="p-1.5 bg-slate-900/40 hover:bg-slate-800/60 rounded cursor-pointer transition-colors group">
                          <div className="flex items-center gap-1 mb-1 truncate pr-1">
                            {renderMiniStatus(child.data.status)}
                            <div className="text-[11px] font-medium text-slate-200 group-hover:text-white truncate">↳ {child.data.label}</div>
                          </div>
                          <div className="space-y-1 pl-3">
                            {(child.data.tasks || []).map((task) => (
                              <div key={`ctask-${task.id}`} onClick={(e) => { e.stopPropagation(); toggleTask(child.id, task.id); }} className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-200">
                                <input type="checkbox" checked={task.done} readOnly className="w-2.5 h-2.5 rounded bg-slate-950 border-slate-700 text-cyan-500" />
                                <span className={`truncate ${task.done ? 'line-through text-slate-600' : ''}`}>{task.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}

            {standaloneNodes.length > 0 && (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-2">
                <div className="text-xs font-bold text-slate-500 mb-2 px-1">📌 โหนดอิสระ (Standalone)</div>
                <div className="space-y-1.5 pl-1">
                  {standaloneNodes.map((node) => (
                    <div key={`std-${node.id}`} onClick={() => handleFocusNode(node.id)} className="p-1.5 bg-slate-900/40 hover:bg-slate-800/60 rounded cursor-pointer transition-colors group">
                      <div className="flex items-center gap-1 mb-1 truncate pr-1">
                        {renderMiniStatus(node.data.status)}
                        <div className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">• {node.data.label}</div>
                      </div>
                      <div className="space-y-1 pl-2">
                        {(node.data.tasks || []).map((task) => (
                          <div key={`stask-${task.id}`} onClick={(e) => { e.stopPropagation(); toggleTask(node.id, task.id); }} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <input type="checkbox" checked={task.done} readOnly className="w-2.5 h-2.5 rounded bg-slate-950 border-slate-700 text-lime-500" />
                            <span className={`truncate ${task.done ? 'line-through text-slate-600' : ''}`}>{task.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
      <div className="p-2 bg-slate-950 border-t border-slate-800 text-[9px] text-slate-500 text-center">💡 กดติ๊กถูกที่เช็คลิสต์เพื่ออัปเดตงานบนกระดานได้ทันที</div>
    </div>
  );
}