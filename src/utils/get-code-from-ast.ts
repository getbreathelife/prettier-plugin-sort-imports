import { namedTypes as n } from 'ast-types';
import { NodePath } from 'ast-types/lib/node-path';
import { Options, parse, print, visit } from 'recast';

import { newLineCharacters, newLineNode } from '../constants';
import { SortedNode } from '../types';
import { shouldIgnoreNode } from './should-ignore-node';

export const sortImports = (
    nodes: SortedNode<n.ImportDeclaration>[],
    code: string,
    parserOptions: Options,
) => {
    if (nodes.length < 1) return code;

    const maxParsedLine = nodes.map(sn => sn.node.loc?.end.line).filter(line => !!line).reduce((max: number, curr?: number) => {
        if (!curr || max > curr) return max;
        return curr;
    }, 0);

    const lineTerminator = parserOptions.lineTerminator || '\n';
    const codeArr = code.split(lineTerminator);
    const parsedCode = codeArr.slice(0, maxParsedLine).join(lineTerminator);
    const restOfCode = codeArr.slice(maxParsedLine).join(lineTerminator);

    const parser = (input: string): n.File => parse(input, parserOptions);
    const ast = parser(parsedCode);

    const pushedBackNodes: (n.Node | string)[] = [];
    let hasIgnoredNodes = false;
    let sortedNodeIndex = 0;
    visit(ast.program, {
        visitNode(path: NodePath<n.Node>): any {
            if (n.File.check(path.value) || n.Program.check(path.node)) {
                this.traverse(path);
            }

            if (shouldIgnoreNode(path.node)) {
                hasIgnoredNodes = true;
                return false;
            }

            if (n.ImportDeclaration.check(path.node)) {
                const tsModuleParent = n.TSModuleBlock.check(path.parentPath.node);
                if (tsModuleParent) return false;

                const { node, trailingNewLine } = nodes[sortedNodeIndex];

                path.replace(node);

                if (trailingNewLine || sortedNodeIndex >= nodes.length - 1) {
                    path.insertAfter(newLineNode);
                }

                if (hasIgnoredNodes) {
                    hasIgnoredNodes = false;
                    if (nodes[sortedNodeIndex - 1].trailingNewLine) {
                        path.insertBefore(newLineNode);
                    }
                }

                sortedNodeIndex++;

                if (sortedNodeIndex >= nodes.length && pushedBackNodes.length > 0) {
                    path.insertAfter(newLineNode, ...pushedBackNodes);
                }

                return false;
            } else {
                if (sortedNodeIndex < nodes.length) {
                    pushedBackNodes.push(path.node);
                    pushedBackNodes.push(newLineNode);
                    path.prune();
                    return false;
                } else {
                    this.abort();
                }
            }
        }
    });

    const { code: updatedCode } = print(ast, parserOptions);

    return (
        updatedCode.replace(
            /PRETTIER_PLUGIN_SORT_IMPORTS_NEW_LINE/gi,
            newLineCharacters,
        ) + restOfCode
    );
};
