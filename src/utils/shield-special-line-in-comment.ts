import { commentShield } from '../constants';

export function shieldSpecialLineInComment(line: string): string {
    // Shield shebang in comment
    // https://github.com/benjamn/recast/issues/376
    if (/^#!.*$/.test(line)) {
        return commentShield + line;
    }
    return line;
}
