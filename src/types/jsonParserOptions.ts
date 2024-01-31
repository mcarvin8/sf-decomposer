'use strict';

import { INDENT } from '../helpers/constants.js';
import { XML_PARSER_OPTION } from './xmlParserOptions.js';

export const JSON_PARSER_OPTION = {
  ...XML_PARSER_OPTION,
  format: true,
  indentBy: INDENT,
  suppressBooleanAttributes: false,
  suppressEmptyNode: false,
};
