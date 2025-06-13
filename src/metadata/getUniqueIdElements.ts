'use strict';
import uniqueElements from './uniqueIdElements.js';

export function getUniqueIdElements(metaSuffix: string): string | undefined {
  const merged: Record<string, { uniqueIdElements: string[] }> = {};

  // Merge all top-level objects in the array into a single dictionary
  for (const obj of uniqueElements) {
    Object.assign(merged, obj);
  }

  if (metaSuffix in merged) {
    return merged[metaSuffix].uniqueIdElements.join(',');
  } else {
    return undefined;
  }
}
