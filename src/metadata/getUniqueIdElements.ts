'use strict';
import uniqueIdElementsData from './uniqueIdElements.json' assert { type: 'json' };

interface UniqueIdElements {
  [key: string]: {
    uniqueIdElements: string[];
  };
}

export function getUniqueIdElements(metaSuffix: string): string | undefined {
  const jsonData: UniqueIdElements = uniqueIdElementsData;

  if (metaSuffix in jsonData) {
    return jsonData[metaSuffix].uniqueIdElements.join(',');
  } else {
    return undefined;
  }
}
