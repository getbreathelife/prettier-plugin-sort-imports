import { namedTypes as n } from 'ast-types';
import { NodePath } from 'ast-types/lib/node-path';
import { parse, visit } from 'recast';

import { getSortedNodes } from '../get-sorted-nodes';
import { shouldIgnoreNode } from '../should-ignore-node';

const code = `// first comment
// second comment
import z from 'z';
import c from 'c';
import g from 'g';
import t from 't';
import k from 'k';
import a from 'a';
`;

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

const getSortedNodesNames = (imports: n.ImportDeclaration[]) =>
    imports
        .filter((i) => i.type === 'ImportDeclaration')
        .map((i) => i.source.value); // TODO: get from specifier

test('it returns all sorted nodes', () => {
    const result = getImportNodes(code);
    const sorted = getSortedNodes(result, []);
    expect(sorted).toMatchSnapshot();
    expect(getSortedNodesNames(sorted)).toEqual(['a', 'c', 'g', 'k', 't', 'z']);
});

test('it returns all sorted nodes with sort order', () => {
    const result = getImportNodes(code);
    const sorted = getSortedNodes(result, ['^a$', '^t$', '^k$']);
    expect(sorted).toMatchSnapshot();
    expect(getSortedNodesNames(sorted)).toEqual(['c', 'g', 'z', 'a', 't', 'k']);
});
