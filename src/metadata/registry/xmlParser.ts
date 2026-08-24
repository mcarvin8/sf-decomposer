'use strict';

export type XmlNode = {
  tagName: string;
  children: Array<XmlNode | string>;
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

function decodeNumericEntity(entity: string): string {
  const codePoint = entity[1] === 'x' ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
  return String.fromCodePoint(codePoint);
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (match, entity: string) =>
    entity.startsWith('#') ? decodeNumericEntity(entity) : (NAMED_ENTITIES[entity] ?? match),
  );
}

/**
 * Minimal recursive-descent XML parser scoped to Salesforce package.xml manifests:
 * elements, attributes (skipped -- unused by callers), text, entities, comments,
 * and the leading <?xml ?> declaration. No DTD/CDATA support since manifests don't use them.
 *
 * Implemented as flat methods (not nested closures) so each parsing concern is its own unit.
 */
class XmlCursor {
  private i = 0;
  private readonly length: number;

  constructor(private readonly xml: string) {
    this.length = xml.length;
  }

  private atEnd(): boolean {
    return this.i >= this.length;
  }

  private startsWith(token: string): boolean {
    return this.xml.startsWith(token, this.i);
  }

  private skipWhitespace(): void {
    // Stryker disable next-line ConditionalExpression, EqualityOperator -- at i===length, xml[i]
    // is undefined and /\s/.test(undefined) is false, so the loop always stops there regardless
    // of whether the bound check is `<` or `<=`.
    while (this.i < this.length && /\s/.test(this.xml[this.i])) this.i++;
  }

  private parseName(): string {
    const start = this.i;
    // Stryker disable next-line EqualityOperator -- an off-by-one bound (i<=length) only lets the
    // loop run one extra step to length+1; xml.slice clamps beyond the string end and every later
    // bound check uses >=, so the extra step is unobservable.
    while (this.i < this.length && !/[\s/>]/.test(this.xml[this.i])) this.i++;
    if (this.i === start) {
      throw new Error(`expected element name at position ${this.i}`);
    }
    return this.xml.slice(start, this.i);
  }

  private parseAttribute(): void {
    // Stryker disable next-line EqualityOperator -- same reasoning as parseName's bound check.
    while (this.i < this.length && !/[\s=/>]/.test(this.xml[this.i])) this.i++;
    this.skipWhitespace();
    if (this.xml[this.i] !== '=') {
      throw new Error(`expected "=" in attribute at position ${this.i}`);
    }
    this.i++;
    this.skipWhitespace();
    const quote = this.xml[this.i];
    if (quote !== '"' && quote !== "'") {
      throw new Error(`expected quoted attribute value at position ${this.i}`);
    }
    this.i++;
    const end = this.xml.indexOf(quote, this.i);
    if (end === -1) {
      throw new Error('unterminated attribute value');
    }
    this.i = end + 1;
  }

  private skipAttributes(): void {
    while (true) {
      this.skipWhitespace();
      if (this.atEnd()) {
        throw new Error('unexpected end of input inside a tag');
      }
      const ch = this.xml[this.i];
      if (ch === '>' || ch === '/') return;
      this.parseAttribute();
    }
  }

  private skipComment(): void {
    const end = this.xml.indexOf('-->', this.i + 4);
    if (end === -1) {
      throw new Error('unterminated comment');
    }
    this.i = end + 3;
  }

  private skipDeclaration(): void {
    const end = this.xml.indexOf('?>', this.i + 2);
    if (end === -1) {
      throw new Error('unterminated processing instruction');
    }
    this.i = end + 2;
  }

  private parseClosingTag(tagName: string): void {
    const closeEnd = this.xml.indexOf('>', this.i + 2);
    if (closeEnd === -1) {
      throw new Error(`unterminated closing tag for <${tagName}>`);
    }
    const closeName = this.xml.slice(this.i + 2, closeEnd).trim();
    if (closeName !== tagName) {
      throw new Error(`mismatched closing tag </${closeName}> for <${tagName}>`);
    }
    this.i = closeEnd + 1;
  }

  private parseTextNode(children: Array<XmlNode | string>): void {
    const nextTag = this.xml.indexOf('<', this.i);
    const textEnd = nextTag === -1 ? this.length : nextTag;
    children.push(decodeEntities(this.xml.slice(this.i, textEnd)));
    this.i = textEnd;
  }

  private parseChildren(tagName: string): Array<XmlNode | string> {
    const children: Array<XmlNode | string> = [];
    while (true) {
      if (this.atEnd()) {
        throw new Error(`unterminated element <${tagName}>`);
      }
      if (this.startsWith('<!--')) {
        this.skipComment();
        continue;
      }
      if (this.startsWith('</')) {
        this.parseClosingTag(tagName);
        return children;
      }
      if (this.xml[this.i] === '<') {
        children.push(this.parseElement());
        continue;
      }
      this.parseTextNode(children);
    }
  }

  private parseElement(): XmlNode {
    this.i++; // consume '<'
    const tagName = this.parseName();
    this.skipAttributes();

    if (this.xml[this.i] === '/') {
      this.i += 2; // consume '/>'
      return { tagName, children: [] };
    }
    this.i++; // consume '>'

    return { tagName, children: this.parseChildren(tagName) };
  }

  parseDocument(): XmlNode[] {
    const roots: XmlNode[] = [];
    while (!this.atEnd()) {
      this.skipWhitespace();
      if (this.atEnd()) break;
      if (this.startsWith('<!--')) {
        this.skipComment();
        continue;
      }
      if (this.startsWith('<?')) {
        this.skipDeclaration();
        continue;
      }
      if (this.xml[this.i] !== '<') {
        throw new Error(`unexpected content outside the root element at position ${this.i}`);
      }
      roots.push(this.parseElement());
    }
    return roots;
  }
}

export function parseXml(xml: string): XmlNode[] {
  return new XmlCursor(xml).parseDocument();
}
