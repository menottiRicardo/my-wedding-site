import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import { ssamExport } from "vite-plugin-ssam-export";
import { ssamFfmpeg } from "vite-plugin-ssam-ffmpeg";
import { ssamGit } from "vite-plugin-ssam-git";
// import { ssamTimelapse } from "vite-plugin-ssam-timelapse";

export default defineConfig({
  base: "./",
  plugins: [
    glsl({
      warnDuplicatedImports: false,
    }),
    ssamExport(),
    ssamFfmpeg(),
    ssamGit(),
    // ssamTimelapse(),
  ],
  clearScreen: false,
  build: {
    outDir: "./dist",
    assetsDir: ".",
    rollupOptions: {
      input: {
        main: 'index.html',
        'dress-code': 'dress-code.html'
      },
    },
  },
  server: {
    allowedHosts: ["f68a6f725801.ngrok-free.app"],
  },
  preview: {
    allowedHosts: ["ricardorachell.com","my-wedding-site-production.up.railway.app", "7e878904996f.ngrok-free.app"],
  },
});
