import { Statement, CommentBlock, CommentLine } from '@babel/types';
import { SortedNode } from '../types';

export const getAllCommentsFromNodes = (nodes: SortedNode<any>[]) =>
    nodes.reduce((acc, { node }) => {
        if (
            Array.isArray(node.leadingComments) &&
            node.leadingComments.length > 0
        ) {
            acc = [...acc, ...node.leadingComments];
        }
        return acc;
    }, [] as (CommentBlock | CommentLine)[]);
