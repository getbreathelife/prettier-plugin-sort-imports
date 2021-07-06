import { ParserPlugin } from '@babel/parser';

export const flow: ParserPlugin = 'flow';
export const typescript: ParserPlugin = 'typescript';
export const decoratorsLegacy: ParserPlugin = 'decorators-legacy';
export const classProperties: ParserPlugin = 'classProperties';
export const jsx: ParserPlugin = 'jsx';

export const newLineCharacters = '\n\n';
export const newLineNode = 'PRETTIER_PLUGIN_SORT_IMPORTS_NEW_LINE';

export const commentShield = '//PRETTIER_PLUGIN_SORT_IMPORTS_DUMMY_COMMENT '
