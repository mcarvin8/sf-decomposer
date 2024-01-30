'use strict';

export interface XmlElement {
  [key: string]: string | XmlElement | string[] | XmlElement[];
}
