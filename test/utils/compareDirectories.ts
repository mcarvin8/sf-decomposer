'use strict';

import { strictEqual } from 'node:assert';
import { join } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';

/**
 * Normalizes XML content by sorting child elements deterministically.
 * This handles cross-platform differences in file system ordering
 * that can cause elements to appear in different orders on Windows vs Linux.
 */
function normalizeXml(xml: string): string {
  // Match the XML declaration, root opening tag, content, and root closing tag
  const rootMatch = xml.match(/^(<\?xml[^?]*\?>\s*)?(<(\w+)[^>]*>)([\s\S]*)(<\/\3>)\s*$/);
  if (!rootMatch) {
    return xml; // Not valid XML structure, return as-is
  }

  const [, declaration = '', rootOpen, , innerContent, rootClose] = rootMatch;

  // Extract individual top-level elements from inner content
  // Matches self-closing tags or open/close tag pairs
  const elementRegex = /<(\w+)(?:\s[^>]*)?>[\s\S]*?<\/\1>|<(\w+)(?:\s[^>]*)?\/>/g;
  const elements: string[] = [];
  let match;

  while ((match = elementRegex.exec(innerContent)) !== null) {
    elements.push(match[0].trim());
  }

  // Sort elements by: 1) tag name, 2) full element content (for deterministic ordering)
  elements.sort((a, b) => {
    const tagA = a.match(/^<(\w+)/)?.[1] ?? '';
    const tagB = b.match(/^<(\w+)/)?.[1] ?? '';
    if (tagA !== tagB) {
      return tagA.localeCompare(tagB);
    }
    return a.localeCompare(b);
  });

  // Reconstruct the XML with sorted elements
  const indent = '    ';
  const sortedContent = elements.map((el) => indent + el).join('\n');
  return `${declaration}${rootOpen}\n${sortedContent}\n${rootClose}`;
}

export async function compareDirectories(referenceDir: string, mockDir: string): Promise<void> {
  const entriesinRef = await readdir(referenceDir, { withFileTypes: true });
  const promises = [];

  // Only compare files that are in the reference directory (composed files)
  // Ignore files only found in the mock directory (decomposed files)
  for (const entry of entriesinRef) {
    const refEntryPath = join(referenceDir, entry.name);
    const mockPath = join(mockDir, entry.name);

    if (entry.isDirectory()) {
      promises.push(compareDirectories(refEntryPath, mockPath)); // Recursive call
    } else {
      promises.push(
        (async () => {
          let refContent = await readFile(refEntryPath, 'utf-8');
          let mockContent = await readFile(mockPath, 'utf-8');

          // Normalize XML files to handle cross-platform element ordering differences
          if (entry.name.endsWith('.xml')) {
            refContent = normalizeXml(refContent);
            mockContent = normalizeXml(mockContent);
          }

          strictEqual(refContent, mockContent, `File content is different for ${entry.name}`);
        })()
      );
    }
  }

  // Wait for all promises to finish
  await Promise.all(promises);
}
