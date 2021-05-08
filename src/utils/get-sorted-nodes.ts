// we do not have types for javascript-natural-sort
//@ts-ignore
import naturalSort from 'javascript-natural-sort';
import { compact, pull, clone } from 'lodash';

import { ImportDeclaration, addComments, removeComments } from '@babel/types';

import { isSimilarTextExistInArray } from './is-similar-text-in-array';
import { PrettierOptions, SortedNode } from '../types';

/**
 * This function returns all the nodes which are in the importOrder array.
 * The plugin considered these import nodes as local import declarations.
 * @param nodes all import nodes
 * @param order import order
 * @param importOrderSeparation boolean indicating if newline should be inserted after each import order
 */
export const getSortedNodes = (
    nodes: ImportDeclaration[],
    order: PrettierOptions['importOrder'],
    importOrderSeparation: boolean,
) => {
    // Extract the top and bottom comments
    const firstNodeLeadingComments = nodes[0].leadingComments;
    nodes[0].leadingComments = null;

    const originalNodes = nodes.map(clone);
    const shouldAddNewLine = importOrderSeparation && nodes.length > 1;
    const sortedNodesByImportOrder = order.reduce(
        (
            res: SortedNode<ImportDeclaration>[],
            val,
        ): SortedNode<ImportDeclaration>[] => {
            const x = originalNodes.filter(
                (node) => node.source.value.match(new RegExp(val)) !== null,
            );

            // remove "found" imports from the list of nodes
            pull(originalNodes, ...x);

            if (x.length > 0) {
                x.sort((a, b) => naturalSort(a.source.value, b.source.value));

                const sortedNodes = x.map<SortedNode<ImportDeclaration>>(
                    (node) => ({
                        node,
                        trailingNewLine: false,
                    }),
                );

                if (res.length > 0) {
                    if (shouldAddNewLine) {
                        res[res.length - 1].trailingNewLine = true;
                    }

                    return compact([...res, ...sortedNodes]);
                }
                return sortedNodes;
            }
            return res;
        },
        [],
    );

    const sortedNodesNotInImportOrder = originalNodes
        .filter((node) => !isSimilarTextExistInArray(order, node.source.value))
        .map<SortedNode<ImportDeclaration>>((node) => ({
            node,
            trailingNewLine: false,
        }));

    sortedNodesNotInImportOrder.sort((a, b) =>
        naturalSort(a.node.source.value, b.node.source.value),
    );

    const shouldAddNewLineInBetween =
        sortedNodesNotInImportOrder.length > 0 && importOrderSeparation;

    if (shouldAddNewLineInBetween) {
        sortedNodesNotInImportOrder[
            sortedNodesNotInImportOrder.length - 1
        ].trailingNewLine = true;
    }
    if (sortedNodesByImportOrder.length > 0) {
        sortedNodesByImportOrder[
            sortedNodesByImportOrder.length - 1
        ].trailingNewLine = true;
    }

    const allSortedNodes = compact([
        ...sortedNodesNotInImportOrder,
        ...sortedNodesByImportOrder,
    ]);

    // maintain a copy of the nodes to extract comments from
    const sortedNodesLeadingComments = allSortedNodes.map(
        ({ node }) => node.leadingComments || [],
    );

    // Remove all comments from sorted nodes
    allSortedNodes.forEach(({ node }) => removeComments(node));

    // insert comments other than the first comments
    allSortedNodes.forEach(({ node }, index) => {
        let leadingComments = sortedNodesLeadingComments[index];
        addComments(node, 'leading', leadingComments);
    });

    if (firstNodeLeadingComments) {
        addComments(
            allSortedNodes[0].node,
            'leading',
            firstNodeLeadingComments,
        );
    }

    return allSortedNodes;
};
