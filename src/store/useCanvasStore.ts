import { create } from 'zustand';
import {
  Connection, Edge, EdgeChange, Node, NodeChange,
  addEdge, applyEdgeChanges, applyNodeChanges,
} from '@xyflow/react';
import dagre from 'dagre';

export type Task = { id: string; text: string; done: boolean; };

// +++ 1. เพิ่ม Type สำหรับความสำคัญและสถานะ +++
export type PriorityType = 'high' | 'medium' | 'low';
export type StatusType = 'planned' | 'in_progress' | 'review' | 'bug';

export type FeatureNodeData = {
  label: string;
  category?: 'UI' | 'Scripting' | 'Database' | 'Networking' | 'Art' | 'Sound';
  tasks?: Task[];
  priority?: PriorityType;
  status?: StatusType;
};

export type ProjectMeta = {
  id: string;
  name: string;
  updatedAt: number;
};

type CanvasState = {
  currentProjectId: string;
  projects: ProjectMeta[];
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
  addGroup: () => void; 
  addStickyNote: () => void;
  updateNodeData: (nodeId: string, newData: Partial<FeatureNodeData>) => void;
  updateNodeParent: (nodeId: string, parentId: string | null) => void; 
  
  addTask: (nodeId: string, text: string) => void;
  deleteTask: (nodeId: string, taskId: string) => void;
  toggleTask: (nodeId: string, taskId: string) => void;
  deleteNode: (nodeId: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  deleteEdge: (edgeId: string) => void;

  initProjects: () => void;
  createNewProject: (name: string, initialJson?: string) => void;
  switchProject: (id: string) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, newName: string) => void;
  _saveToCurrentProject: (jsonStr: string, sysName?: string) => void;
};

const createEdgeStyle = (color: string) => ({
  style: { fill: 'none', stroke: color, strokeWidth: 2, strokeDasharray: '5 5' },
  labelStyle: { fill: '#f8fafc', fontWeight: 500, fontSize: 12 },
  labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85 },
});

const getLayoutedElements = (nodes: Node<FeatureNodeData>[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph({ compound: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 110, ranksep: 200 });

  nodes.forEach((node) => {
    if (node.type === 'stickyNote') return; 
    if (node.type === 'groupNode') {
      dagreGraph.setNode(node.id, { label: node.data.label });
    } else {
      dagreGraph.setNode(node.id, { width: 288, height: 200 });
    }
  });

  nodes.forEach((node) => {
    if (node.type === 'stickyNote') return;
    if (node.parentId) dagreGraph.setParent(node.id, node.parentId);
  });

  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    if (node.type === 'stickyNote') return node; 

    const pos = dagreGraph.node(node.id);
    if (!pos) return node;

    let x = pos.x - (pos.width || 288) / 2;
    let y = pos.y - (pos.height || 200) / 2;

    if (node.parentId) {
      const parentPos = dagreGraph.node(node.parentId);
      if (parentPos) {
        x -= (parentPos.x - (parentPos.width || 0) / 2);
        y -= (parentPos.y - (parentPos.height || 0) / 2);
      }
    }

    return {
      ...node,
      position: { x, y },
      style: node.type === 'groupNode' ? { width: pos.width, height: pos.height } : node.style,
    };
  });

  const sortedNewNodes = newNodes.sort((a, b) => {
    if (a.type === 'groupNode' && b.type !== 'groupNode') return -1;
    if (a.type !== 'groupNode' && b.type === 'groupNode') return 1;
    return 0;
  });

  return { nodes: sortedNewNodes, edges };
};

