import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "today-office",
  brand: {
    displayName: "오늘도 출근합니다",
    primaryColor: "#3182F6",
    icon: "https://static.toss.im/appsintoss/21471/d1e814b9-effe-4f52-a38c-646c49aa96f3.png", // 토스 콘솔에 등록된 앱 아이콘 (600x600)
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
