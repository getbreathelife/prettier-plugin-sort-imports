import { BuiltInParserName, CustomParser } from 'prettier';
import {
    flow,
    typescript,
} from '../constants';


/**
 * Returns a list of babel parser plugin names
 * @param prettierParser name of the parser recognized by prettier
 * @returns list of parser plugins to be passed to babel parser
 */
export const getParserPlugins = (
    prettierParser: BuiltInParserName | CustomParser,
): any => {
    const isFlow = prettierParser === flow;
    const isTypescript = prettierParser === typescript;

    if (isTypescript) {
        return require("recast/parsers/typescript");
    }
    if (isFlow) {
        return require("recast/parsers/flow");
    }
    return null;
};
