/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        evil: {
          bg: "#0A0B0E",
          surface: "#12141A",
          panel: "#181A22",
          elevated: "#20232E",
          border: "#262936",
          hover: "#2F3342",
          yellow: "#E5FF44",
          yellowHover: "#D6F232",
          yellowMuted: "rgba(229, 255, 68, 0.15)",
          text: "#F1F2F6",
          muted: "#8E93A6",
          dim: "#565A6E"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
