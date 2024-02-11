'use strict';

import { XmlElement } from './types.js';

export function findUniqueIdElement(element: XmlElement, uniqueIdElements: string): string | undefined {
  const uniqueIdElementsArray = uniqueIdElements.split(',');

  for (const fieldName of uniqueIdElementsArray) {
    // Check if the current fieldName exists in the element
    if (element[fieldName] !== undefined) {
      if (typeof element[fieldName] === 'string') {
        return element[fieldName] as string;
      } else if (typeof element[fieldName] === 'object') {
        const childFieldName = findUniqueIdElement(element[fieldName] as XmlElement, uniqueIdElements);
        if (childFieldName !== undefined) {
          return childFieldName;
        }
      }
    }
  }

  // Iterate through child elements to find the field name
  for (const key in element) {
    if (typeof element[key] === 'object' && element[key] !== null) {
      const childFieldName = findUniqueIdElement(element[key] as XmlElement, uniqueIdElements);
      if (childFieldName !== undefined) {
        return childFieldName;
      }
    }
  }

  return undefined;
}
