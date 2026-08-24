'use strict';

import { describe, expect, it } from 'vitest';

import { parseManifestXml } from '../../src/metadata/registry/manifestXml.js';

// Adapted from mcarvin8/sf-package-combiner's parseManifest.test.ts (same author/license).
// Unlike that repo's parser, this one doesn't return the <version> text (no caller here needs
// it) -- it still validates <version> structurally, since a malformed manifest should still fail
// loudly.

const xmlns = 'http://soap.sforce.com/2006/04/metadata';

describe('parseManifestXml', () => {
  it('parses types, members, and ignores version content', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="${xmlns}">
  <types>
    <members>MyApexClass</members>
    <name>ApexClass</name>
  </types>
  <version>60.0</version>
</Package>`;

    expect(parseManifestXml(xml)).toEqual({
      types: [{ name: 'ApexClass', members: ['MyApexClass'] }],
    });
  });

  it('parses multiple members within a single types block', () => {
    const xml = `<Package xmlns="${xmlns}">
  <types>
    <members>A</members>
    <members>B</members>
    <name>ApexClass</name>
  </types>
</Package>`;

    expect(parseManifestXml(xml)).toEqual({
      types: [{ name: 'ApexClass', members: ['A', 'B'] }],
    });
  });

  it('parses multiple types blocks', () => {
    const xml = `<Package xmlns="${xmlns}">
  <types>
    <members>A</members>
    <name>ApexClass</name>
  </types>
  <types>
    <members>B</members>
    <name>ApexTrigger</name>
  </types>
</Package>`;

    expect(parseManifestXml(xml).types).toEqual([
      { name: 'ApexClass', members: ['A'] },
      { name: 'ApexTrigger', members: ['B'] },
    ]);
  });

  it('returns no types for an empty <Package>', () => {
    const xml = `<Package xmlns="${xmlns}"></Package>`;
    expect(parseManifestXml(xml)).toEqual({ types: [] });
  });

  it('does not validate metadata type names against the Salesforce registry', () => {
    const xml = `<Package xmlns="${xmlns}">
  <types>
    <members>Account.Rating__c</members>
    <name>NotARealMetadataType</name>
  </types>
</Package>`;

    expect(parseManifestXml(xml)).toEqual({
      types: [{ name: 'NotARealMetadataType', members: ['Account.Rating__c'] }],
    });
  });

  it('treats type names as case-sensitive literals (no registry casing normalization)', () => {
    const xml = `<Package xmlns="${xmlns}">
  <types>
    <members>A</members>
    <name>apexclass</name>
  </types>
  <types>
    <members>B</members>
    <name>ApexClass</name>
  </types>
</Package>`;

    expect(parseManifestXml(xml).types).toEqual([
      { name: 'apexclass', members: ['A'] },
      { name: 'ApexClass', members: ['B'] },
    ]);
  });

  it('decodes XML entities in member names', () => {
    const xml = `<Package xmlns="${xmlns}">
  <types>
    <members>A &amp; B</members>
    <name>ApexClass</name>
  </types>
</Package>`;

    expect(parseManifestXml(xml).types).toEqual([{ name: 'ApexClass', members: ['A & B'] }]);
  });

  it('trims leading and trailing whitespace inside a text element', () => {
    const xml = `<Package xmlns="${xmlns}">
  <types>
    <members>A</members>
    <name>  ApexClass  </name>
  </types>
</Package>`;

    expect(parseManifestXml(xml).types).toEqual([{ name: 'ApexClass', members: ['A'] }]);
  });

  it('joins text split across a nested element and ignores that element (getText)', () => {
    const xml = `<Package xmlns="${xmlns}">
  <types>
    <members>A</members>
    <name>Apex<x/>Class</name>
  </types>
</Package>`;

    expect(parseManifestXml(xml).types).toEqual([{ name: 'ApexClass', members: ['A'] }]);
  });

  it('parses dot-notation custom field members and decodes ampersands', () => {
    const xml = `<Package xmlns="${xmlns}">
  <types>
    <members>Account.Rating__c</members>
    <members>Account.Sales_Region__c</members>
    <name>CustomField</name>
  </types>
  <types>
    <members>Sales &amp; Marketing</members>
    <name>Group</name>
  </types>
</Package>`;

    expect(parseManifestXml(xml).types).toEqual([
      { name: 'CustomField', members: ['Account.Rating__c', 'Account.Sales_Region__c'] },
      { name: 'Group', members: ['Sales & Marketing'] },
    ]);
  });

  it('throws when the root element is not <Package>', () => {
    const xml = `<NotAPackage></NotAPackage>`;
    expect(() => parseManifestXml(xml)).toThrow(/single <Package> root element/);
  });

  it('throws when there is more than one root element', () => {
    const xml = `<Package></Package><Package></Package>`;
    expect(() => parseManifestXml(xml)).toThrow(/single <Package> root element/);
  });

  it('throws on an unexpected element directly inside <Package>', () => {
    const xml = `<Package>
  <type>
    <members>A</members>
    <name>ApexClass</name>
  </type>
</Package>`;
    expect(() => parseManifestXml(xml)).toThrow(/unexpected element <type> inside <Package>/);
  });

  it('throws when <Package> contains more than one <version>', () => {
    const xml = `<Package><version>57.0</version><version>59.0</version></Package>`;
    expect(() => parseManifestXml(xml)).toThrow(/more than one <version>/);
  });

  it('throws when <version> is empty', () => {
    const xml = `<Package><version></version></Package>`;
    expect(() => parseManifestXml(xml)).toThrow(/<version> element must not be empty/);
  });

  it('throws when <types> has no <name>', () => {
    const xml = `<Package><types><members>A</members></types></Package>`;
    expect(() => parseManifestXml(xml)).toThrow(/exactly one <name> element, found 0/);
  });

  it('throws when <types> has more than one <name>', () => {
    const xml = `<Package><types><members>A</members><name>ApexClass</name><name>ApexTrigger</name></types></Package>`;
    expect(() => parseManifestXml(xml)).toThrow(/exactly one <name> element, found 2/);
  });

  it('throws when <types><name> is empty', () => {
    const xml = `<Package><types><members>A</members><name></name></types></Package>`;
    expect(() => parseManifestXml(xml)).toThrow(/<name> element must not be empty/);
  });

  it('throws when <types> has no <members>', () => {
    const xml = `<Package><types><name>ApexClass</name></types></Package>`;
    expect(() => parseManifestXml(xml)).toThrow(/must contain at least one <members> element/);
  });

  it('throws when a <members> element is empty', () => {
    const xml = `<Package><types><members>A</members><members></members><name>ApexClass</name></types></Package>`;
    expect(() => parseManifestXml(xml)).toThrow(/contains an empty <members> element/);
  });

  it('throws on an unexpected element inside <types>', () => {
    const xml = `<Package><types><members>A</members><name>ApexClass</name><extra>x</extra></types></Package>`;
    expect(() => parseManifestXml(xml)).toThrow(/unexpected element <extra> inside <types>/);
  });

  it('ignores comments and whitespace-only text', () => {
    const xml = `<Package xmlns="${xmlns}">
  <!-- a comment -->
  <types>
    <members>A</members>
    <name>ApexClass</name>
  </types>
</Package>`;
    expect(parseManifestXml(xml).types).toEqual([{ name: 'ApexClass', members: ['A'] }]);
  });
});
