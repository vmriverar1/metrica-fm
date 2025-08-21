import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Utility function to read JSON files from the public directory
 * Works both in development and production environments
 */
export function readPublicJSON<T = any>(filePath: string): T {
  try {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = join(process.cwd(), 'public', cleanPath);
    const fileContents = readFileSync(fullPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    throw new Error(`Failed to load JSON file: ${filePath}`);
  }
}

/**
 * Async version for consistency with existing fetch calls
 */
export async function readPublicJSONAsync<T = any>(filePath: string): Promise<T> {
  return readPublicJSON<T>(filePath);
}