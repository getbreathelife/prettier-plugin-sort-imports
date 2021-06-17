import { namedTypes as n } from 'ast-types';
import { NodePath } from 'ast-types/lib/node-path';
import { format } from 'prettier';
import { parse, visit } from 'recast';

import { getSortedNodes } from '../get-sorted-nodes';
import { sortImportsInPlace } from '../get-code-from-ast';
import { shouldIgnoreNode } from '../should-ignore-node';

const getImportNodes = (code: string) => {
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

    return importNodes;
};

test('it sorts imports correctly', () => {
    const code = `// first comment
// second comment
import z from 'z';
import c from 'c';
import g from 'g';
import t from 't';
import k from 'k';
import a from 'a';
`;
    const importNodes = getImportNodes(code);
    const sortedNodes = getSortedNodes(importNodes, [], false);

    const parser = (code: string) =>
        parse(code, {
            parser: require("recast/parsers/typescript"),
        });
    const formatted = sortImportsInPlace(sortedNodes, code, parser);

    expect(format(formatted, { parser: 'typescript' })).toEqual(
        `// first comment
// second comment
import a from "a";
import c from "c";
import g from "g";
import k from "k";
import t from "t";
import z from "z";
`,
    );
});
