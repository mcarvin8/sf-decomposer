'use strict';

import { describe, expect, it } from 'vitest';

import { parseXml } from '../../src/metadata/registry/xmlParser.js';

// Ported from mcarvin8/sf-package-combiner's xmlParser.test.ts (same author/license) --
// src/metadata/registry/xmlParser.ts is a verbatim port of that repo's parser.

describe('parseXml', () => {
  it('parses a simple element with text content', () => {
    const roots = parseXml('<Package><version>60.0</version></Package>');
    expect(roots).toEqual([
      {
        tagName: 'Package',
        children: [{ tagName: 'version', children: ['60.0'] }],
      },
    ]);
  });

  it('skips the leading xml declaration', () => {
    const roots = parseXml('<?xml version="1.0" encoding="UTF-8"?>\n<Package></Package>');
    expect(roots).toEqual([{ tagName: 'Package', children: [] }]);
  });

  it('skips attributes, including namespaces', () => {
    const roots = parseXml('<Package xmlns="http://soap.sforce.com/2006/04/metadata"></Package>');
    expect(roots).toEqual([{ tagName: 'Package', children: [] }]);
  });

  it('skips a comment before the root element', () => {
    const roots = parseXml('<!-- leading comment --><Package></Package>');
    expect(roots).toEqual([{ tagName: 'Package', children: [] }]);
  });

  it('skips comments', () => {
    const roots = parseXml('<Package><!-- a comment --><version>60.0</version></Package>');
    expect(roots).toEqual([
      {
        tagName: 'Package',
        children: [{ tagName: 'version', children: ['60.0'] }],
      },
    ]);
  });

  it('decodes named and numeric entities in text', () => {
    const roots = parseXml('<members>A &amp; B &#65; &#x42;</members>');
    expect(roots).toEqual([{ tagName: 'members', children: ['A & B A B'] }]);
  });

  it('leaves unknown entities untouched', () => {
    const roots = parseXml('<members>A &foo; B</members>');
    expect(roots).toEqual([{ tagName: 'members', children: ['A &foo; B'] }]);
  });

  it('parses self-closing elements', () => {
    const roots = parseXml('<Package><version/></Package>');
    expect(roots).toEqual([
      {
        tagName: 'Package',
        children: [{ tagName: 'version', children: [] }],
      },
    ]);
  });

  it('parses multiple sibling root elements', () => {
    const roots = parseXml('<Package></Package><Package></Package>');
    expect(roots).toHaveLength(2);
  });

  it('parses nested elements with multiple children', () => {
    const roots = parseXml(`<Package>
  <types>
    <members>A</members>
    <members>B</members>
    <name>ApexClass</name>
  </types>
</Package>`);
    const [pkg] = roots;
    const types = pkg.children.find((c) => typeof c !== 'string');
    expect(types).toBeDefined();
    expect((types as { tagName: string }).tagName).toBe('types');
  });

  it('throws on a mismatched closing tag', () => {
    expect(() => parseXml('<Package><types></wrong></Package>')).toThrow(/mismatched closing tag/);
  });

  it('throws on an unterminated element', () => {
    expect(() => parseXml('<Package><types>')).toThrow(/unterminated element/);
  });

  it('throws on an unterminated element with trailing text and no closing tag', () => {
    expect(() => parseXml('<Package>trailing text')).toThrow(/unterminated element/);
  });

  it('throws on content outside the root element', () => {
    expect(() => parseXml('text<Package></Package>')).toThrow(/unexpected content outside the root element/);
  });

  it('throws on an unterminated comment', () => {
    expect(() => parseXml('<Package><!-- oops</Package>')).toThrow(/unterminated comment/);
  });

  it('throws on an unterminated processing instruction', () => {
    expect(() => parseXml('<?xml version="1.0"')).toThrow(/unterminated processing instruction/);
  });

  it('throws on an unterminated closing tag', () => {
    expect(() => parseXml('<Package></Package')).toThrow(/unterminated closing tag/);
  });

  it('throws on a missing attribute value', () => {
    expect(() => parseXml('<Package xmlns=></Package>')).toThrow(/expected quoted attribute value/);
  });

  it('throws on an unterminated attribute value', () => {
    expect(() => parseXml('<Package xmlns="unterminated></Package>')).toThrow(/unterminated attribute value/);
  });

  it('throws on a missing equals sign in an attribute', () => {
    expect(() => parseXml('<Package xmlns "x"></Package>')).toThrow(/expected "=" in attribute/);
  });

  it('throws on unexpected end of input inside a tag', () => {
    expect(() => parseXml('<Package xmlns="x"')).toThrow(/unexpected end of input inside a tag/);
  });

  it('throws on a missing element name', () => {
    expect(() => parseXml('<>')).toThrow(/expected element name/);
  });

  it('throws when a tag name runs to the end of input with no closing bracket', () => {
    expect(() => parseXml('<foo')).toThrow(/unexpected end of input inside a tag/);
  });

  it('throws when an attribute name runs to the end of input with no "="', () => {
    expect(() => parseXml('<Package xmlns')).toThrow(/expected "=" in attribute/);
  });

  it('skips whitespace around "=" in an attribute', () => {
    const roots = parseXml('<Package xmlns = "http://soap.sforce.com/2006/04/metadata" ></Package>');
    expect(roots).toEqual([{ tagName: 'Package', children: [] }]);
  });

  it('parses a single-quoted attribute value', () => {
    const roots = parseXml("<Package xmlns='http://soap.sforce.com/2006/04/metadata'></Package>");
    expect(roots).toEqual([{ tagName: 'Package', children: [] }]);
  });

  it('does not mistake a "-->" sequence inside a preceding comment for the next one\'s closing', () => {
    const roots = parseXml('<Package><!--x--><!--y--><version>1</version></Package>');
    expect(roots).toEqual([
      {
        tagName: 'Package',
        children: [{ tagName: 'version', children: ['1'] }],
      },
    ]);
  });

  it('does not mistake a "?>" sequence inside a preceding declaration for the next one\'s closing', () => {
    const roots = parseXml('<?xml version="1.0"?><?xml version="1.0"?><Package></Package>');
    expect(roots).toEqual([{ tagName: 'Package', children: [] }]);
  });

  it('trims whitespace inside a closing tag', () => {
    const roots = parseXml('<Package></Package >');
    expect(roots).toEqual([{ tagName: 'Package', children: [] }]);
  });

  it('decodes the &apos; entity', () => {
    const roots = parseXml('<members>It&apos;s</members>');
    expect(roots).toEqual([{ tagName: 'members', children: ["It's"] }]);
  });

  it('decodes the &lt;, &gt;, and &quot; entities', () => {
    const roots = parseXml('<members>&lt;a&gt; says &quot;hi&quot;</members>');
    expect(roots).toEqual([{ tagName: 'members', children: ['<a> says "hi"'] }]);
  });
});
