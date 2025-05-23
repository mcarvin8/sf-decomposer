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
  let result: string;

  switch (format) {
    case 'json':
      result = transformToJson(xmlContent);
      break;
    case 'yaml':
      result = transformToYaml(xmlContent);
      break;
    case 'json5':
      result = transformToJson5(xmlContent);
      break;
    case 'ini':
      result = transformToIni(xmlContent);
      break;
    case 'toml':
      result = transformToToml(xmlContent);
      break;
    default:
      result = buildXMLString(xmlContent);
      break;
  }

  return result;
}
