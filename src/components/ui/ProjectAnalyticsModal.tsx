import React from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function ProjectAnalyticsModal({ onClose }: { onClose: () => void }) {
  const { systemName, nodes } = useCanvasStore();

  // 1. คัดกรองเฉพาะโหนดงานจริง (ไม่เอากล่องแม่ และกระดาษโน้ต)
  const featureNodes = nodes.filter(
    (n) => n.type !== 'groupNode' && n.type !== 'stickyNote'
  );

  // 2. คำนวณภาพรวม Tasks ทั้งหมด
  let totalTasks = 0;
  let doneTasks = 0;
  featureNodes.forEach((node) => {
    const tasks = node.data.tasks || [];
    totalTasks += tasks.length;
    doneTasks += tasks.filter((t) => t.done).length;
  });

  const overallProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // 3. คำนวณสถานะ (Status & Bugs)
  const bugNodes = featureNodes.filter((n) => n.data.status === 'bug');
  const inProgressCount = featureNodes.filter((n) => n.data.status === 'in_progress').length;
  const reviewCount = featureNodes.filter((n) => n.data.status === 'review').length;
  const plannedCount = featureNodes.filter((n) => !n.data.status || n.data.status === 'planned').length;

  // 4. คำนวณสัดส่วนตามแผนก (Workload by Category)
  const categories = ['Scripting', 'UI', 'Database', 'Networking', 'Art', 'Sound'] as const;
  const categoryCounts: Record<string, number> = {};
  categories.forEach((cat) => { categoryCounts[cat] = 0; });

  featureNodes.forEach((node) => {
    const cat = node.data.category || 'Scripting';
    if (categoryCounts[cat] !== undefined) {
      categoryCounts[cat] += 1;
    }
  });

  // หาแผนกที่งานหนักสุดเพื่อทำสเกลเปรียบเทียบ
  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // 5. คำนวณสัดส่วนความสำคัญ (Priority Breakdown)
  const highPriorityCount = featureNodes.filter((n) => n.data.priority === 'high').length;
  const medPriorityCount = featureNodes.filter((n) => n.data.priority === 'medium').length;
  const lowPriorityCount = featureNodes.filter((n) => !n.data.priority || n.data.priority === 'low').length;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-black tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              <span>📊 สรุปสถิติ (Analytics)</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium truncate">
              ระบบ: <span className="text-white font-bold">{systemName}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white font-bold text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            ✕ ปิด
          </button>
        </div>

        {/* เนื้อหาหลัก */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 select-text">
          
          {/* โซนที่ 1: การ์ดภาพรวมบนสุด (Hero Metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0 select-none">
            
            {/* การ์ดความคืบหน้ารวม */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-lime-500" />
              <span className="text-xs font-bold text-slate-400 block mb-1">ความคืบหน้ารวม (Progress)</span>
              
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl font-black text-white tracking-tight">{overallProgress}%</span>
                <span className="text-[10px] text-slate-500 font-mono">({doneTasks}/{totalTasks} Tasks)</span>
              </div>

              {/* Custom Mini Progress Bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-2 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-lime-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            {/* การ์ดเตือนภัย Bug */}
            <div className={`border p-4 rounded-xl flex flex-col justify-between relative overflow-hidden transition-all ${
              bugNodes.length > 0 
                ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]' 
                : 'bg-slate-950/60 border-slate-800'
            }`}>
              {bugNodes.length > 0 && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse" />}
              <span className="text-xs font-bold text-slate-400 block mb-1">จุดติดบั๊กวิกฤต (Critical Bugs)</span>
              
              <div className="flex items-baseline gap-2 my-1">
                <span className={`text-3xl font-black tracking-tight ${bugNodes.length > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  {bugNodes.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">จุด</span>
              </div>

              <p className="text-[10px] text-slate-500 mt-2 truncate">
                {bugNodes.length > 0 ? `🔥 ด่วน: ${bugNodes.map(n => n.data.label).join(', ')}` : '🎉 ยอดเยี่ยม! ระบบคลีนไม่มีบั๊ก'}
              </p>
            </div>

            {/* การ์ดสรุปจำนวนโหนด */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
              <span className="text-xs font-bold text-slate-400 block mb-1">จำนวนโมดูล (Total Nodes)</span>
              
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl font-black text-slate-100 tracking-tight">{featureNodes.length}</span>
                <span className="text-xs text-slate-500 font-medium">ระบบย่อย</span>
              </div>

              <div className="flex items-center gap-2 mt-2 text-[10px]">
                <span className="text-orange-400 font-bold">🔥 {highPriorityCount} High</span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-400 font-bold">⚡ {medPriorityCount} Med</span>
              </div>
            </div>

          </div>

          {/* โซนที่ 2: สัดส่วนภาระงานแยกตามแผนก (Workload Breakdown) */}
          <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>📈 สัดส่วนภาระงานตามแผนก (Workload by Category)</span>
              <span className="text-[10px] text-slate-500 font-normal lowercase">* นับจากจำนวนระบบย่อย</span>
            </h3>

            <div className="space-y-3">
              {categories.map((cat) => {
                const count = categoryCounts[cat];
                const percentOfMax = (count / maxCategoryCount) * 100;
                const percentOfTotal = featureNodes.length > 0 ? Math.round((count / featureNodes.length) * 100) : 0;

                // สไตล์สีของแต่ละแผนก
                const catColors: Record<string, { bar: string; text: string }> = {
                  Scripting: { bar: 'bg-lime-500', text: 'text-lime-400' },
                  UI: { bar: 'bg-pink-500', text: 'text-pink-400' },
                  Database: { bar: 'bg-amber-500', text: 'text-amber-400' },
                  Networking: { bar: 'bg-cyan-500', text: 'text-cyan-400' },
                  Art: { bar: 'bg-purple-500', text: 'text-purple-400' },
                  Sound: { bar: 'bg-emerald-500', text: 'text-emerald-400' },
                };

                const color = catColors[cat];

                return (
                  <div key={cat} className="flex flex-col gap-1 select-none">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${color.bar}`} />
                        {cat}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {count} ระบบ <span className={`font-bold ${color.text}`}>({percentOfTotal}%)</span>
                      </span>
                    </div>

                    {/* กราฟแท่งแนวนอน */}
                    <div className="w-full bg-slate-900 h-3 rounded-md overflow-hidden p-0.5 border border-slate-800/60 flex items-center">
                      <div 
                        className={`h-full rounded-sm transition-all duration-700 ease-out ${color.bar}`}
                        style={{ width: `${Math.max(percentOfMax, count > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* โซนที่ 3: กราฟแท่งสถานะการพัฒนา (Status Distribution) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* ฝั่งซ้าย: สถานะการทำงาน */}
            <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                ⏳ สถานะการพัฒนา (Dev Status)
              </h3>

              <div className="space-y-2.5 flex-1 justify-center flex flex-col">
                {[
                  { label: '💡 แพลนไว้ (Planned)', count: plannedCount, color: 'bg-slate-500' },
                  { label: '⏳ กำลังโค้ด (In Progress)', count: inProgressCount, color: 'bg-sky-500' },
                  { label: '🔍 รอตรวจ (Review)', count: reviewCount, color: 'bg-purple-500' },
                  { label: '🚨 ติดบั๊ก (Bug)', count: bugNodes.length, color: 'bg-rose-500 animate-pulse' },
                ].map((item) => {
                  const pct = featureNodes.length > 0 ? Math.round((item.count / featureNodes.length) * 100) : 0;
                  return (
                    <div key={item.label} className="flex items-center justify-between text-xs border-b border-slate-900 pb-1 last:border-none">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-mono text-slate-400 font-bold">{item.count} <span className="font-normal text-[10px] text-slate-600">({pct}%)</span></span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ฝั่งขวา: คำแนะนำสำหรับส่งรายงาน */}
            <div className="bg-gradient-to-br from-purple-950/30 to-slate-950 border border-purple-800/40 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>📸 พร้อมสำหรับรายงาน (Report Ready)</span>
                </h3>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  หน้าต่างนี้ถูกออกแบบเลย์เอาต์มาให้มีสเกลที่พอดี คุณสามารถใช้เครื่องมือ <span className="text-white font-bold underline">Snipping Tool</span> หรือกด <span className="bg-slate-800 px-1 py-0.5 rounded text-white font-mono font-bold text-[10px]">Win+Shift+S</span> แคปเจอร์กรอบนี้เพื่อนำไปแนบส่งความคืบหน้าได้ทันทีครับ
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-purple-900/40 flex items-center justify-between text-[10px] text-purple-300/60 font-mono">
                <span>GENERATED BY DEV BLUEPRINT</span>
                <span>{new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-500 text-center shrink-0 select-none">
          💡 สถิติทั้งหมดประมวลผลแบบเรียลไทม์จากโครงสร้างกระดานปัจจุบัน
        </div>

      </div>
    </div>
  );
}