import { RequiredOptions } from 'prettier';
import { ParserPlugin } from '@babel/parser';

export type SortedNode<NodeType> = {
    node: NodeType;
    trailingNewLine: boolean;
};

export interface PrettierOptions extends RequiredOptions {
    importOrder: string[];
    importOrderSeparation: boolean;
    experimentalBabelParserPluginsList: ParserPlugin[];
}
