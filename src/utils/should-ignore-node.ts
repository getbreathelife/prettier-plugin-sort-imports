import { namedTypes as n } from 'ast-types';

export const shouldIgnoreNode = (node: n.Node): boolean => {
    const leadingComments = node.comments?.filter(comment => comment.leading);
    if (!leadingComments) return false;

    const lastComment = leadingComments[leadingComments.length - 1];
    return (
        lastComment.type === 'CommentLine' &&
        lastComment.value.trim() === 'prettier-ignore'
    );
};
