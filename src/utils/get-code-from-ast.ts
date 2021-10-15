import { namedTypes as n } from 'ast-types';
import { NodePath } from 'ast-types/lib/node-path';
import { Options, parse, print, visit } from 'recast';

import { commentShield, newLineCharacters, newLineNode } from '../constants';
import { shouldIgnoreNode } from './should-ignore-node';
import { shieldSpecialLineInComment } from './shield-special-line-in-comment';
import { CommentKind } from 'ast-types/gen/kinds';
import { max } from 'lodash';

const maxLineReducer = (max: number, curr?: number) => {
    if (!curr || max > curr) return max;
    return curr;
}

export const sortImports = (
    nodes: n.ImportDeclaration[],
    code: string,
    parserOptions: Options,
) => {
    if (nodes.length < 1) return code;

    const maxParsedNodeLine = nodes.map(node => node.loc?.end.line).reduce(maxLineReducer, 0);
    const maxParsedCommentLine = nodes.map(node => node.comments).reduce((acc: CommentKind[], comments) => {
        if (!comments) return acc;
        return acc.concat(comments)
    }, []).map(comment => comment.loc?.end.line).reduce(maxLineReducer, 0);

    const maxParsedLine = max([maxParsedNodeLine, maxParsedCommentLine])

    const lineTerminator = parserOptions.lineTerminator || '\n';
    const codeArr = code.split(lineTerminator);

    const parsedCode = codeArr.slice(0, maxParsedLine).map(shieldSpecialLineInComment).join(lineTerminator);

    const restOfCode = codeArr.slice(maxParsedLine).join(lineTerminator);

    const parser = (input: string): n.File => parse(input, parserOptions);
    const ast = parser(parsedCode);

    const pushedBackNodes: (n.Node | string)[] = [];
    let sortedNodeIndex = 0;
    visit(ast.program, {
        visitNode(path: NodePath<n.Node>): any {
            if (n.File.check(path.value) || n.Program.check(path.node)) {
                this.traverse(path);
            }

            if (shouldIgnoreNode(path.node)) {
                return false;
            }

            if (n.ImportDeclaration.check(path.node)) {
                const tsModuleParent = n.TSModuleBlock.check(path.parentPath.node);
                if (tsModuleParent) return false;

                const node = nodes[sortedNodeIndex];

                path.replace(node);

                sortedNodeIndex++;

                if (sortedNodeIndex >= nodes.length && pushedBackNodes.length > 0) {
                    path.insertAfter(newLineNode, ...pushedBackNodes);
                }

                return false;
            } else {
                if (sortedNodeIndex < nodes.length) {
                    pushedBackNodes.push(path.node);
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
        ).replace(
            commentShield,
            ''
        ) + lineTerminator + restOfCode
    );
};
