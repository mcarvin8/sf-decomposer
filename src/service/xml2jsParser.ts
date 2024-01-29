/* eslint-disable */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { XMLParser } from 'fast-xml-parser';

import { XML_PARSER_OPTION } from '../types/xmlParserOptions.js';
import { XML_HEADER } from '../helpers/constants.js';
import { findFieldName } from './findFieldName.js';
import { printChildElements } from './printChildElements.js';

export function xml2jsParser(
  xmlString: string,
  metadataPath: string,
  fieldNames: string,
  xmlElement: string,
  baseName: string,
  metaSuffix: string,
  indent: string = '    '
): void {
  try {
    const xmlParser = new XMLParser(XML_PARSER_OPTION);
    const result = xmlParser.parse(xmlString);

    const rootElementName = Object.keys(result)[1];
    const rootElement = result[rootElementName];
    let leafContent = '';
    let leafCount = 0;

    // Iterate through child elements to find the field name for each
    Object.keys(rootElement)
      .filter((key: string) => !key.startsWith('@'))
      .forEach((key: string) => {
        if (Array.isArray(rootElement[key])) {
          // Iterate through the elements of the array
          for (const element of rootElement[key]) {
            let elementContent = '';
            elementContent += `${XML_HEADER}\n`;

            const fieldName = findFieldName(element, fieldNames);
            const outputDirectory = path.join(metadataPath, metaSuffix === 'labels' ? '' : key);
            const outputFileName: string = `${fieldName}.${metaSuffix === 'labels' ? key.slice(0, -1) : key}-meta.xml`;
            const outputPath = path.join(outputDirectory, outputFileName);

            // Create the output directory if it doesn't exist
            fs.mkdirSync(outputDirectory, { recursive: true });

            // Call the printChildElements to build the XML content string
            elementContent = printChildElements(element, key, elementContent);

            // Write the XML content to the determined output path
            fs.writeFileSync(outputPath, elementContent);

            console.log(`XML content saved to: ${outputPath}`);
          }
        } else if (typeof rootElement[key] === 'object') {
          let elementContent = '';
          elementContent += `${XML_HEADER}\n`;

          const fieldName = findFieldName(rootElement[key], fieldNames);

          const outputDirectory = path.join(metadataPath, key);
          const outputFileName: string = `${fieldName}.${metaSuffix === 'labels' ? key.slice(0, -1) : key}-meta.xml`;
          const outputPath = path.join(outputDirectory, outputFileName);

          // Create the output directory if it doesn't exist
          fs.mkdirSync(outputDirectory, { recursive: true });

          // Call the printChildElements to build the XML content string
          elementContent = printChildElements(rootElement[key], key, elementContent);

          // Write the XML content to the determined output path
          fs.writeFileSync(outputPath, elementContent);

          console.log(`XML content saved to: ${outputPath}`);
        } else {
          // Process XML elements that do not have children (e.g., leaf elements)
          const fieldValue = rootElement[key];
          // Append leaf element to the accumulated XML content
          leafContent += `${indent}<${key}>${fieldValue}</${key}>\n`;
          leafCount++;
        }
      });

    if (leafCount > 0) {
      let leafFile = `${XML_HEADER}\n`;
      leafFile += `<${xmlElement}>\n`;

      const sortedLeafContent = leafContent
        .split('\n') // Split by lines
        .filter((line) => line.trim() !== '') // Remove empty lines
        .sort() // Sort alphabetically
        .join('\n'); // Join back into a string
      leafFile += sortedLeafContent;
      leafFile += `\n</${xmlElement}>`;
      const leafOutputPath = path.join(metadataPath, `${baseName}.${metaSuffix}-meta.xml`);
      fs.writeFileSync(leafOutputPath, leafFile);

      console.log(`All leaf elements saved to: ${leafOutputPath}`);
    }
  } catch (err) {
    console.error('Error parsing XML:', err);
  }
}
