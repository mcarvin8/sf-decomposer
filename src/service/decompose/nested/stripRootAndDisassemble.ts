import { writeFile } from 'node:fs/promises';
import { parseXML, buildXMLString, DisassembleXMLFileHandler, XmlElement } from 'xml-disassembler';
import { XML_DECLARATION } from '../../../helpers/constants.js';

export async function stripRootAndDisassemble(
  fullPath: string,
  handler: DisassembleXMLFileHandler,
  format: string
): Promise<void> {
  const parsed = await parseXML(fullPath);
  const contents = parsed?.LoyaltyProgramSetup;

  if (!contents) return;

  // Remove the root and build XML with just the inner nodes (programProcesses)
  const stripped: XmlElement = {};

  for (const [key, value] of Object.entries(contents)) {
    stripped[key] = value;
  }

  const newXml = buildXMLString(stripped, 0);
  await writeFile(fullPath, `${XML_DECLARATION}\n${newXml}`, 'utf-8');

  await handler.disassemble({
    filePath: fullPath,
    format,
    strategy: 'unique-id',
    prePurge: false,
    postPurge: true,
    uniqueIdElements: 'parameterName,ruleName',
  });
}
