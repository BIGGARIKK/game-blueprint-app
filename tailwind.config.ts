import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // +++ บังคับให้คลาส font-sans ทั้งเว็บดึง IBM Plex ไปใช้เป็นตัวหลัก +++
        sans: ['var(--font-ibm-plex-thai)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;