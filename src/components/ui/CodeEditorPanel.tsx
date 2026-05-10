import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function CodeEditorPanel() {
  const syncFromJSON = useCanvasStore((state) => state.syncFromJSON);
  const currentJSON = useCanvasStore((state) => state.currentJSON); // ดึง JSON สดๆ จากกระดาน
  
  const [jsonText, setJsonText] = useState(currentJSON);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: 'idle',
    msg: '',
  });

  // +++ หัวใจหลัก Two-Way Sync: เมื่อกระดานอัปเดต (เช่น ติ๊กงานเสร็จ) ให้ดึงค่ามาใส่ Editor อัตโนมัติ +++
  useEffect(() => {
    setJsonText(currentJSON);
  }, [currentJSON]);

  const handleSync = () => {
    setStatus({ type: 'idle', msg: '' });
    const result = syncFromJSON(jsonText);
    
    if (result.success) {
      setStatus({ type: 'success', msg: '⚡ อัปเดตกระดานสำเร็จ! (Auto-Layouted)' });
      setTimeout(() => setStatus({ type: 'idle', msg: '' }), 3000);
    } else {
      setStatus({ type: 'error', msg: `❌ Error: ${result.error}` });
    }
  };

  return (
    <div className="w-full h-full bg-slate-950 border-r border-slate-800 flex flex-col font-sans">
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Blueprint Docs (JSON)</h2>
          <p className="text-[10px] text-slate-500">ซิงค์สองทางอัตโนมัติ 🔄</p>
        </div>
        
        <button
          onClick={handleSync}
          className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded transition-all shadow-md shadow-lime-500/10 flex items-center gap-1"
        >
          ⚡ Force Sync
        </button>
      </div>

      {status.type !== 'idle' && (
        <div className={`px-3 py-2 text-xs font-medium border-b ${
          status.type === 'success' ? 'bg-lime-500/10 text-lime-400 border-lime-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          {status.msg}
        </div>
      )}

      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={jsonText}
          onChange={(val) => setJsonText(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            tabSize: 2,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
}