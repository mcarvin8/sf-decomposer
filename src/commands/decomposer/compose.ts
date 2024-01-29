/* eslint-disable */
import * as fs from 'node:fs';
import * as path from 'node:path';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import {
  METADATA_DIR_DEFAULT_VALUE,
  XML_HEADER,
  NAMESPACE,
  CUSTOM_LABELS_FILE,
  INDENT,
} from '../../helpers/constants.js';
import jsonData from '../../metadata/metadata.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-decomposer', 'decomposer.compose');
const metaSuffixOptions = jsonData.map((item: Metadata) => item.metaSuffix);

export type DecomposerComposeResult = {
  path: string;
};

export default class DecomposerCompose extends SfCommand<DecomposerComposeResult> {
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

  public async run(): Promise<DecomposerComposeResult> {
    const { flags } = await this.parse(DecomposerCompose);

    const metadataTypeToRetrieve = flags['metadata-type'];
    const dxDirectory = flags['dx-directory'];
    const metaAttributes = getAttributesForMetadataType(jsonData, metadataTypeToRetrieve);

    if (metaAttributes) {
      const metaSuffix = metaAttributes.metaSuffix;
      const directoryName = metaAttributes.directoryName;
      const xmlElement = metaAttributes.xmlElement;
      const metadataPath = `${dxDirectory}/${directoryName}`;
      this.parseMetadataFiles(metadataPath, metaSuffix, xmlElement);
    } else {
      this.log(`Metadata type ${metadataTypeToRetrieve} not found.`);
    }
    return {
      path: 'sfdx-decomposer-plugin\\src\\commands\\decomposer\\compose.ts',
    };
  }

  private parseMetadataFiles(metadataPath: string, metaSuffix: string, xmlElement: string): void {
    const processFilesInDirectory = (dirPath: string): string[] => {
      const combinedXmlContents: string[] = [];
      const files = fs.readdirSync(dirPath);

      // Sort files based on the name
      files.sort((fileA, fileB) => {
        const fullNameA = fileA.split('.')[0].toLowerCase();
        const fullNameB = fileB.split('.')[0].toLowerCase();
        return fullNameA.localeCompare(fullNameB);
      });

      files.forEach((file) => {
        const filePath = path.join(dirPath, file);

        if (fs.statSync(filePath).isFile()) {
          if (metaSuffix === 'labels' && !file.endsWith(`label-meta.xml`)) {
            return; // Skip files that don't match the expected naming convention for custom labels
          }

          const xmlContent = fs.readFileSync(filePath, 'utf-8');
          combinedXmlContents.push(xmlContent);
        } else if (fs.statSync(filePath).isDirectory()) {
          const subdirectoryContents = processFilesInDirectory(filePath);
          combinedXmlContents.push(...subdirectoryContents); // Concatenate contents from subdirectories
        }
      });

      return combinedXmlContents;
    };

    // Process labels in root metadata folder
    // Process other metadata files in subdirectories
    if (metaSuffix === 'labels') {
      const combinedXmlContents: string[] = processFilesInDirectory(metadataPath);
      const filePath = path.join(metadataPath, CUSTOM_LABELS_FILE);

      composeAndWriteFile(combinedXmlContents, filePath, xmlElement);
    } else {
      const subdirectories = fs
        .readdirSync(metadataPath)
        .map((file) => path.join(metadataPath, file))
        .filter((filePath) => fs.statSync(filePath).isDirectory());

      subdirectories.forEach((subdirectory) => {
        this.log('Processing subdirectory:', subdirectory);
        const combinedXmlContents: string[] = processFilesInDirectory(subdirectory);
        const subdirectoryBasename = path.basename(subdirectory);
        const filePath = path.join(metadataPath, `${subdirectoryBasename}.${metaSuffix}-meta.xml`);

        composeAndWriteFile(combinedXmlContents, filePath, xmlElement);
      });
    }
    this.log(`All metadata files have been composed for the metadata type: ${metaSuffix}`);
  }
}
interface Metadata {
  directoryName: string;
  metaSuffix: string;
  xmlElement: string;
}

function getAttributesForMetadataType(jsonData: Metadata[], metadataType: string): Metadata | null {
  const metadata = jsonData.find((item) => item.metaSuffix === metadataType);

  if (metadata) {
    return metadata;
  }
  return null;
}

function composeAndWriteFile(combinedXmlContents: string[], filePath: string, xmlElement: string): void {
  // Combine XML contents into a single string
  let finalXmlContent = combinedXmlContents.join('\n');

  // Remove duplicate XML declarations
  finalXmlContent = finalXmlContent.replace(/<\?xml version="1.0" encoding="UTF-8"\?>/g, '');

  // Remove duplicate parent elements
  finalXmlContent = finalXmlContent.replace(`<${xmlElement}>`, '');
  finalXmlContent = finalXmlContent.replace(`</${xmlElement}>`, '');

  // Remove extra newlines
  finalXmlContent = finalXmlContent.replace(/(\n\s*){2,}/g, `\n${INDENT}`);

  fs.writeFileSync(filePath, `${XML_HEADER}\n<${xmlElement} ${NAMESPACE}>${finalXmlContent}</${xmlElement}>`);
  console.log(`Created composed file: ${filePath}`);
}
