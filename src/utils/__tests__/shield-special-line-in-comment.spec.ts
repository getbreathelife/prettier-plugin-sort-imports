import { shieldSpecialLineInComment } from '../shield-special-line-in-comment';
import { commentShield } from '../../constants';

describe('shieldSpecialLineInComment', () => {
    it('preserves normal line', () => {
       const line = "import something from 'something'";
       expect(shieldSpecialLineInComment(line)).toEqual(line);
    });

    it('converts shebang line into comment', () => {
        const shebangLine = '#! /usr/env/node';
        expect(shieldSpecialLineInComment(shebangLine)).toEqual(`${commentShield}${shebangLine}`);
    });
});