// +++ 2. อัปเดต Export JSON ให้พ่นค่า priority และ status ออกไปด้วย +++
const generateExportJSON = (systemName: string, nodes: Node<FeatureNodeData>[], edges: Edge[]) => {
  const exportObject = {
    systemName,
    nodes: nodes.map((n) => {
      const base: any = { 
        id: n.id, 
        type: n.type || 'featureNode', 
        label: n.data.label,
        position: { x: Math.round(n.position.x), y: Math.round(n.position.y) }
      };

      // +++ 1. ถ้าเป็นกล่องแม่ ให้ดึงขนาดกว้าง/สูงล่าสุดมาบันทึกลง JSON ด้วย +++
      if (n.type === 'groupNode') {
        base.width = n.style?.width || 350;
        base.height = n.style?.height || 250;
      }

      if (n.parentId) base.parentId = n.parentId;
      
      if (n.type !== 'groupNode' && n.type !== 'stickyNote') {
        base.category = n.data.category || 'Scripting';
        if (n.data.priority) base.priority = n.data.priority;
        if (n.data.status) base.status = n.data.status;
        base.tasks = (n.data.tasks || []).map((t) => ({ text: t.text, done: t.done }));
      }
      return base;
    }),
    edges: edges.map((e) => ({ source: e.source, target: e.target, actionLabel: e.label || '' })),
  };
  return JSON.stringify(exportObject, null, 2);
};


const saveToLocal = (jsonStr: string) => {
  if (typeof window !== 'undefined') localStorage.setItem('SAVED_BLUEPRINT_JSON', jsonStr);
};

// +++ ใส่ตัวอย่างป้ายไฟบั๊กกะพริบไว้ใน Template เริ่มต้น +++
export const defaultJSONTemplate = JSON.stringify({
  "systemName": "ระบบกระเป๋าและซิงค์ข้อมูล (Inventory Sync)",
  "nodes": [
    { "id": "group_core_inv", "type": "groupNode", "label": "📦 Core Inventory Module" },
    { 
      "id": "ui_grid", "type": "featureNode", "parentId": "group_core_inv", 
      "label": "หน้าต่าง UI กระเป๋า", "category": "UI", 
      "priority": "medium", "status": "in_progress",
      "tasks": [{ "text": "สร้าง Grid สล็อต 5x5", "done": true }] 
    },
    { 
      "id": "net_sync", "type": "featureNode", "parentId": "group_core_inv", 
      "label": "ระบบซิงค์ไอเทม", "category": "Networking", 
      "priority": "high", "status": "bug",
      "tasks": ["เขียน Event 'item_moved'"] 
    }
  ],
  "edges": [
    { "source": "ui_grid", "target": "net_sync", "actionLabel": "ย้ายของ" }
  ]
}, null, 2);

