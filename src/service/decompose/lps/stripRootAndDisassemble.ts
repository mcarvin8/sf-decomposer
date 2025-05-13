import { writeFile } from 'node:fs/promises';
import { parseXML, buildXMLString, DisassembleXMLFileHandler, XmlElement } from 'xml-disassembler';

export async function stripRootAndDisassemble(
  fullPath: string,
  handler: DisassembleXMLFileHandler,
  format: string
): Promise<void> {
  const parsed = await parseXML(fullPath);
  const contents = parsed?.LoyaltyProgramSetup;

  if (!contents) return;

  // Remove the root and build XML with just the inner nodes (programProcesses)
  const stripped: XmlElement = {
    '?xml': {
      '@_version': '1.0',
      '@_encoding': 'UTF-8',
    },
  };

  for (const [key, value] of Object.entries(contents)) {
    stripped[key] = value;
  }

  const newXml = buildXMLString(stripped);
  await writeFile(fullPath, newXml, 'utf-8');

  await handler.disassemble({
    filePath: fullPath,
    format,
    strategy: 'unique-id',
    prePurge: false,
    postPurge: true,
    uniqueIdElements: 'parameterName,ruleName',
  });
}
