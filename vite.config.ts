import { defineConfig, loadEnv } from 'vite'; // 1. Import loadEnv
import react from '@vitejs/plugin-react';
import { readdirSync, unlinkSync, renameSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';

function cleanPublicDir(): Plugin {
  return {
    name: 'clean-public-dir',
    buildStart() {
      const publicDir = resolve(__dirname, 'public');
      try {
        const files = readdirSync(publicDir);
        for (const file of files) {
          if (file.includes(' ')) {
            const oldPath = resolve(publicDir, file);
            const newName = file.replace(/ /g, '_');
            const newPath = resolve(publicDir, newName);
            try {
              unlinkSync(oldPath);
            } catch {
              try {
                renameSync(oldPath, newPath);
              } catch {
                // File may be locked, skip
              }
            }
          }
        }
      } catch {
        // Directory may not exist
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  // 2. Load env file based on the current 'mode' (development, production, etc.)
  // process.cwd() tells Vite to look for the .env file in the root directory
  const env = loadEnv(mode, process.cwd(), '');

  // 3. Access your variable safely from the returned object
  const googleClientId = env.VITE_GOOGLE_CLIENT_ID; 

  return {
    plugins: [react(), cleanPublicDir()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    // If you need to expose this variable or do something with it in the config, you can use it here
  };
});