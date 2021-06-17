import { parse as babelParser } from '@babel/parser';
import { Options, parse, visit } from 'recast';
import { namedTypes as n } from 'ast-types';
import { NodePath } from 'ast-types/lib/node-path';

import { sortImportsInPlace } from './utils/get-code-from-ast';
import { getSortedNodes } from './utils/get-sorted-nodes';
import { getParserPlugins } from './utils/get-parser-plugins';
import { PrettierOptions } from './types';
import { shouldIgnoreNode } from './utils/should-ignore-node';


export function preprocessor(code: string, options: PrettierOptions) {
    const {
        importOrder,
        importOrderSeparation,
        parser: prettierParser,
        experimentalBabelParserPluginsList = [],
    } = options;

    const importNodes: n.ImportDeclaration[] = [];

    const parserOptions: Options = {
        parser: {
            parse(source: string) {
                return babelParser(source, {
                    sourceType: 'module',
                    plugins: [...getParserPlugins(prettierParser), ...experimentalBabelParserPluginsList],
                })
            }
        }
    };
    const parser = (input: string): n.File => parse(input, parserOptions);
    const ast = parser(code);

    visit(ast, {
        visitImportDeclaration(path: NodePath<n.ImportDeclaration>): any {
            const tsModuleParent = n.TSModuleDeclaration.check(path.parent.node);

            if (!tsModuleParent && !shouldIgnoreNode(path.node)) {
                importNodes.push(path.node);
            }
            return false;
        }
    });

    // short-circuit if there are no import declaration
    if (importNodes.length === 0) return code;

    const allImports = getSortedNodes(
        importNodes,
        importOrder,
        importOrderSeparation,
    );

    return sortImportsInPlace(allImports, code, parser);
}
