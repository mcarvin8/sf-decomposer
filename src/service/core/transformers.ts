import {
  transformToJson,
  transformToJson5,
  transformToToml,
  transformToYaml,
  transformToIni,
  XmlElement,
  buildXMLString,
} from 'xml-disassembler';

export async function transformAndCleanup(xmlContent: XmlElement, format: string): Promise<string> {
  switch (format) {
    case 'json':
      return transformToJson(xmlContent);
    case 'yaml':
      return transformToYaml(xmlContent);
    case 'json5':
      return transformToJson5(xmlContent);
    case 'ini':
      return transformToIni(xmlContent);
    case 'toml':
      return transformToToml(xmlContent);
    default:
      return buildXMLString(xmlContent);
  }
}
