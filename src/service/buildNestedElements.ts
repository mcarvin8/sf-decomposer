/* eslint-disable */

import { XMLBuilder } from 'fast-xml-parser';
import { INDENT } from '../helpers/constants.js';
import { XmlElement, JSON_PARSER_OPTION } from './types.js';

export function buildNestedElements(element: XmlElement, indentLevel: number = 2): string {
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
