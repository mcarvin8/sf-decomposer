/* eslint-disable */

export function findFieldName(element: any, fieldNames: string): string | undefined {
  const fieldNamesArray = fieldNames.split(',');

  for (const fieldName of fieldNamesArray) {
    // Check if the current fieldName exists in the element
    if (element[fieldName]) {
      return element[fieldName];
    }
  }

  // Iterate through child elements to find the field name
  for (const key in element) {
    if (typeof element[key] === 'object') {
      const childFieldName = findFieldName(element[key], fieldNames);
      if (childFieldName) {
        return childFieldName;
      }
    }
  }

  return undefined;
}
