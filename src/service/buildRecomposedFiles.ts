'use strict';

import * as fs from 'node:fs/promises';
import { Logger } from '@salesforce/core';
import { XML_HEADER, NAMESPACE, INDENT } from '../helpers/constants.js';

export async function buildRecomposedFile(
  combinedXmlContents: string[],
  filePath: string,
  xmlElement: string,
  log: Logger
): Promise<void> {
  // Combine XML contents into a single string
  let finalXmlContent = combinedXmlContents.join('\n');

  // Remove duplicate XML declarations
  finalXmlContent = finalXmlContent.replace(/<\?xml version="1.0" encoding="UTF-8"\?>/g, '');

  // Remove duplicate parent elements
  finalXmlContent = finalXmlContent.replace(`<${xmlElement}>`, '');
  finalXmlContent = finalXmlContent.replace(`</${xmlElement}>`, '');

  // Remove extra indentation within CDATA sections
  finalXmlContent = finalXmlContent.replace(
    /<!\[CDATA\[\s*([\s\S]*?)\s*]]>/g,
    (match: string, cdataContent: string) => {
      const trimmedContent = cdataContent.trim();
      const lines = trimmedContent.split('\n');
      const indentedLines = lines.map((line) => line.replace(/^\s*/, ''));
      return `<![CDATA[\n${INDENT}${indentedLines.join(`\n${INDENT}`)}\n]]>`;
    }
  );

  // Remove extra newlines
  finalXmlContent = finalXmlContent.replace(/(\n\s*){2,}/g, `\n${INDENT}`);

  await fs.writeFile(filePath, `${XML_HEADER}\n<${xmlElement} ${NAMESPACE}>${finalXmlContent}</${xmlElement}>`);
  log.debug(`Created recomposed file: ${filePath}`);
}
