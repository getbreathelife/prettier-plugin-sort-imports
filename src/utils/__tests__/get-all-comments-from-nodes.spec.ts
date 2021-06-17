import { namedTypes as n } from 'ast-types';
import { NodePath } from 'ast-types/lib/node-path';
import { parse, visit } from 'recast';

import { getAllCommentsFromNodes } from '../get-all-comments-from-nodes';
import { getSortedNodes } from '../get-sorted-nodes';
import { shouldIgnoreNode } from '../should-ignore-node';


const getSortedImportNodes = (code: string) => {
    const importNodes: n.ImportDeclaration[] = [];
    const ast = parse(code, {
        parser: require("recast/parsers/typescript")
    });

    visit(ast, {
        visitImportDeclaration(path: NodePath<n.ImportDeclaration>): any {
            const tsModuleParent = n.TSModuleBlock.check(path.parentPath.node);

            if (!tsModuleParent && !shouldIgnoreNode(path.node)) {
                importNodes.push(path.node);
            }
            return false;
        }
    });

    return getSortedNodes(importNodes, [], false);
};

const getComments = (commentNodes: (n.CommentBlock | n.CommentLine)[]) =>
    commentNodes.map((node) => node.value);

test('it returns empty array when there is no comment', () => {
    const result = getSortedImportNodes(`import z from 'z';
    `);
    const commentNodes = getAllCommentsFromNodes(result);
    const comments = getComments(commentNodes);
    expect(comments).toEqual([]);
});

test('it returns single comment of a node', () => {
    const result = getSortedImportNodes(`// first comment
import z from 'z';
`);
    const commentNodes = getAllCommentsFromNodes(result);
    const comments = getComments(commentNodes);
    expect(comments).toEqual([' first comment']);
});

test('it returns all comments for a node', () => {
    const result = getSortedImportNodes(`// first comment
// second comment
import z from 'z';
`);
    const commentNodes = getAllCommentsFromNodes(result);
    const comments = getComments(commentNodes);
    expect(comments).toEqual([' first comment', ' second comment']);
});

test('it returns comment block for a node', () => {
    const result = getSortedImportNodes(`
/**
 * some block
 */
import z from 'z';
`);
    const commentNodes = getAllCommentsFromNodes(result);
    const comments = getComments(commentNodes);
    expect(comments).toEqual(['*\n * some block\n ']);
});
