"use client";

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { toPng } from 'html-to-image';

import { useCanvasStore } from '@/store/useCanvasStore';
import FeatureNode from '@/components/canvas/FeatureNode';
import GroupNode from '@/components/canvas/GroupNode';
import CodeEditorPanel from '@/components/ui/CodeEditorPanel';
import QuickAddBar from '@/components/ui/QuickAddBar';
import NodeInspector from '@/components/ui/NodeInspector';
import EdgeInspector from '@/components/ui/EdgeInspector';
import PresetSelector from '@/components/ui/PresetSelector';
// +++ 1. Import แผง Dashboard Modal เข้ามา +++
import ProjectManagerModal from '@/components/ui/ProjectManagerModal';
import TodoListSidebar from '@/components/ui/TodoListSidebar';
import StickyNote from '@/components/canvas/StickyNote';


function WorkspaceContent() {
  const { 
    systemName, nodes, edges, onNodesChange, onEdgesChange, 
    onConnect, setSelectedNodeId, setSelectedEdgeId,
    initProjects // +++ ดึงฟังก์ชันโหลดโปรเจกต์ตั้งต้น +++
  } = useCanvasStore();
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // +++ 2. เพิ่ม State ควบคุมการเปิด/ปิด Dashboard Modal +++
  const [isProjModalOpen, setIsProjModalOpen] = useState(false);
  const [isTodoOpen, setIsTodoOpen] = useState(true);
  const flowWrapperRef = useRef<HTMLDivElement>(null);

  // โหลดระบบโปรเจกต์ทั้งหมดทันทีที่เปิดเว็บ
  useEffect(() => {
    initProjects();
  }, [initProjects]);

  const nodeTypes = useMemo(() => ({ 
  featureNode: FeatureNode,
  groupNode: GroupNode,
  stickyNote: StickyNote // +++ ลงทะเบียน
}), []);

  const handleExportPNG = async () => {
    if (!flowWrapperRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(flowWrapperRef.current, { backgroundColor: '#020617', quality: 0.95 });
      const link = document.createElement('a');
      link.download = `blueprint-${systemName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      link.href = dataUrl; link.click();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการ Export รูปภาพ');
    } finally {
      setIsExporting(false);
    }
  };

  

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col font-sans overflow-hidden">
      
      {/* Top Navbar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between text-white z-20">
        <div className="flex items-center gap-3 truncate pr-2">
          {/* ... ปุ่มซ่อน Editor และป้ายชื่อเกม เหมือนเดิม ... */}
          <button onClick={() => setIsEditorOpen(!isEditorOpen)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-all shrink-0">
            {isEditorOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
          <h1 className="font-black tracking-wider bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent text-sm ml-1 shrink-0 hidden sm:block">DEV BLUEPRINT</h1>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <button onClick={() => setIsProjModalOpen(true)} className="text-xs font-bold text-slate-200 bg-slate-950 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 truncate transition-all flex items-center gap-1.5 shadow-inner hover:border-cyan-500">
            <span className="truncate">📁 {systemName}</span>
            <span className="text-[9px] text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0 animate-pulse">สลับ/สร้าง ▾</span>
          </button>
        </div>

        {/* แผงปุ่มฝั่งขวา */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* +++ 3. เพิ่มปุ่ม Toggle เปิด/ปิด Master Todo List +++ */}
          <button
            onClick={() => setIsTodoOpen(!isTodoOpen)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
              isTodoOpen 
                ? 'bg-lime-950/80 border border-lime-500 text-lime-400' 
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
            }`}
          >
            <span>📋 Master Todos</span>
          </button>

          <PresetSelector />
          <button onClick={handleExportPNG} disabled={isExporting} className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-3 py-1.5 rounded-md transition-all shadow-md">
            {isExporting ? '📸 Exporting...' : '📸 Export PNG'}
          </button>
        </div>
      </header>

      {/* พื้นที่หลัก */}
      <div className="flex-1 w-full flex flex-row h-[calc(100vh-3.5rem)] relative">
        <aside className={`h-full bg-slate-950 border-r border-slate-800 z-10 transition-all duration-300 ease-in-out ${
          isEditorOpen ? 'w-[35%] min-w-[320px] max-w-[500px] opacity-100' : 'w-0 min-w-0 opacity-0 overflow-hidden border-none'
        }`}>
          <div className="w-full h-full min-w-[320px]"><CodeEditorPanel /></div>
        </aside>

        <main ref={flowWrapperRef} className="flex-1 h-full relative">
          <ReactFlow 
            nodes={nodes} 
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
            onPaneClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
            nodeTypes={nodeTypes}
            fitView
            colorMode="dark"
          >
            <Background gap={16} size={1} />
            <Controls className="bg-slate-800 border-slate-700 fill-white" />
            <MiniMap className="bg-slate-900 border border-slate-800" />
          </ReactFlow>
          
          <QuickAddBar />
        </main>
        {isTodoOpen && <TodoListSidebar onClose={() => setIsTodoOpen(false)} />}
        <NodeInspector />
        <EdgeInspector />
      </div>

      {/* +++ 4. วาง Component Popup Dashboard (แสดงเมื่อกดปุ่มบน Header) +++ */}
      {isProjModalOpen && (
        <ProjectManagerModal onClose={() => setIsProjModalOpen(false)} />
      )}

    </div>
  );
}

export default function WorkspacePage() {
  return <ReactFlowProvider><WorkspaceContent /></ReactFlowProvider>;
}