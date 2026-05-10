import React, { useState } from "react";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ConfirmDialog } from "./ConfirmDialog";

export default function NodeInspector() {
  const {
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    updateNodeData,
    updateNodeParent,
    addTask,
    deleteTask,
    deleteNode,
  } = useCanvasStore();

  const [newTaskText, setNewTaskText] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const isGroup = node.type === "groupNode";
  const isSticky = node.type === "stickyNote";
  const groupNodes = nodes.filter(
    (n) => n.type === "groupNode" && n.id !== node.id,
  );

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(node.id, newTaskText);
    setNewTaskText("");
  };

  const handleDeleteClick = () => {
    setConfirmDialog({
      isOpen: true,
      title: isGroup
        ? `ลบกลุ่ม "${node.data.label}"`
        : isSticky
          ? "ลบกระดาษโน้ต"
          : `ลบโหนด "${node.data.label}"`,
      message: isGroup
        ? "กลุ่มและโหนดลูกทั้งหมดที่อยู่ในกลุ่มนี้จะถูกลบออกจากกระดาน ไม่สามารถกู้คืนได้"
        : "โหนดนี้จะถูกลบออกจากกระดานถาวร ไม่สามารถกู้คืนได้",
      onConfirm: () => {
        deleteNode(node.id);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="ลบทิ้ง"
        cancelLabel="ยกเลิก"
        variant="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
      />

      <div className="w-80 h-full bg-slate-950 border-l border-slate-800 flex flex-col font-sans z-10 animate-in slide-in-from-right duration-200">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isGroup
                ? "📦 Group Inspector"
                : isSticky
                  ? "📝 Note Inspector"
                  : "Node Inspector"}
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">
              ID: {node.id}
            </p>
          </div>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="text-slate-500 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded"
          >
            ✕ ปิด
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              {isGroup
                ? "ชื่อกลุ่ม (Group Label)"
                : isSticky
                  ? "ข้อความในโน้ต (Note Text)"
                  : "ชื่อระบบ (Label)"}
            </label>
            {isSticky ? (
              <textarea
                rows={8}
                value={node.data.label}
                onChange={(e) =>
                  updateNodeData(node.id, { label: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="พิมพ์ไอเดียหรือหมายเหตุ..."
              />
            ) : (
              <input
                type="text"
                value={node.data.label}
                onChange={(e) =>
                  updateNodeData(node.id, { label: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            )}
          </div>

          {!isGroup && !isSticky && (
            <>
              {/* แผนก */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  แผนก (Category)
                </label>
                <select
                  value={node.data.category || "Scripting"}
                  onChange={(e) =>
                    updateNodeData(node.id, { category: e.target.value as any })
                  }
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

              {/* +++ 1. เพิ่ม Dropdown เลือกความสำคัญ (Priority) +++ */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  ความสำคัญ (Priority)
                </label>
                <select
                  value={node.data.priority || "low"}
                  onChange={(e) =>
                    updateNodeData(node.id, { priority: e.target.value as any })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">💤 Low (ความสำคัญต่ำ)</option>
                  <option value="medium">⚡ Medium (ปานกลาง)</option>
                  <option value="high">🔥 High (งานด่วนไฟลุก)</option>
                </select>
              </div>

              {/* +++ 2. เพิ่ม Dropdown เลือกสถานะ (Status) +++ */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  สถานะการพัฒนา (Status)
                </label>
                <select
                  value={node.data.status || "planned"}
                  onChange={(e) =>
                    updateNodeData(node.id, { status: e.target.value as any })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="planned">💡 แพลนไว้ (Planned)</option>
                  <option value="in_progress">
                    ⏳ กำลังโค้ด (In Progress)
                  </option>
                  <option value="review">🔍 ตรวจสอบ (Review)</option>
                  <option value="bug">🚨 ติดบั๊ก (Bug / Needs Fix)</option>
                </select>
              </div>

              {/* สังกัดกลุ่ม */}
              <div>
                <label className="block text-xs font-bold text-cyan-400 mb-1">
                  📦 ย้ายเข้ากลุ่ม (Parent Group)
                </label>
                <select
                  value={node.parentId || ""}
                  onChange={(e) =>
                    updateNodeParent(node.id, e.target.value || null)
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- ไม่สังกัดกลุ่ม (None) --</option>
                  {groupNodes.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.data.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* งานย่อย */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">
                  งานย่อย (To-do Tasks)
                </label>
                <form onSubmit={handleAddTask} className="flex gap-1 mb-3">
                  <input
                    type="text"
                    placeholder="พิมพ์เพิ่มงาน..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-lime-500"
                  />
                  <button
                    type="submit"
                    className="bg-lime-500 hover:bg-lime-400 text-slate-950 px-3 py-1 rounded text-xs font-bold"
                  >
                    เพิ่ม
                  </button>
                </form>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(node.data.tasks || []).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between bg-slate-900/50 border border-slate-800 px-2 py-1 rounded text-xs"
                    >
                      <span
                        className={`truncate text-slate-300 ${task.done ? "line-through text-slate-500" : ""}`}
                      >
                        {task.done ? "✔️ " : ""}
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(node.id, task.id)}
                        className="text-rose-500 hover:text-rose-400 font-bold ml-2 text-[10px]"
                      >
                        ลบ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {isGroup && (
            <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-lg mt-2">
              <p className="text-xs text-cyan-300 leading-relaxed">
                💡 **นี่คือกล่องกลุ่ม (Container)**
              </p>
            </div>
          )}
          {isSticky && (
            <p className="text-[10px] text-amber-600/70 italic">
              * Sticky Note ใช้สำหรับจดบันทึกไอเดีย
              จะไม่มีจุดเชื่อมสายไฟไปยังโหนดอื่น
            </p>
          )}
        </div>

        <div className="p-3 bg-slate-900/50 border-t border-slate-800">
          <button
            onClick={handleDeleteClick}
            className="w-full bg-rose-950/40 hover:bg-rose-900 text-rose-400 hover:text-white border border-rose-800/50 rounded py-1.5 text-xs font-bold transition-all"
          >
            🗑️{" "}
            {isGroup
              ? "ลบกลุ่มนี้ทิ้ง"
              : isSticky
                ? "ลบโน้ตนี้ทิ้ง"
                : "ลบโหนดนี้ทิ้ง"}
          </button>
        </div>
      </div>
    </>
  );
}
