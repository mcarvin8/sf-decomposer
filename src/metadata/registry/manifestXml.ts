'use strict';

// Ported from mcarvin8/sf-package-combiner (same author/license): the syntactic layer that turns
// package.xml text into { name, members } pairs. Registry-aware resolution (parent/child/folder
// types) is layered on top in resolveManifestComponents.ts, mirroring how SDR's ManifestResolver
// separates manifest parsing from registry lookups.

import { parseXml, XmlNode } from './xmlParser.js';

export type ParsedManifestType = {
  name: string;
  members: string[];
};

export type ParsedManifest = {
  types: ParsedManifestType[];
};

function isElement(node: XmlNode | string): node is XmlNode {
  return typeof node !== 'string';
}

function getText(node: XmlNode): string {
  return node.children
    .filter((child): child is string => typeof child === 'string')
    .join('')
    .trim();
}

function parseTypesElement(typesEl: XmlNode): ParsedManifestType {
  const children = typesEl.children.filter(isElement);
  const nameEls = children.filter((el) => el.tagName === 'name');
  const memberEls = children.filter((el) => el.tagName === 'members');
  const otherEl = children.find((el) => el.tagName !== 'name' && el.tagName !== 'members');

  if (otherEl) {
    throw new Error(`unexpected element <${otherEl.tagName}> inside <types>`);
  }
  if (nameEls.length !== 1) {
    throw new Error(`<types> must contain exactly one <name> element, found ${nameEls.length}`);
  }

  const name = getText(nameEls[0]);
  if (!name) {
    throw new Error('<types><name> element must not be empty');
  }
  if (memberEls.length === 0) {
    throw new Error(`<types> for "${name}" must contain at least one <members> element`);
  }

  const members = memberEls.map((memberEl) => {
    const member = getText(memberEl);
    if (!member) {
      throw new Error(`<types> for "${name}" contains an empty <members> element`);
    }
    return member;
  });

  return { name, members };
}

/**
 * Parses a package.xml manifest's raw text into its declared types/members. Validates only that
 * the document follows the Metadata API manifest structure (a single <Package> root containing
 * <types>/<version> elements) -- metadata type names are not checked against the registry here.
 */
export function parseManifestXml(xml: string): ParsedManifest {
  const roots = parseXml(xml);

  if (roots.length !== 1 || roots[0].tagName !== 'Package') {
    throw new Error('manifest must have a single <Package> root element');
  }

  const types: ParsedManifestType[] = [];
  let versionSeen = false;

  for (const child of roots[0].children.filter(isElement)) {
    if (child.tagName === 'types') {
      types.push(parseTypesElement(child));
    } else if (child.tagName === 'version') {
      if (versionSeen) {
        throw new Error('<Package> must not contain more than one <version> element');
      }
      versionSeen = true;
      if (!getText(child)) {
        throw new Error('<Package><version> element must not be empty');
      }
    } else {
      throw new Error(`unexpected element <${child.tagName}> inside <Package>`);
    }
  }

  return { types };
}
