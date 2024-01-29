/* eslint-disable */

export function printChildElements(
  element: any,
  parentKey: string | null = null,
  xmlContent: string,
  indent: string
): string {
  // Recursive function to handle nested elements
  function processElement(element: any, parentKey: string | null = null, currentIndent: string = ''): void {
    if (typeof element === 'object') {
      if (parentKey) {
        xmlContent += `${currentIndent}<${parentKey}>\n`;
      }

      Object.entries(element).forEach(([key, value]) => {
        if (key === '$') {
          // Skip the special key representing attributes, like the namespace
          return;
        }

        if (Array.isArray(value)) {
          // Handle arrays of elements
          value.forEach((arrayElement) => {
            if (typeof arrayElement === 'object') {
              processElement(arrayElement, key, `${currentIndent}${indent}`);
            } else {
              xmlContent += `${currentIndent}${indent}<${key}>${arrayElement}</${key}>\n`;
            }
          });
        } else if (typeof value === 'object') {
          // Recursively handle nested objects
          processElement(value, key, `${currentIndent}${indent}`);
        } else {
          // Print regular key-value pairs
          xmlContent += `${currentIndent}${indent}<${key}>${value}</${key}>\n`;
        }
      });

      if (parentKey) {
        xmlContent += `${currentIndent}</${parentKey}>\n`;
      }
    }
  }

  // Start processing with the initial indentation
  processElement(element, parentKey, indent);

  return xmlContent;
}
