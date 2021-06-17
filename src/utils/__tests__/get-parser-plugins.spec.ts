import { getParserPlugins } from '../get-parser-plugins';

test('it should return empty parser', () => {
    expect(getParserPlugins('babel')).toEqual(null);
});

test('it should return empty parser when invalid parser is entered in prettier', () => {
    // @ts-ignore
    expect(getParserPlugins('xxxxx')).toEqual(null);
});

test('it should return the correct parsers', () => {
    expect(getParserPlugins('flow')).toEqual(require("recast/parsers/flow"));
    expect(getParserPlugins('typescript')).toEqual(require("recast/parsers/typescript"));
});
