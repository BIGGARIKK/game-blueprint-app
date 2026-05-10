import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { ConfirmDialog } from './ConfirmDialog';
// +++ 1. Import Editor ระดับโปรจาก Monaco +++
import Editor from '@monaco-editor/react';

export default function CodeEditorPanel() {
  const { currentJSON, syncFromJSON, systemName } = useCanvasStore();
  const [text, setText] = useState(currentJSON);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [isAiDocsOpen, setIsAiDocsOpen] = useState(false);
  const [aiPromptCopied, setAiPromptCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ซิงค์ข้อความใน Editor เมื่อ JSON ใน Store เปลี่ยนแปลง
  useEffect(() => {
    setText(currentJSON);
    setError(null);
  }, [currentJSON]);

  const executeSync = () => {
    const result = syncFromJSON(text);
    if (!result.success) {
      setError(result.error || 'JSON ไม่ถูกต้อง');
    } else {
      setError(null);
    }
    setConfirmOpen(false);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateAiInstructionPrompt = () => {
    return `คุณคือผู้เชี่ยวชาญด้าน Game Architecture & Software System Design
โจทย์: กรุณาช่วยฉันออกแบบ ปรับปรุง หรือเพิ่มระบบย่อยลงในโครงสร้าง JSON Blueprint ต่อไปนี้ตามที่ฉันขอ

--- [กฎและโครงสร้าง JSON Schema ที่คุณต้องปฏิบัติตามอย่างเคร่งครัด] ---
1. "systemName": ชื่อระบบหลัก (String)
2. "nodes": อาร์เรย์ของโหนดบนกระดาน มี 3 ประเภทเท่านั้น:
   - "groupNode" (กล่องแม่สำหรับจัดหมวดหมู่): ต้องมี { id, type: "groupNode", label, width, height } 
     *ห้ามใส่ category, priority, status, และ tasks ลงใน groupNode เด็ดขาด
   - "stickyNote" (กระดาษโน้ตแปะไอเดีย): ต้องมี { id, type: "stickyNote", label: "ข้อความยาวๆ..." } 
     *ห้ามใส่ category, tasks, และ parentId
   - "featureNode" (โหนดระบบ/งานย่อย): ต้องมี { id, type: "featureNode", label, category, priority, status, tasks }
     * category ต้องเป็นค่าใดค่าหนึ่งนี้เท่านั้น: "UI" | "Scripting" | "Database" | "Networking" | "Art" | "Sound"
     * priority ต้องเป็น: "high" | "medium" | "low"
     * status ต้องเป็น: "planned" | "in_progress" | "review" | "bug"
     * tasks ต้องเป็นอาร์เรย์ของออบเจกต์: [{ "text": "ชื่องาน", "done": false }]
     * หากต้องการให้สังกัดกล่องแม่ ให้ใส่ "parentId": "id_ของ_groupNode"
3. "edges": อาร์เรย์ของเส้นเชื่อมความสัมพันธ์ { source: "id_ต้นทาง", target: "id_ปลายทาง", actionLabel: "คำอธิบายเส้น" }
4. กฎพิกัด (CRITICAL): โหนดใหม่ที่คุณสร้างไม่ต้องใส่ฟิลด์ position (ปล่อยให้ระบบ Auto-layout จัดการเอง) และห้ามไปแก้ไขหรือลบพิกัด position ของโหนดเดิมที่มีอยู่แล้วเด็ดขาด

--- [โครงสร้างกระดานปัจจุบัน (Current Blueprint JSON)] ---
\`\`\`json
${currentJSON}
\`\`\`

กรุณารับทราบโครงสร้างและกฎทั้งหมดนี้ ตอบกลับสั้นๆ ว่าเข้าใจ schema แล้ว และรอคำสั่งเพิ่มเติมจากฉันว่าต้องการให้เพิ่ม/ลดระบบอะไร:`;
  };

  const handleCopyAiPrompt = () => {
    const fullPrompt = generateAiInstructionPrompt();
    navigator.clipboard.writeText(fullPrompt);
    setAiPromptCopied(true);
    setTimeout(() => setAiPromptCopied(false), 2500);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={confirmOpen}
        title="บังคับซิงค์ข้อมูล (Force Sync)"
        message="การซิงค์ข้อมูลจากโค้ด JSON อาจทำให้โครงสร้างบนกระดานเปลี่ยนแปลง คุณต้องการยืนยันหรือไม่?"
        confirmLabel="⚡ ซิงค์เลย"
        cancelLabel="ยกเลิก"
        variant="warning"
        onConfirm={executeSync}
        onCancel={() => setConfirmOpen(false)}
      />

      <div className="w-full h-full bg-slate-950 flex flex-col font-sans relative select-none">
        
        {/* Header */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">💻 VS Code Blueprint</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAiDocsOpen(true)}
              className="bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 hover:text-white px-2.5 py-1 rounded text-xs font-bold transition-all shadow-sm flex items-center gap-1 animate-pulse"
              title="สร้าง Prompt กฎพร้อมโครงสร้างสำหรับส่งให้ AI"
            >
              🤖 AI Docs
            </button>

            <button
              onClick={handleCopyJson}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs font-medium transition-all"
            >
              {copied ? '✔️ Copied' : '📋 Copy'}
            </button>
          </div>
        </div>

        {/* +++ 2. พื้นที่ Monaco Code Editor ของจริง +++ */}
        <div className="flex-1 relative w-full overflow-hidden flex flex-col pt-2 bg-[#1e1e1e]">
          <Editor
            height="100%"
            language="json"
            theme="vs-dark"
            value={text}
            onChange={(value) => setText(value || '')}
            options={{
              minimap: { enabled: false }, // ปิด minimap แถบขวาเพื่อให้จอไม่รก
              fontSize: 12,
              fontFamily: 'monospace',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              formatOnPaste: true,
            }}
          />
          
          {error && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-rose-950 border-t border-rose-800 text-rose-400 text-[11px] leading-tight z-20 select-text">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-500">แก้ไขโค้ดแล้วกด Force Sync เพื่ออัปเดตกระดาน</span>
          <button
            onClick={() => setConfirmOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded text-xs font-bold transition-all shadow"
          >
            ⚡ Force Sync
          </button>
        </div>

        {/* Modal AI Docs */}
        {isAiDocsOpen && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col p-4 animate-in fade-in duration-150 select-text">
            <div className="flex items-center justify-between border-b border-purple-800/50 pb-2 mb-3 select-none">
              <div>
                <h3 className="text-xs font-black text-purple-400 uppercase flex items-center gap-1.5">
                  <span>🤖 Prompt & Context สำหรับ AI</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  ชุดคำสั่งดัก Schema และข้อห้าม พร้อมแนบโครงสร้างกระดานปัจจุบัน
                </p>
              </div>
              <button 
                onClick={() => setIsAiDocsOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-1 rounded text-xs font-bold"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="bg-purple-950/30 border border-purple-800/40 p-2.5 rounded-lg mb-3 text-[11px] text-purple-200 leading-relaxed shrink-0 select-none">
              💡 **วิธีใช้งาน:** กดปุ่มก๊อปปี้ด้านล่าง แล้วนำไปวางใน <span className="text-white font-bold">ChatGPT, Claude หรือ Gemini</span> เพื่อตั้งต้นบทสนทนา จากนั้นคุณสามารถสั่ง AI ด้วยภาษามนุษย์ต่อได้เลย เช่น <br />
              <span className="italic text-cyan-300 mt-1 block">
                &quot;ช่วยเพิ่มระบบ Combat ประกอบด้วยโหนดคำนวณดาเมจ และเอฟเฟกต์เสียง สังกัดกลุ่ม Combat ให้หน่อย&quot;
              </span>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded p-2.5 font-mono text-[10px] text-slate-300 overflow-y-auto whitespace-pre-wrap select-all leading-normal">
              {generateAiInstructionPrompt()}
            </div>

            <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between shrink-0 select-none">
              <span className="text-[10px] text-slate-500">
                * ข้อมูล JSON ใน prompt จะอัปเดตตรงกับกระดานเสมอ
              </span>
              
              <button
                onClick={handleCopyAiPrompt}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-purple-500/20 flex items-center gap-1.5"
              >
                {aiPromptCopied ? '✔️ ก๊อปปี้ Prompt สำเร็จ!' : '📋 ก๊อปปี้ Prompt ทั้งหมดไปให้ AI'}
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}