"use client";

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { toPng } from 'html-to-image';

import { useCanvasStore } from '@/store/useCanvasStore';
import FeatureNode from '@/components/canvas/FeatureNode';
import CodeEditorPanel from '@/components/ui/CodeEditorPanel';
import QuickAddBar from '@/components/ui/QuickAddBar';
import NodeInspector from '@/components/ui/NodeInspector';
// +++ 1. Import แผง Edge Inspector ใหม่ +++
import EdgeInspector from '@/components/ui/EdgeInspector';
import GroupNode from '@/components/canvas/GroupNode';


function WorkspaceContent() {
  const { 
    systemName, nodes, edges, onNodesChange, onEdgesChange, 
    onConnect, syncFromJSON, setSelectedNodeId, setSelectedEdgeId 
  } = useCanvasStore();
  
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const flowWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedJSON = localStorage.getItem('SAVED_BLUEPRINT_JSON');
    if (savedJSON) syncFromJSON(savedJSON);
  }, [syncFromJSON]);

  const nodeTypes = useMemo(() => ({ 
    featureNode: FeatureNode,
    groupNode: GroupNode, // +++ เพิ่มบรรทัดนี้ +++
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-all"
          >
            {isEditorOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
          <h1 className="font-black tracking-wider bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent text-sm ml-1">
            DEV BLUEPRINT
          </h1>
          <span className="text-slate-700">|</span>
          <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            📁 {systemName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-3 py-1.5 rounded-md transition-all shadow-md"
          >
            {isExporting ? '📸 Exporting...' : '📸 Export to PNG'}
          </button>
        </div>
      </header>

      {/* พื้นที่หลัก */}
      <div className="flex-1 w-full flex flex-row h-[calc(100vh-3.5rem)] relative">
        
        {/* แผงซ้าย: JSON Editor */}
        <aside className={`h-full bg-slate-950 border-r border-slate-800 z-10 transition-all duration-300 ease-in-out ${
          isEditorOpen ? 'w-[35%] min-w-[320px] max-w-[500px] opacity-100' : 'w-0 min-w-0 opacity-0 overflow-hidden border-none'
        }`}>
          <div className="w-full h-full min-w-[320px]"><CodeEditorPanel /></div>
        </aside>

        {/* ตรงกลาง: Visual Canvas */}
        <main ref={flowWrapperRef} className="flex-1 h-full relative">
          <ReactFlow 
            nodes={nodes} 
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            
            // เมื่อคลิกโหนด เปิด NodeInspector
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            
            // +++ 2. เมื่อคลิกเส้นเชื่อม เปิด EdgeInspector +++
            onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
            
            // เมื่อคลิกพื้นที่ว่างบนกระดาน ให้ปิด Inspector ทั้งหมด
            onPaneClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            
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

        {/* แผงขวา: แสดงตามสิ่งที่ผู้ใช้กำลังคลิกเลือกอยู่ (อย่างใดอย่างหนึ่ง) */}
        <NodeInspector />
        <EdgeInspector />

      </div>

    </div>
  );
}

export default function WorkspacePage() {
  return <ReactFlowProvider><WorkspaceContent /></ReactFlowProvider>;
}