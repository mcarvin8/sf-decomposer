'use strict';
/* eslint-disable no-await-in-loop */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { ReassembleXMLFileHandler, setLogLevel } from 'xml-disassembler';

import { reassembleLabels } from './reassembleLabels.js';
import { renameBotVersionFile } from './renameBotVersionFiles.js';
import { reassembleLoyaltyProgramSetup } from './resssembleLoyaltyProgramSetup.js';

export async function recomposeFileHandler(
  metaAttributes: {
    metaSuffix: string;
    strictDirectoryName: boolean;
    folderType: string;
    metadataPaths: string[];
  },
  postpurge: boolean,
  debug: boolean
): Promise<void> {
  const { metaSuffix, strictDirectoryName, folderType, metadataPaths } = metaAttributes;
  if (debug) setLogLevel('debug');
  for (const metadataPath of metadataPaths) {
    if (metaSuffix === 'labels') {
      await reassembleLabels(metadataPath, metaSuffix, postpurge);
    } else if (metaSuffix === 'loyaltyProgramSetup') {
      await reassembleLoyaltyProgramSetup(metadataPath);
    } else {
      let recurse: boolean = false;
      if (strictDirectoryName || folderType) recurse = true;
      await reassembleDirectories(metadataPath, metaSuffix, recurse, postpurge);
    }

    if (metaSuffix === 'bot') await renameBotVersionFile(metadataPath);
  }
}

export async function reassembleHandler(filePath: string, fileExtension: string, postPurge: boolean): Promise<void> {
  const handler: ReassembleXMLFileHandler = new ReassembleXMLFileHandler();
  await handler.reassemble({
    filePath,
    fileExtension,
    postPurge,
  });
}

async function reassembleDirectories(
  metadataPath: string,
  metaSuffix: string,
  recurse: boolean,
  postpurge: boolean
): Promise<void> {
  const subdirectories = (await readdir(metadataPath)).map((file) => join(metadataPath, file));
  for (const subdirectory of subdirectories) {
    const subDirStat = await stat(subdirectory);
    if (subDirStat.isDirectory() && recurse) {
      // recursively call this function and set recurse to false
      await reassembleDirectories(subdirectory, metaSuffix, false, postpurge);
    } else if (subDirStat.isDirectory()) {
      await reassembleHandler(subdirectory, `${metaSuffix}-meta.xml`, postpurge);
    }
  }
}
