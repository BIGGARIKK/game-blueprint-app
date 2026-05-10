import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react';
import dagre from 'dagre';

export type Task = { id: string; text: string; done: boolean; };

export type FeatureNodeData = {
  label: string;
  category?: 'UI' | 'Scripting' | 'Database' | 'Networking' | 'Art' | 'Sound';
  tasks?: Task[];
};

type CanvasState = {
  systemName: string;
  currentJSON: string;
  nodes: Node<FeatureNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  syncFromJSON: (jsonString: string) => { success: boolean; error?: string };
  
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  
  addNode: (category: 'UI' | 'Scripting' | 'Database' | 'Networking' | 'Art' | 'Sound') => void;
  updateNodeData: (nodeId: string, newData: Partial<FeatureNodeData>) => void;
  addTask: (nodeId: string, text: string) => void;
  deleteTask: (nodeId: string, taskId: string) => void;
  toggleTask: (nodeId: string, taskId: string) => void;
  deleteNode: (nodeId: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  deleteEdge: (edgeId: string) => void;
};

const createEdgeStyle = (color: string) => ({
  style: { fill: 'none', stroke: color, strokeWidth: 2, strokeDasharray: '5 5' },
  labelStyle: { fill: '#f8fafc', fontWeight: 500, fontSize: 12 },
  labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85 },
});

// +++ อัปเกรด Dagre ให้รองรับ Compound Graph +++
const getLayoutedElements = (nodes: Node<FeatureNodeData>[], edges: Edge[], direction = 'LR') => {
  // 1. เปิดโหมด compound: true
  const dagreGraph = new dagre.graphlib.Graph({ compound: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // เพิ่มระยะห่างเผื่อกล่องแม่ (nodesep, ranksep กว้างขึ้นนิดหน่อย)
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 180 });

  // 2. ลงทะเบียนโหมดทั้งหมด
  nodes.forEach((node) => {
    if (node.type === 'groupNode') {
      dagreGraph.setNode(node.id, { label: node.data.label });
    } else {
      dagreGraph.setNode(node.id, { width: 288, height: 200 });
    }
  });

  // 3. กำหนดความสัมพันธ์ Parent -> Child ให้ Dagre รู้
  nodes.forEach((node) => {
    if (node.parentId) {
      dagreGraph.setParent(node.id, node.parentId);
    }
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // 4. แปลงพิกัดกลับมา (สำคัญ: โหนดลูกใน React Flow ต้องมีพิกัด "สัมพัทธ์" กับมุมซ้ายบนของกล่องแม่)
  const newNodes = nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    if (!pos) return node;

    let x = pos.x - (pos.width || 288) / 2;
    let y = pos.y - (pos.height || 200) / 2;

    // ถ้าเป็นโหนดลูก ให้เอาพิกัด absolute ไปลบออกจากพิกัดมุมซ้ายบนของกล่องแม่
    if (node.parentId) {
      const parentPos = dagreGraph.node(node.parentId);
      if (parentPos) {
        const parentX = parentPos.x - (parentPos.width || 0) / 2;
        const parentY = parentPos.y - (parentPos.height || 0) / 2;
        x = x - parentX;
        y = y - parentY;
      }
    }

    return {
      ...node,
      position: { x, y },
      // ถ้าเป็นกล่องแม่ ให้แนบขนาด width/height ที่ Dagre คำนวณเผื่อลูกๆ มาให้ด้วย
      style: node.type === 'groupNode' 
        ? { width: pos.width, height: pos.height } 
        : node.style,
    };
  });

  return { nodes: newNodes, edges };
};

// อัปเดตระบบ Export JSON ให้จำค่า type และ parentId
const generateExportJSON = (systemName: string, nodes: Node<FeatureNodeData>[], edges: Edge[]) => {
  const exportObject = {
    systemName,
    nodes: nodes.map((n) => {
      const base: any = {
        id: n.id,
        type: n.type || 'featureNode',
        label: n.data.label,
      };
      
      if (n.parentId) base.parentId = n.parentId;
      
      if (n.type !== 'groupNode') {
        base.category = n.data.category || 'Scripting';
        base.tasks = (n.data.tasks || []).map((t) => ({ text: t.text, done: t.done }));
      }
      return base;
    }),
    edges: edges.map((e) => ({
      source: e.source,
      target: e.target,
      actionLabel: e.label || '',
    })),
  };
  return JSON.stringify(exportObject, null, 2);
};

const saveToLocal = (jsonStr: string) => {
  if (typeof window !== 'undefined') localStorage.setItem('SAVED_BLUEPRINT_JSON', jsonStr);
};

