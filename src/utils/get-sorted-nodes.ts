// we do not have types for javascript-natural-sort
//@ts-ignore
import naturalSort from 'javascript-natural-sort';
import { compact, pull, clone, partition } from 'lodash';
import { namedTypes as n } from 'ast-types';

import { isSimilarTextExistInArray } from './is-similar-text-in-array';
import { PrettierOptions } from '../types';

/**
 * This function returns all the nodes which are in the importOrder array.
 * The plugin considered these import nodes as local import declarations.
 * @param nodes all import nodes
 * @param order import order
 */
export const getSortedNodes = (
    nodes: n.ImportDeclaration[],
    order: PrettierOptions['importOrder'],
) => {
    // Extract the top comments
    const [firstNodeLeadingComments, firstNodeTrailingComments] = partition(nodes[0].comments, (comment) => comment.leading)
    nodes[0].comments = firstNodeTrailingComments;

    const originalNodes = nodes.map(clone);
    const sortedNodesByImportOrder = order.reduce(
        (
            res: n.ImportDeclaration[],
            val,
        ): n.ImportDeclaration[] => {
            const x = originalNodes.filter(
                (node) => node.source.value?.toString().match(new RegExp(val)) !== null,
            );

            // remove "found" imports from the list of nodes
            pull(originalNodes, ...x);

            if (x.length > 0) {
                x.sort((a, b) => naturalSort(a.source.value, b.source.value));

                if (res.length > 0) {
                    return compact([...res, ...x]);
                }
                return x;
            }
            return res;
        },
        [],
    );

    const sortedNodesNotInImportOrder = originalNodes
        .filter((node) => !isSimilarTextExistInArray(order, node.source.value?.toString() ?? ''));

    sortedNodesNotInImportOrder.sort((a, b) =>
        naturalSort(a.source.value, b.source.value),
    );

    const allSortedNodes = compact([
        ...sortedNodesNotInImportOrder,
        ...sortedNodesByImportOrder,
    ]);

    if (firstNodeLeadingComments) {
        if (!allSortedNodes[0].comments) {
            allSortedNodes[0].comments = [];
        }
        allSortedNodes[0].comments.unshift(...firstNodeLeadingComments);
    }

    return allSortedNodes;
};
