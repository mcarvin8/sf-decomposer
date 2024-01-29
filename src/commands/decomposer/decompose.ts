/* eslint-disable */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { XMLParser } from 'fast-xml-parser';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { METADATA_DIR_DEFAULT_VALUE, XML_HEADER } from '../../helpers/constants.js';
import jsonData from '../../metadata/metadata.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-decomposer', 'decomposer.decompose');
const metaSuffixOptions = jsonData.map((item: Metadata) => item.metaSuffix);

const XML_PARSER_OPTION = {
  commentPropName: '#comment',
  ignoreAttributes: false,
  ignoreNameSpace: false,
  parseTagValue: false,
  parseNodeValue: false,
  parseAttributeValue: false,
  trimValues: true,
  processEntities: false,
};

export type DecomposerDecomposeResult = {
  path: string;
};

export default class DecomposerDecompose extends SfCommand<DecomposerDecomposeResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'dx-directory': Flags.directory({
      summary: messages.getMessage('flags.dx-directory.summary'),
      char: 'd',
      required: true,
      exists: true,
      default: METADATA_DIR_DEFAULT_VALUE,
    }),
    'metadata-type': Flags.option({
      summary: messages.getMessage('flags.metadata-type.summary'),
      char: 'm',
      required: true,
      options: metaSuffixOptions,
    })(),
  };

  public async run(): Promise<DecomposerDecomposeResult> {
    const { flags } = await this.parse(DecomposerDecompose);

    const metadataTypeToRetrieve = flags['metadata-type'];
    const dxDirectory = flags['dx-directory'];
    const metaAttributes = getAttributesForMetadataType(jsonData, metadataTypeToRetrieve);

    if (metaAttributes) {
      const metaSuffix = metaAttributes.metaSuffix;
      const directoryName = metaAttributes.directoryName;
      const fieldNames = metaAttributes.fieldNames;
      const xmlElement = metaAttributes.xmlElement;
      const metadataPath = `${dxDirectory}/${directoryName}`;
      this.parseMetadataFiles(metadataPath, metaSuffix, fieldNames, xmlElement);
    } else {
      this.log(`Metadata type ${metadataTypeToRetrieve} not found.`);
    }

    return {
      path: 'sfdx-decomposer\\src\\commands\\decomposer\\decompose.ts',
    };
  }

  private parseMetadataFiles(metadataPath: string, metaSuffix: string, fieldNames: string, xmlElement: string): void {
    const files = fs.readdirSync(metadataPath);
    files.forEach((file) => {
      const filePath = path.join(metadataPath, file);
      if (file.endsWith(`.${metaSuffix}-meta.xml`)) {
        // Add your logic to parse the metadata file here
        this.log(`Parsing metadata file: ${filePath}`);
        const xmlContent = fs.readFileSync(filePath, 'utf-8');
        const baseName = path.basename(filePath, `.${metaSuffix}-meta.xml`);
        const outputPath = path.join(metadataPath, metaSuffix === 'labels' ? '' : baseName);
        xml2jsParser(xmlContent, outputPath, fieldNames, xmlElement, baseName, metaSuffix);
      }
    });
    this.log(`All metadata files have been decomposed for the metadata type: ${metaSuffix}`);
  }
}

interface Metadata {
  directoryName: string;
  metaSuffix: string;
  xmlElement: string;
  fieldNames: string;
}

function getAttributesForMetadataType(jsonData: Metadata[], metadataType: string): Metadata | null {
  const metadata = jsonData.find((item) => item.metaSuffix === metadataType);

  if (metadata) {
    return metadata;
  }
  return null;
}

function xml2jsParser(
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

function findFieldName(element: any, fieldNames: string): string | undefined {
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

function printChildElements(
  element: any,
  parentKey: string | null = null,
  xmlContent: string,
  indent: string = '    '
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
