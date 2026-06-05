/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soulify: {
          primary: "#2A5565",
          "primary-hover": "#1e3f4d",
          "primary-light": "#4a7a8c",
          accent: "#3d7a8f",
          secondary: "#A7C4BC",
          tertiary: "#38768B",
          bg: "#F2F5F7",
          "bg-alt": "#F7F9FA",
          elevated: "#FFFFFF",
          muted: "#EEF2F4",
          text: "#1a2e36",
          "text-muted": "#5a7a85",
          dark: "#050e12",
          "dark-card": "rgba(10, 30, 38, 0.8)",
        },
      },
    },
  },
  plugins: [],
};
