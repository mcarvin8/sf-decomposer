import { rm } from 'node:fs/promises';
import { transformToJson, transformToJson5, transformToToml, transformToYaml, transformToIni } from 'xml-disassembler';

export async function transformAndCleanup(filePath: string, format: string): Promise<void> {
  switch (format) {
    case 'json':
      await transformToJson(filePath);
      break;
    case 'yaml':
      await transformToYaml(filePath);
      break;
    case 'json5':
      await transformToJson5(filePath);
      break;
    case 'ini':
      await transformToIni(filePath);
      break;
    case 'toml':
      await transformToToml(filePath);
      break;
    default:
      return; // Skip if 'xml' or unknown
  }
  await rm(filePath, { force: true });
}
