/* eslint-disable */
import * as fs from 'node:fs';
import * as path from 'node:path';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { INDENT, METADATA_DIR_DEFAULT_VALUE } from '../../helpers/constants.js';
import jsonData from '../../metadata/metadata.js';
import { Metadata } from '../../metadata/metadataInterface.js';
import { getAttributesForMetadataType } from '../../service/getAttributesForMetadataType.js';
import { xml2jsParser } from '../../service/xml2jsParser.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-decomposer', 'decomposer.decompose');
const metaSuffixOptions = jsonData.map((item: Metadata) => item.metaSuffix);

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
        xml2jsParser(xmlContent, outputPath, fieldNames, xmlElement, baseName, metaSuffix, INDENT);
      }
    });
    this.log(`All metadata files have been decomposed for the metadata type: ${metaSuffix}`);
  }
}
