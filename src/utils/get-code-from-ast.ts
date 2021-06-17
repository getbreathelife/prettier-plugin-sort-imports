import { namedTypes as n } from 'ast-types';
import { NodePath } from 'ast-types/lib/node-path';

import { print, visit } from 'recast';

import { newLineCharacters, newLineNode } from '../constants';
import { SortedNode } from '../types';
import { shouldIgnoreNode } from './should-ignore-node';

export const sortImportsInPlace = (
    nodes: SortedNode<n.ImportDeclaration>[],
    code: string,
    parser: (input: string) => n.File,
) => {
    if (nodes.length < 1) return code;

    const ast = parser(code);

    const pushedBackNodes: n.Node[] = [];
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
                const tsModuleParent = n.TSModuleDeclaration.check(path.parent.node);
                if (tsModuleParent) return false;

                const { node, trailingNewLine } = nodes[sortedNodeIndex];

                // path.node.leadingComments = null;
                // if (!node.trailingComments) {
                //     path.node.trailingComments = null;
                // }
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
                return false;
            } else {
                if (sortedNodeIndex < nodes.length) {
                    pushedBackNodes.push(path.node);
                    pushedBackNodes.push(newLineNode);
                    path.prune();
                    return false;
                } else {
                    if (pushedBackNodes.length > 0) {
                        path.insertBefore([newLineNode, ...pushedBackNodes]);
                    }
                    this.abort();
                }
            }
        }
    });

    const { code: updatedCode } = print(ast);

    return (
        updatedCode.replace(
            /"PRETTIER_PLUGIN_SORT_IMPORTS_NEW_LINE";/gi,
            newLineCharacters,
        )
    );
};
