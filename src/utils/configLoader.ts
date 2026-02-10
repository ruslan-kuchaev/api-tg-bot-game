import { readFileSync } from 'fs';
import { join } from 'path';

interface GameConfig {
    name: string;
    appId: number;
}

export function getGamesConfig(): GameConfig[] {
  try {
    const configPath = join(process.cwd(), 'games.json');
    const configData = readFileSync(configPath, 'utf-8');
    return JSON.parse(configData); 
  } catch (error) {
    console.error('Error loading games config:', error);
    throw new Error('Проверьте файл games.json');
  }
}