export const useCanvasStore = create<CanvasState>((set, get) => {
  const initialData = JSON.parse(defaultJSONTemplate);
  const rawNodes = initialData.nodes.map((n: any) => ({
    id: n.id, type: n.type || 'featureNode', parentId: n.parentId || undefined, position: { x: 0, y: 0 },
    data: {
      label: n.label, category: n.category || 'Scripting',
      priority: n.priority || 'low', status: n.status || 'planned',
      tasks: (n.type === 'groupNode' || n.type === 'stickyNote') ? [] : (n.tasks || []).map((t: any, idx: number) => ({ id: `t-${idx}`, text: typeof t === 'object' ? t.text : t, done: typeof t === 'object' ? !!t.done : false })),
    },
  }));
  
  const rawEdges = initialData.edges.map((e: any, idx: number) => ({
    id: `e-${idx}-${e.source}-${e.target}`, source: e.source, target: e.target, animated: true, label: e.actionLabel, ...createEdgeStyle('#06b6d4'),
  }));

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);
  const initJSON = generateExportJSON(initialData.systemName, layoutedNodes, layoutedEdges);

  return {
    currentProjectId: '', projects: [], systemName: initialData.systemName, currentJSON: initJSON,
    nodes: layoutedNodes, edges: layoutedEdges, selectedNodeId: null, selectedEdgeId: null,

    initProjects: () => {
      if (typeof window === 'undefined') return;
      const savedMetaStr = localStorage.getItem('BLUEPRINT_PROJECTS');
      let loadedProjects: ProjectMeta[] = [];
      if (savedMetaStr) { try { loadedProjects = JSON.parse(savedMetaStr); } catch(e){} }

      if (loadedProjects.length === 0) {
        const legacyData = localStorage.getItem('SAVED_BLUEPRINT_JSON');
        const defaultId = 'proj_' + Date.now();
        const initialStr = legacyData || defaultJSONTemplate;
        let projName = "My First Game";
        try { projName = JSON.parse(initialStr).systemName || projName; } catch(e){}

        loadedProjects = [{ id: defaultId, name: projName, updatedAt: Date.now() }];
        localStorage.setItem('BLUEPRINT_PROJECTS', JSON.stringify(loadedProjects));
        localStorage.setItem(`BLUEPRINT_DATA_${defaultId}`, initialStr);
        localStorage.setItem('BLUEPRINT_CURRENT_ID', defaultId);
      }

      let activeId = localStorage.getItem('BLUEPRINT_CURRENT_ID') || loadedProjects[0].id;
      if (!loadedProjects.some(p => p.id === activeId)) activeId = loadedProjects[0].id;
      
      localStorage.setItem('BLUEPRINT_CURRENT_ID', activeId);
      const activeJsonStr = localStorage.getItem(`BLUEPRINT_DATA_${activeId}`) || defaultJSONTemplate;

      set({ projects: loadedProjects, currentProjectId: activeId });
      get().syncFromJSON(activeJsonStr);
    },

    _saveToCurrentProject: (jsonStr, sysName) => {
      const { currentProjectId, projects } = get();
      if (!currentProjectId || typeof window === 'undefined') return;
      localStorage.setItem(`BLUEPRINT_DATA_${currentProjectId}`, jsonStr);
      const actualName = sysName || get().systemName;
      const updatedProjects = projects.map(p => p.id === currentProjectId ? { ...p, name: actualName, updatedAt: Date.now() } : p);
      localStorage.setItem('BLUEPRINT_PROJECTS', JSON.stringify(updatedProjects));
      set({ projects: updatedProjects });
    },

    createNewProject: (name, initialJson) => {
      const newId = 'proj_' + Date.now();
      const baseStr = initialJson || defaultJSONTemplate;
      let finalStr = baseStr;
      try {
        const parsed = JSON.parse(baseStr);
        parsed.systemName = name;
        finalStr = JSON.stringify(parsed, null, 2);
      } catch(e){}

      const newMeta: ProjectMeta = { id: newId, name, updatedAt: Date.now() };
      const updatedProjects = [newMeta, ...get().projects];
      localStorage.setItem('BLUEPRINT_PROJECTS', JSON.stringify(updatedProjects));
      localStorage.setItem(`BLUEPRINT_DATA_${newId}`, finalStr);
      localStorage.setItem('BLUEPRINT_CURRENT_ID', newId);
      set({ projects: updatedProjects, currentProjectId: newId });
      get().syncFromJSON(finalStr);
    },

    switchProject: (id) => {
      if (id === get().currentProjectId) return;
      localStorage.setItem('BLUEPRINT_CURRENT_ID', id);
      const targetJsonStr = localStorage.getItem(`BLUEPRINT_DATA_${id}`) || defaultJSONTemplate;
      set({ currentProjectId: id });
      get().syncFromJSON(targetJsonStr);
    },

    deleteProject: (id) => {
      const { projects, currentProjectId } = get();
      const updatedProjects = projects.filter(p => p.id !== id);
      localStorage.removeItem(`BLUEPRINT_DATA_${id}`);
      localStorage.setItem('BLUEPRINT_PROJECTS', JSON.stringify(updatedProjects));

      if (id === currentProjectId) {
        if (updatedProjects.length > 0) {
          const nextId = updatedProjects[0].id;
          localStorage.setItem('BLUEPRINT_CURRENT_ID', nextId);
          set({ projects: updatedProjects, currentProjectId: nextId });
          get().syncFromJSON(localStorage.getItem(`BLUEPRINT_DATA_${nextId}`) || defaultJSONTemplate);
        } else {
          set({ projects: [] });
          get().createNewProject("Untitled Game");
        }
      } else { set({ projects: updatedProjects }); }
    },

    renameProject: (id, newName) => {
      const { projects, currentProjectId } = get();
      if (!newName.trim()) return;
      const updatedProjects = projects.map((p) => p.id === id ? { ...p, name: newName, updatedAt: Date.now() } : p);
      localStorage.setItem('BLUEPRINT_PROJECTS', JSON.stringify(updatedProjects));

      const targetDataStr = localStorage.getItem(`BLUEPRINT_DATA_${id}`);
      if (targetDataStr) {
        try {
          const parsed = JSON.parse(targetDataStr);
          parsed.systemName = newName;
          const updatedJsonStr = JSON.stringify(parsed, null, 2);
          localStorage.setItem(`BLUEPRINT_DATA_${id}`, updatedJsonStr);
          if (id === currentProjectId) { set({ systemName: newName, currentJSON: updatedJsonStr }); }
        } catch (e) {}
      }
      set({ projects: updatedProjects });
    },

    setSelectedNodeId: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
    setSelectedEdgeId: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

    onNodesChange: (changes) => {
      const newNodes = applyNodeChanges(changes, get().nodes);
      set({ nodes: newNodes as Node<FeatureNodeData>[] });
      if (changes.some((c) => c.type === 'remove' || (c.type === 'position' && !c.dragging))) {
        const updatedJSON = generateExportJSON(get().systemName, get().nodes, get().edges);
        set({ currentJSON: updatedJSON });
        get()._saveToCurrentProject(updatedJSON);
      }
    },

    onEdgesChange: (changes) => {
      set({ edges: applyEdgeChanges(changes, get().edges) });
      if (changes.some((c) => c.type === 'remove')) {
        const updatedJSON = generateExportJSON(get().systemName, get().nodes, get().edges);
        set({ currentJSON: updatedJSON });
        get()._saveToCurrentProject(updatedJSON);
      }
    },

    onConnect: (connection) => {
      const newEdge: Edge = { id: `edge-${connection.source}-${connection.target}-${Date.now()}`, source: connection.source, target: connection.target, animated: true, label: 'เชื่อมต่อระบบ', ...createEdgeStyle('#84cc16') };
      const updatedEdges = addEdge(newEdge, get().edges);
      const updatedJSON = generateExportJSON(get().systemName, get().nodes, updatedEdges);
      set({ edges: updatedEdges, currentJSON: updatedJSON, selectedEdgeId: newEdge.id, selectedNodeId: null });
      get()._saveToCurrentProject(updatedJSON);
    },

    addNode: (category) => {
      const uniqueId = `${category.toLowerCase()}_${Date.now().toString().slice(-4)}`;
      const newNode: Node<FeatureNodeData> = { 
        id: uniqueId, type: 'featureNode', position: { x: 250 + Math.random() * 50, y: 150 + Math.random() * 50 }, 
        data: { label: `ระบบ ${category} ใหม่`, category: category, priority: 'low', status: 'planned', tasks: [{ id: `t-init-${Date.now()}`, text: 'งานเริ่มต้น', done: false }] } 
      };
      const { nodes: finalNodes, edges: finalEdges } = getLayoutedElements([...get().nodes, newNode], get().edges);
      const updatedJSON = generateExportJSON(get().systemName, finalNodes, finalEdges);
      set({ nodes: finalNodes, edges: finalEdges, currentJSON: updatedJSON, selectedNodeId: uniqueId, selectedEdgeId: null });
      get()._saveToCurrentProject(updatedJSON);
    },

    addGroup: () => {
      const uniqueId = `group_${Date.now().toString().slice(-4)}`;
      const newGroup: Node<FeatureNodeData> = { id: uniqueId, type: 'groupNode', position: { x: 200, y: 100 }, data: { label: '📦 New Group Module' } };
      const { nodes: finalNodes, edges: finalEdges } = getLayoutedElements([...get().nodes, newGroup], get().edges);
      const updatedJSON = generateExportJSON(get().systemName, finalNodes, finalEdges);
      set({ nodes: finalNodes, edges: finalEdges, currentJSON: updatedJSON, selectedNodeId: uniqueId, selectedEdgeId: null });
      get()._saveToCurrentProject(updatedJSON);
    },

    addStickyNote: () => {
      const uniqueId = `note_${Date.now().toString().slice(-4)}`;
      const newNote: Node<FeatureNodeData> = { id: uniqueId, type: 'stickyNote', position: { x: 400, y: 200 }, data: { label: '💡 โน้ต: อธิบายลอจิกตรงนี้...' } };
      const updatedNodes = [...get().nodes, newNote];
      const { nodes: finalNodes, edges: finalEdges } = getLayoutedElements(updatedNodes, get().edges);
      const updatedJSON = generateExportJSON(get().systemName, finalNodes, finalEdges);
      set({ nodes: finalNodes, edges: finalEdges, currentJSON: updatedJSON, selectedNodeId: uniqueId });
      get()._saveToCurrentProject(updatedJSON);
    },

    updateNodeData: (nodeId, newData) => {
      const updatedNodes = get().nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n);
      const updatedJSON = generateExportJSON(get().systemName, updatedNodes, get().edges);
      set({ nodes: updatedNodes, currentJSON: updatedJSON });
      get()._saveToCurrentProject(updatedJSON);
    },

    updateNodeParent: (nodeId, parentId) => {
      const currentNodes = get().nodes;
      const targetNode = currentNodes.find((n) => n.id === nodeId);
      if (!targetNode) return;
      const updatedNodes = currentNodes.map((n) => {
        if (n.id === nodeId) {
          const copy = { ...n };
          if (parentId) copy.parentId = parentId;
          else delete copy.parentId;
          return copy;
        }
        return n;
      });
      const { nodes: finalNodes, edges: finalEdges } = getLayoutedElements(updatedNodes, get().edges);
      const updatedJSON = generateExportJSON(get().systemName, finalNodes, finalEdges);
      set({ nodes: finalNodes, edges: finalEdges, currentJSON: updatedJSON });
      get()._saveToCurrentProject(updatedJSON);
    },

    addTask: (nodeId, text) => {
      if (!text.trim()) return;
      const updatedNodes = get().nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, tasks: [...(n.data.tasks || []), { id: `t-${Date.now()}`, text, done: false }] } } : n);
      const updatedJSON = generateExportJSON(get().systemName, updatedNodes, get().edges);
      set({ nodes: updatedNodes, currentJSON: updatedJSON });
      get()._saveToCurrentProject(updatedJSON);
    },

    deleteTask: (nodeId, taskId) => {
      const updatedNodes = get().nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, tasks: (n.data.tasks || []).filter(t => t.id !== taskId) } } : n);
      const updatedJSON = generateExportJSON(get().systemName, updatedNodes, get().edges);
      set({ nodes: updatedNodes, currentJSON: updatedJSON });
      get()._saveToCurrentProject(updatedJSON);
    },

    toggleTask: (nodeId, taskId) => {
      const updatedNodes = get().nodes.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, tasks: (node.data.tasks || []).map((task) => task.id === taskId ? { ...task, done: !task.done } : task ) } } : node);
      const updatedJSON = generateExportJSON(get().systemName, updatedNodes, get().edges);
      set({ nodes: updatedNodes, currentJSON: updatedJSON });
      get()._saveToCurrentProject(updatedJSON);
    },

    deleteNode: (nodeId) => {
      const updatedNodes = get().nodes.filter((n) => n.id !== nodeId && n.parentId !== nodeId);
      const updatedEdges = get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
      const { nodes: finalNodes, edges: finalEdges } = getLayoutedElements(updatedNodes, updatedEdges);
      const updatedJSON = generateExportJSON(get().systemName, finalNodes, finalEdges);
      set({ nodes: finalNodes, edges: finalEdges, currentJSON: updatedJSON, selectedNodeId: null, selectedEdgeId: null });
      get()._saveToCurrentProject(updatedJSON);
    },

    updateEdgeLabel: (edgeId, label) => {
      const updatedEdges = get().edges.map((e) => e.id === edgeId ? { ...e, label } : e);
      const updatedJSON = generateExportJSON(get().systemName, get().nodes, updatedEdges);
      set({ edges: updatedEdges, currentJSON: updatedJSON });
      get()._saveToCurrentProject(updatedJSON);
    },

    deleteEdge: (edgeId) => {
      const updatedEdges = get().edges.filter((e) => e.id !== edgeId);
      const updatedJSON = generateExportJSON(get().systemName, get().nodes, updatedEdges);
      set({ edges: updatedEdges, currentJSON: updatedJSON, selectedEdgeId: null });
      get()._saveToCurrentProject(updatedJSON);
    },

    // +++ 3. อัปเดต syncFromJSON ให้ดึง priority และ status มาใช้ +++
    syncFromJSON: (jsonStr) => {
      try {
        const data = JSON.parse(jsonStr);
        if (!data.nodes || !Array.isArray(data.nodes)) return { success: false, error: "ขาด array 'nodes'" };

        const hasSavedPositions = data.nodes.length > 0 && data.nodes.every((n: any) => n.position && typeof n.position.x === 'number');

        const newNodes: Node<FeatureNodeData>[] = data.nodes.map((n: any) => {
          const isGroup = n.type === "groupNode";
          const isSticky = n.type === "stickyNote";
          const resolvedType = isGroup ? "groupNode" : isSticky ? "stickyNote" : "featureNode";

          // +++ 2. คืนค่าขนาด width/height ให้กล่องแม่ (ถ้าไม่มีในไฟล์เก่า ให้ใช้ค่าเผื่อไว้ก่อน) +++
          let nodeStyle: any = undefined;
          if (isGroup) {
            nodeStyle = {
              width: n.width || 380,
              height: n.height || 280,
            };
          }

          return {
            id: n.id, 
            type: resolvedType, 
            parentId: n.parentId || undefined, 
            position: n.position ? { x: n.position.x, y: n.position.y } : { x: 0, y: 0 },
            style: nodeStyle, // ยัดขนาดกลับเข้าสไตล์ของโหนด
            data: {
              label: n.label || n.id,
              category: isSticky ? undefined : (n.category || "Scripting"),
              priority: isSticky ? undefined : (n.priority || "low"),
              status: isSticky ? undefined : (n.status || "planned"),
              tasks: (isGroup || isSticky) ? [] : (n.tasks || []).map((t: any, i: number) => ({
                id: `task-${i}-${Date.now()}`, text: typeof t === "object" ? t.text : String(t), done: typeof t === "object" ? !!t.done : false,
              })),
            },
          };
        });

        const newEdges: Edge[] = (data.edges || []).map((e: any, i: number) => ({
          id: `edge-${i}-${e.source}-${e.target}-${Date.now()}`, source: e.source, target: e.target, animated: true, label: e.actionLabel || "", ...createEdgeStyle("#06b6d4"),
        }));

        let finalNodes = newNodes;
        let finalEdges = newEdges;

        // +++ 3. เพิ่มเงื่อนไข: ถ้าเป็นไฟล์เก่าที่ไม่มี n.width เซฟมาเลย ให้ Dagre ช่วยคำนวณขนาดให้ก่อน 1 รอบ +++
        const isLegacyGroupWithoutSize = data.nodes.some((n: any) => n.type === 'groupNode' && !n.width);

        if (!hasSavedPositions || isLegacyGroupWithoutSize) {
          const layouted = getLayoutedElements(newNodes, newEdges);
          finalNodes = layouted.nodes;
          finalEdges = layouted.edges;
        } else {
          finalNodes = [...newNodes].sort((a, b) => {
            if (a.type === 'groupNode' && b.type !== 'groupNode') return -1;
            if (a.type !== 'groupNode' && b.type === 'groupNode') return 1;
            return 0;
          });
        }

        const cleanJSON = generateExportJSON(data.systemName || "Untitled", finalNodes, finalEdges);

        set({ systemName: data.systemName || "Untitled Blueprint", currentJSON: cleanJSON, nodes: finalNodes, edges: finalEdges });
        get()._saveToCurrentProject(cleanJSON, data.systemName);
        return { success: true };
      } catch (err) { return { success: false, error: (err as Error).message }; }
    },
  };
});