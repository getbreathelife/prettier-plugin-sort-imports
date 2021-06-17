// we do not have types for javascript-natural-sort
//@ts-ignore
import naturalSort from 'javascript-natural-sort';
import { compact, pull, clone, partition } from 'lodash';
import { namedTypes as n } from 'ast-types';

import { addComments, removeComments } from '@babel/types';

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
    nodes: n.ImportDeclaration[],
    order: PrettierOptions['importOrder'],
    importOrderSeparation: boolean,
) => {
    // Extract the top comments
    const [firstNodeLeadingComments, firstNodeTrailingComments] = partition(nodes[0].comments, (comment) => comment.leading)
    nodes[0].comments = firstNodeTrailingComments;

    const originalNodes = nodes.map(clone);
    const shouldAddNewLine = importOrderSeparation && nodes.length > 1;
    const sortedNodesByImportOrder = order.reduce(
        (
            res: SortedNode<n.ImportDeclaration>[],
            val,
        ): SortedNode<n.ImportDeclaration>[] => {
            const x = originalNodes.filter(
                (node) => node.source.value?.toString().match(new RegExp(val)) !== null,
            );

            // remove "found" imports from the list of nodes
            pull(originalNodes, ...x);

            if (x.length > 0) {
                x.sort((a, b) => naturalSort(a.source.value, b.source.value));

                const sortedNodes = x.map<SortedNode<n.ImportDeclaration>>(
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
        .filter((node) => !isSimilarTextExistInArray(order, node.source.value?.toString() ?? ''))
        .map<SortedNode<n.ImportDeclaration>>((node) => ({
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
        ({ node }) => node.comments?.filter(comment => comment.trailing) ?? [],
    );

    // Remove all comments from sorted nodes
    allSortedNodes.forEach(({ node }) => node.comments = []);

    // insert comments other than the first comments
    allSortedNodes.forEach(({ node }, index) => {
        let leadingComments = sortedNodesLeadingComments[index];
        if (!node.comments) {
            node.comments = [];
        }
        node.comments.push(...leadingComments);
    });

    if (firstNodeLeadingComments) {
        if (!allSortedNodes[0].node.comments) {
            allSortedNodes[0].node.comments = [];
        }
        allSortedNodes[0].node.comments.push(...firstNodeLeadingComments);
    }

    return allSortedNodes;
};
