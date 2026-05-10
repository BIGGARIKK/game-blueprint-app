import type { Metadata } from 'next';
// 1. เปลี่ยนจาก Kanit เป็น Noto_Sans_Thai ที่ออกแบบมาเพื่อ UI ขนาดเล็กโดยเฉพาะ
import { Noto_Sans_Thai } from 'next/font/google';
import './globals.css';

// ดึงน้ำหนักฟอนต์มาให้ครบ (บาง, ปกติ, หนาปานกลาง, หนา)
const notoSansThai = Noto_Sans_Thai({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Game Architecture Blueprint',
  description: 'Node-based system designer for game developers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      {/* 2. คลาส antialiased จะช่วยปรับขอบฟอนต์บนพื้นมืดให้เรียบเนียน ไม่บวมหนา */}
      <body className={`${notoSansThai.className} bg-slate-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}