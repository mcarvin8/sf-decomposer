'use strict';
import { readFile } from 'node:fs/promises';

export async function readOriginalLogFile(logFile: string): Promise<string[]> {
  let originalLog: string[];
  try {
    originalLog = (await readFile(logFile, 'utf-8')).split('\n');
  } catch (err) {
    originalLog = [];
  }
  return originalLog;
}

export async function checkLogForErrors(logFile: string, originalLogContents: string[]): Promise<string[]> {
  let currentLog: string[];
  const newErrors: string[] = [];
  try {
    currentLog = (await readFile(logFile, 'utf-8')).split('\n');
  } catch (err) {
    return newErrors;
  }

  for (const line of currentLog) {
    if (!originalLogContents.includes(line) && line.includes('[ERROR]')) {
      const errorMessage = line.split('default - ')[1];
      newErrors.push(errorMessage);
    }
  }
  return newErrors;
}
