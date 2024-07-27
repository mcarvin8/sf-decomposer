'use strict';
import { readFile } from 'node:fs/promises';

import { UniqueIdElements } from '../helpers/types.js';

export async function getUniqueIdElements(metaSuffix: string): Promise<string | undefined> {
  const fileContent: string = await readFile(new URL('./uniqueIdElements.json', import.meta.url), 'utf-8');
  const jsonData: UniqueIdElements = JSON.parse(fileContent) as UniqueIdElements;

  if (metaSuffix in jsonData) {
    return jsonData[metaSuffix].uniqueIdElements.join(',');
  } else {
    return undefined;
  }
}
