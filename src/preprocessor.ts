import { parse as babelParse } from '@babel/parser';
import { Options, parse, visit } from 'recast';
import { namedTypes as n } from 'ast-types';
import { NodePath } from 'ast-types/lib/node-path';

import { sortImports } from './utils/get-code-from-ast';
import { getSortedNodes } from './utils/get-sorted-nodes';
import { getParserPlugins } from './utils/get-parser-plugins';
import { PrettierOptions } from './types';
import { shouldIgnoreNode } from './utils/should-ignore-node';
import { shieldSpecialLineInComment } from './utils/shield-special-line-in-comment';

export function preprocessor(code: string, options: PrettierOptions) {
    const {
        importOrder,
        parser: prettierParser,
        experimentalBabelParserPluginsList = [],
    } = options;

    const importNodes: n.ImportDeclaration[] = [];

    const parserOptions: Options = {
        parser: {
            parse(source: string) {
                return babelParse(source, {
                    sourceType: 'module',
                    tokens: true,
                    plugins: [...getParserPlugins(prettierParser), ...experimentalBabelParserPluginsList],
                })
            }
        },
        tabWidth: options.tabWidth,
        useTabs: options.useTabs,
        lineTerminator: require("os").EOL || "\n",
    };
    const parser = (input: string): n.File => parse(input, parserOptions);

    const lineTerminator = parserOptions.lineTerminator || '\n';
    const processedCode = code.split(lineTerminator).map(shieldSpecialLineInComment).join(lineTerminator);

    const ast = parser(processedCode);

    visit(ast, {
        visitImportDeclaration(path: NodePath<n.ImportDeclaration>): any {
            const tsModuleParent = n.TSModuleBlock.check(path.parentPath.node);

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
    );

    return sortImports(allImports, code, parserOptions);
}
