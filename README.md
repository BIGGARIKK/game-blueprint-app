# 🎮 DEV BLUEPRINT - Game Architecture & System Designer

**DEV BLUEPRINT** คือเว็บแอปพลิเคชันสำหรับนักพัฒนาเกมและวิศวกรซอฟต์แวร์ เพื่อใช้ออกแบบผังสถาปัตยกรรมระบบ (System Architecture) วางแผนลอจิก และติดตามความคืบหน้าของโปรเจกต์ผ่านกราฟิกโหนดแบบอินเทอร์แอกทีฟ (Interactive Node-based) 

ทำงานได้อย่างรวดเร็ว ปลอดภัย และจบครบในเบราว์เซอร์ของคุณ 100% โดยไม่ต้องพึ่งพา Backend

---

## ✨ ฟีเจอร์หลัก (Key Features)

- **📐 Smart Hybrid Layout (Dagre + Manual):** ระบบจัดวางโหนดอัตโนมัติที่ชาญฉลาด ป้องกันการทับซ้อน แต่ยังคงจดจำพิกัดและขนาดกล่อง (Group Container) ตามที่ผู้ใช้ปรับแต่งเองได้อย่างแม่นยำ
- **🗂️ Multi-Project Workspace:** สลับการทำงานระหว่างหลาย ๆ เกมหรือหลายโปรเจกต์ได้ทันที ข้อมูลทั้งหมดถูกแยกเก็บอย่างเป็นระเบียบ
- **📋 Master Todo & Bug Tracker:** ติดตามภาพรวมความคืบหน้าของงานย่อย พร้อมระบบแจ้งเตือน **"🚨 จุดติดบั๊กวิกฤต"** สีแดงกะพริบเด่นชัดบนแผง Sidebar
- **📝 Freestyle Brainstorming:** รองรับการวางกระดาษโน้ต (Sticky Notes) สีเหลืองสไตล์ Post-it เพื่อจดไอเดียลอจิกข้ามระบบได้อย่างอิสระ
- **📊 Health Analytics Dashboard:** สรุปสถิติสุขภาพของโปรเจกต์แบบกราฟิก โชว์สัดส่วนภาระงาน (Workload) แยกตามแผนก พร้อมให้กด `Win+Shift+S` แคปหน้าจอส่งรายงานความคืบหน้าได้ทันที
- **🤖 AI Docs-as-Prompt:** ระบบสร้าง Context และคำสั่งดักทาง Schema อัจฉริยะ สำหรับก๊อปปี้ไปสั่งงานต่อใน ChatGPT, Claude หรือ Gemini ได้โดยที่ AI ไม่มั่วโครงสร้าง
- **💻 VS Code Code Editor:** ฝัง Monaco Editor เบื้องหลัง โชว์เลขบรรทัดและไฮไลต์สีสัน JSON สวยงาม พร้อมระบบแจ้งเตือน Syntax Error ทันทีที่พิมพ์ผิด
- **🔒 Client-Side Secure Backup:** บันทึกข้อมูลลง LocalStorage อัตโนมัติ พร้อมรองรับการ Import / Export ไฟล์ `.json` เพื่อแชร์งานให้ทีมหรือสำรองข้อมูลลงเครื่อง

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Visual Nodes Engine:** [React Flow (@xyflow/react)](https://reactflow.dev/) + [Dagre](https://github.com/dagrejs/dagre)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Typography:** [Noto Sans Thai](https://fonts.google.com/specimen/Noto+Sans+Thai) (ปรับแต่งเพื่อ UI ขนาดเล็กให้อ่านง่าย คมชัด)
- **Code Editor:** [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)

---

## 🚀 เริ่มต้นการใช้งาน (Getting Started)

### 1. การติดตั้ง (Installation)
โคลนโปรเจกต์ลงมาที่เครื่องของคุณ และติดตั้งแพ็กเกจที่จำเป็น:

```bash
git clone <your-repo-url>
cd game-architecture-blueprint
npm install
