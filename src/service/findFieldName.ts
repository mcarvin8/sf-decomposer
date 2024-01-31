'use strict';

import { XmlElement } from '../types/xmlElement.js';

export function findFieldName(element: XmlElement, fieldNames: string): string | undefined {
  const fieldNamesArray = fieldNames.split(',');

  for (const fieldName of fieldNamesArray) {
    // Check if the current fieldName exists in the element
    if (element[fieldName] !== undefined) {
      if (typeof element[fieldName] === 'string') {
        return element[fieldName] as string;
      } else if (typeof element[fieldName] === 'object') {
        const childFieldName = findFieldName(element[fieldName] as XmlElement, fieldNames);
        if (childFieldName !== undefined) {
          return childFieldName;
        }
      }
    }
  }

  // Iterate through child elements to find the field name
  for (const key in element) {
    if (typeof element[key] === 'object' && element[key] !== null) {
      const childFieldName = findFieldName(element[key] as XmlElement, fieldNames);
      if (childFieldName !== undefined) {
        return childFieldName;
      }
    }
  }

  return undefined;
}
