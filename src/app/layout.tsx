import type { Metadata } from 'next';
// 1. Import แค่ IBM Plex Sans Thai ตัวเดียวจบ
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import './globals.css';

const ibmPlexThai = IBM_Plex_Sans_Thai({
  variable: '--font-ibm-plex-thai',
  subsets: ['thai', 'latin'], // คลุมทั้งไทยและอังกฤษ
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DEV BLUEPRINT - Game Architecture Designer',
  description: 'Interactive node-based system designer for game developers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body 
        // 2. ยัดตัวแปรเดียวลง body
        className={`
          ${ibmPlexThai.variable} 
          font-sans bg-slate-950 text-slate-100 antialiased select-none
        `}
      >
        {children}
      </body>
    </html>
  );
}