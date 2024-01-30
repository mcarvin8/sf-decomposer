/* eslint-disable */

import { XMLBuilder } from 'fast-xml-parser';
import { INDENT } from '../helpers/constants.js';
import { XML_PARSER_OPTION } from '../types/xmlParserOptions.js';

export function printChildElements(element: any, indentLevel: number = 2): string {
  const JSON_PARSER_OPTION = {
    ...XML_PARSER_OPTION,
    format: true,
    indentBy: INDENT,
    suppressBooleanAttributes: false,
    suppressEmptyNode: false,
  };

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