// +++ อัปเดต Template เริ่มต้นให้มีตัวอย่างกล่องแม่ครอบระบบกระเป๋า +++
export const defaultJSONTemplate = JSON.stringify({
  "systemName": "ระบบกระเป๋าและซิงค์ข้อมูล (Inventory Sync)",
  "nodes": [
    {
      "id": "group_core_inv",
      "type": "groupNode",
      "label": "📦 Core Inventory Module"
    },
    {
      "id": "ui_grid",
      "parentId": "group_core_inv",
      "label": "หน้าต่าง UI กระเป๋า",
      "category": "UI",
      "tasks": [{ "text": "สร้าง Grid สล็อต 5x5", "done": true }]
    },
    {
      "id": "net_sync",
      "parentId": "group_core_inv",
      "label": "ระบบซิงค์ไอเทม",
      "category": "Networking",
      "tasks": ["เขียน Event 'item_moved'"]
    },
    {
      "id": "db_main",
      "label": "ฐานข้อมูลหลัก",
      "category": "Database",
      "tasks": ["บันทึก Array ไอเทมลง MongoDB"]
    }
  ],
  "edges": [
    { "source": "ui_grid", "target": "net_sync", "actionLabel": "ย้ายของ" },
    { "source": "net_sync", "target": "db_main", "actionLabel": "บันทึกลง DB" }
  ]
}, null, 2);

