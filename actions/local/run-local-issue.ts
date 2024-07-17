import fs from 'fs/promises';
import path from 'path';
import { AIParsedResponse } from '@/types/ai';

export const runLocalIssue = {
  getLocalFiles: async (localPath: string): Promise<{ path: string; content: string }[]> => {
    const files: { path: string; content: string }[] = [];

    const readDir = async (dirPath: string) => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(localPath, fullPath);

        if (entry.isDirectory()) {
          await readDir(fullPath);
        } else {
          const content = await fs.readFile(fullPath, 'utf-8');
          files.push({ path: relativePath, content });
        }
      }
    };

    await readDir(localPath);
    return files;
  },

  applyLocalChanges: async (localPath: string, parsedResponse: AIParsedResponse) => {
    for (const file of parsedResponse.files) {
      const fullPath = path.join(localPath, file.path);

      switch (file.status) {
        case 'new':
        case 'modified':
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, file.content);
          break;
        case 'deleted':
          await fs.unlink(fullPath);
          break;
      }
    }
  },
};