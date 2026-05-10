import type { Metadata } from 'next';
// 1. ดึงฟอนต์ Kanit จาก Google Fonts แบบ Built-in
import { Kanit } from 'next/font/google';
import './globals.css';

// 2. ตั้งค่าค่าน้ำหนักฟอนต์ (บาง, ปกติ, หนา) และรองรับภาษาไทย
const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700', '900'],
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
      {/* 3. เอา kanit.className มาใส่ที่ body ฟอนต์จะเปลี่ยนทั้งเว็บทันที */}
      <body className={`${kanit.className} bg-slate-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}