export const useCanvasStore = create<CanvasState>((set, get) => {
  const initialData = JSON.parse(defaultJSONTemplate);
  const rawNodes = initialData.nodes.map((n: any) => ({
    id: n.id,
    type: n.type || 'featureNode',
    parentId: n.parentId || undefined,
    position: { x: 0, y: 0 },
    data: {
      label: n.label,
      category: n.category || 'Scripting',
      tasks: n.type === 'groupNode' ? [] : (n.tasks || []).map((t: any, idx: number) => ({
        id: `t-${idx}`,
        text: typeof t === 'object' ? t.text : t,
        done: typeof t === 'object' ? !!t.done : false,
      })),
    },
  }));
  
  const rawEdges = initialData.edges.map((e: any, idx: number) => ({
    id: `e-${idx}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    animated: true,
    label: e.actionLabel,
    ...createEdgeStyle('#06b6d4'),
  }));

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);
  const initJSON = generateExportJSON(initialData.systemName, layoutedNodes, layoutedEdges);

  return {
    systemName: initialData.systemName,
    currentJSON: initJSON,
    nodes: layoutedNodes,
    edges: layoutedEdges,
    selectedNodeId: null,
    selectedEdgeId: null,

    setSelectedNodeId: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
    setSelectedEdgeId: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

    onNodesChange: (changes) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) as Node<FeatureNodeData>[] });
      if (changes.some((c) => c.type === 'remove' || c.type === 'position')) {
        const updatedJSON = generateExportJSON(get().systemName, get().nodes, get().edges);
        saveToLocal(updatedJSON);
        set({ currentJSON: updatedJSON });
      }
    },

    onEdgesChange: (changes) => {
      set({ edges: applyEdgeChanges(changes, get().edges) });
      if (changes.some((c) => c.type === 'remove')) {
        const updatedJSON = generateExportJSON(get().systemName, get().nodes, get().edges);
        saveToLocal(updatedJSON);
        set({ currentJSON: updatedJSON });
      }
    },

    onConnect: (connection) => {
      const newEdge: Edge = {
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        animated: true,
        label: 'เชื่อมต่อระบบ',
        ...createEdgeStyle('#84cc16'),
      };
      const updatedEdges = addEdge(newEdge, get().edges);
      const updatedJSON = generateExportJSON(get().systemName, get().nodes, updatedEdges);
      saveToLocal(updatedJSON);
      set({ edges: updatedEdges, currentJSON: updatedJSON, selectedEdgeId: newEdge.id, selectedNodeId: null });
    },

    addNode: (category) => {
      const uniqueId = `${category.toLowerCase()}_${Date.now().toString().slice(-4)}`;
      const newNode: Node<FeatureNodeData> = {
        id: uniqueId,
        type: 'featureNode',
        position: { x: 250 + Math.random() * 50, y: 150 + Math.random() * 50 },
        data: {
          label: `ระบบ ${category} ใหม่`,
          category: category,
          tasks: [{ id: `t-init-${Date.now()}`, text: 'งานเริ่มต้น', done: false }],
        },
      };

      const updatedNodes = [...get().nodes, newNode];
      const updatedJSON = generateExportJSON(get().systemName, updatedNodes, get().edges);
      saveToLocal(updatedJSON);
      set({ nodes: updatedNodes, currentJSON: updatedJSON, selectedNodeId: uniqueId, selectedEdgeId: null });
    },

    updateNodeData: (nodeId, newData) => {
      const updatedNodes = get().nodes.map((n) => 
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      );
      const updatedJSON = generateExportJSON(get().systemName, updatedNodes, get().edges);
      saveToLocal(updatedJSON);
      set({ nodes: updatedNodes, currentJSON: updatedJSON });
    },

    addTask: (nodeId, text) => {
      if (!text.trim()) return;
      const updatedNodes = get().nodes.map((n) => {
        if (n.id === nodeId) {
          const newTask: Task = { id: `t-${Date.now()}`, text, done: false };
          return { ...n, data: { ...n.data, tasks: [...(n.data.tasks || []), newTask] } };
        }
        return n;
      });
      const updatedJSON = generateExportJSON(get().systemName, updatedNodes, get().edges);
      saveToLocal(updatedJSON);
      set({ nodes: updatedNodes, currentJSON: updatedJSON });
    },

    deleteTask: (nodeId, taskId) => {
      const updatedNodes = get().nodes.map((n) => 
        n.id === nodeId ? { ...n, data: { ...n.data, tasks: (n.data.tasks || []).filter(t => t.id !== taskId) } } : n
      );
      const updatedJSON = generateExportJSON(get().systemName, updatedNodes, get().edges);
      saveToLocal(updatedJSON);
      set({ nodes: updatedNodes, currentJSON: updatedJSON });
    },

    toggleTask: (nodeId, taskId) => {
      const updatedNodes = get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              tasks: (node.data.tasks || []).map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task
              ),
            },
          };
        }
        return node;
      });
      const updatedJSON = generateExportJSON(get().systemName, updatedNodes, get().edges);
      saveToLocal(updatedJSON);
      set({ nodes: updatedNodes, currentJSON: updatedJSON });
    },

    deleteNode: (nodeId) => {
      // ลบโหนดแม่ หรือ โหนดลูกที่โดนเลือก
      const updatedNodes = get().nodes.filter((n) => n.id !== nodeId && n.parentId !== nodeId);
      const updatedEdges = get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
      const updatedJSON = generateExportJSON(get().systemName, updatedNodes, updatedEdges);
      saveToLocal(updatedJSON);
      set({ nodes: updatedNodes, edges: updatedEdges, currentJSON: updatedJSON, selectedNodeId: null, selectedEdgeId: null });
    },

    updateEdgeLabel: (edgeId, label) => {
      const updatedEdges = get().edges.map((e) => e.id === edgeId ? { ...e, label } : e);
      const updatedJSON = generateExportJSON(get().systemName, get().nodes, updatedEdges);
      saveToLocal(updatedJSON);
      set({ edges: updatedEdges, currentJSON: updatedJSON });
    },

    deleteEdge: (edgeId) => {
      const updatedEdges = get().edges.filter((e) => e.id !== edgeId);
      const updatedJSON = generateExportJSON(get().systemName, get().nodes, updatedEdges);
      saveToLocal(updatedJSON);
      set({ edges: updatedEdges, currentJSON: updatedJSON, selectedEdgeId: null });
    },

    syncFromJSON: (jsonStr) => {
      try {
        const data = JSON.parse(jsonStr);
        if (!data.nodes || !Array.isArray(data.nodes)) return { success: false, error: "ขาด array 'nodes'" };

        const newNodes: Node<FeatureNodeData>[] = data.nodes.map((n: any) => {
          const isGroup = n.type === 'groupNode';
          return {
            id: n.id,
            type: isGroup ? 'groupNode' : 'featureNode',
            parentId: n.parentId || undefined,
            position: { x: 0, y: 0 },
            data: {
              label: n.label || n.id,
              category: n.category || 'Scripting',
              tasks: isGroup ? [] : (n.tasks || []).map((t: any, i: number) => ({
                id: `task-${i}-${Date.now()}`,
                text: typeof t === 'object' ? t.text : String(t),
                done: typeof t === 'object' ? !!t.done : false,
              })),
            },
          };
        });

        const newEdges: Edge[] = (data.edges || []).map((e: any, i: number) => ({
          id: `edge-${i}-${e.source}-${e.target}-${Date.now()}`,
          source: e.source,
          target: e.target,
          animated: true,
          label: e.actionLabel || '',
          ...createEdgeStyle('#06b6d4'),
        }));

        const { nodes: finalNodes, edges: finalEdges } = getLayoutedElements(newNodes, newEdges);
        const cleanJSON = generateExportJSON(data.systemName || "Untitled", finalNodes, finalEdges);

        saveToLocal(cleanJSON);
        set({ systemName: data.systemName || "Untitled Blueprint", currentJSON: cleanJSON, nodes: finalNodes, edges: finalEdges });
        return { success: true };
      } catch (err) {
        return { success: false, error: (err as Error).message };
      }
    },
  };
});