import { Node } from '@babel/core';
import generate from '@babel/generator';
import traverse, { NodePath } from '@babel/traverse';
import {
    File,
    ImportDeclaration,
    isImportDeclaration,
    isProgram,
    isTSModuleDeclaration,
} from '@babel/types';

import { newLineCharacters, newLineNode } from '../constants';
import { SortedNode } from '../types';

export const sortImportsInPlace = (
    nodes: SortedNode<ImportDeclaration>[],
    code: string,
    parser: (input: string) => File,
) => {
    if (nodes.length < 1) return code;

    // Remove everything after the import blocks
    const endIndex = nodes
        .map((sn) => sn.node.end as number)
        .reduce((prev, curr) => (curr > prev ? curr : prev), 0);

    const parsedCode = code.slice(0, endIndex);
    const restOfCode = code.slice(endIndex);

    const ast = parser(parsedCode);

    const pushedBackNodes: Node[] = [];
    let sortedNodeIndex = 0;
    traverse(ast, {
        enter(path: NodePath) {
            if (isProgram(path.node)) return;

            if (isImportDeclaration(path.node)) {
                const tsModuleParent = path.findParent((p) =>
                    isTSModuleDeclaration(p),
                );
                if (tsModuleParent) return;

                const { node, trailingNewLine } = nodes[sortedNodeIndex];

                path.node.leadingComments = null;
                if (!node.trailingComments) {
                    path.node.trailingComments = null;
                }
                path.replaceWith(node);

                if (trailingNewLine || sortedNodeIndex >= nodes.length - 1) {
                    path.insertAfter(newLineNode);
                }

                sortedNodeIndex++;
                path.skip();
            } else {
                if (sortedNodeIndex < nodes.length) {
                    if (!shouldIgnoreNode(path.node)) {
                        pushedBackNodes.push(path.node);
                        pushedBackNodes.push(newLineNode);
                        path.remove();
                    }
                } else {
                    if (pushedBackNodes.length > 0) {
                        path.insertBefore([newLineNode, ...pushedBackNodes]);
                    }
                    path.stop();
                }
            }
        },
    });

    const { code: updatedCode } = generate(ast);

    return (
        updatedCode.replace(
            /"PRETTIER_PLUGIN_SORT_IMPORTS_NEW_LINE";/gi,
            newLineCharacters,
        ) + restOfCode
    );
};

export const shouldIgnoreNode = (node: Node): boolean => {
    const { leadingComments } = node;
    if (!leadingComments) return false;

    const lastComment = leadingComments[leadingComments.length - 1];
    return (
        lastComment.type === 'CommentLine' &&
        lastComment.value === 'prettier-ignore'
    );
};
