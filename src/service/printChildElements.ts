/* eslint-disable */

import { XMLBuilder } from 'fast-xml-parser';
import { XmlElement } from '../types/xmlElement.js';
import { INDENT } from '../helpers/constants.js';
import { JSON_PARSER_OPTION } from '../types/jsonParserOptions.js';

export function printChildElements(element: XmlElement, indentLevel: number = 2): string {
  const xmlBuilder = new XMLBuilder(JSON_PARSER_OPTION);
  const xmlString = xmlBuilder.build(element);

  // Manually format the XML string with the desired indentation
  const formattedXml = xmlString
    .split('\n')
    .map((line: string) => `${' '.repeat(indentLevel * INDENT.length)}${line}`)
    .join('\n')
    .trimEnd();

  return formattedXml;
}
