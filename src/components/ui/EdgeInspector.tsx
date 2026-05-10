import React from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function EdgeInspector() {
  const { edges, nodes, selectedEdgeId, setSelectedEdgeId, updateEdgeLabel, deleteEdge } = useCanvasStore();

  // หาเส้นที่กำลังถูกคลิกเลือก
  const edge = edges.find((e) => e.id === selectedEdgeId);
  if (!edge) return null;

  // ค้นหาชื่อโหนดต้นทาง และ ปลายทาง เพื่อให้แสดงผลเข้าใจง่ายขึ้น
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  return (
    <div className="w-80 h-full bg-slate-950 border-l border-slate-800 flex flex-col font-sans z-10 animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Edge Inspector</h2>
          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
            {sourceNode?.data.label} ➔ {targetNode?.data.label}
          </p>
        </div>
        <button 
          onClick={() => setSelectedEdgeId(null)}
          className="text-slate-500 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded"
        >
          ✕ ปิด
        </button>
      </div>

      {/* ฟอร์มแก้ไขข้อความบนเส้น */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">
            ข้อความบนเส้น (Action Label)
          </label>
          <input
            type="text"
            placeholder="เช่น ย้ายไอเทม, ส่งค่า Damage"
            value={(edge.label as string) || ''}
            onChange={(e) => updateEdgeLabel(edge.id, e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
          <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
            💡 พิมพ์แล้วข้อความบนเส้นประจะอัปเดตแบบ Real-time ทันที
          </p>
        </div>
      </div>

      {/* Footer: ปุ่มกดลบเส้น */}
      <div className="p-3 bg-slate-900/50 border-t border-slate-800">
        <button
          onClick={() => deleteEdge(edge.id)}
          className="w-full bg-rose-950/40 hover:bg-rose-900 text-rose-400 hover:text-white border border-rose-800/50 rounded py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1"
        >
          🗑️ ลบเส้นเชื่อมนี้ทิ้ง
        </button>
      </div>

    </div>
  );
}