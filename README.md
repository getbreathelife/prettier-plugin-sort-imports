# @getbreathelife/prettier-plugin-sort-imports

A prettier plugin to sort import declarations by provided RegEx order. Based on [`@trivago/prettier-plugin-sort-imports`](https://github.com/trivago/prettier-plugin-sort-imports)

### Install

npm

```shell script
npm install --save-dev @getbreathelife/prettier-plugin-sort-imports
```

or, using yarn

```shell script
yarn add --dev @getbreathelife/prettier-plugin-sort-imports
```

### Usage

Add an order in prettier config file.

```ecmascript 6
module.exports = {
  "printWidth": 80,
  "tabWidth": 4,
  "trailingComma": "all",
  "singleQuote": true,
  "jsxBracketSameLine": true,
  "semi": true,
  "importOrder": ["^@core/(.*)$", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"],
}
```

### APIs

#### `importOrder`
A collection of regular expressions in string format. The plugin
uses [`new RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
to evaluate regular expression. E.g. `node.source.value.match(new RegExp(val))` Here, `val` 
is the string provided in import order.

#### `experimentalBabelParserPluginsList`
A collection of parser names for babel parser. The plugin passes this list to babel parser so it can understand the syntaxes used in the file being formatted. The plugin uses prettier itself to figure out the parser it needs to use but if that fails, you can use this field to enforce the usage of the plugins babel needs.

```ecmascript 6
module.exports = {
  "printWidth": 80,
  "tabWidth": 4,
  "trailingComma": "all",
  "singleQuote": true,
  "jsxBracketSameLine": true,
  "semi": true,
  "importOrder": ["^@core/(.*)$", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"],
  "experimentalBabelParserPluginsList" : ["jsx", "typescript"]
}
```


### How does import sort work ?

The plugin extracts the imports which are defined in `importOrder`. 
These imports are _local imports_. The imports which are not part of the 
`importOrder` is considered as _3rd party imports_.

After, the plugin sorts the _local imports_ and _3rd party imports_ using
[natural sort algorithm](https://en.wikipedia.org/wiki/Natural_sort_order).
In the end, the plugin returns final imports with _3rd party imports_ on top and 
_local imports_ at the end.

### FAQ / Troubleshooting

#### Q. How can I add the RegEx imports in the `importOrder` list ?
You can define the RegEx in the `importOrder`. For
example if you want to sort the following imports:
```ecmascript 6
import React from 'react';
import classnames from 'classnames';
import z from '@server/z';
import a from '@server/a';
import s from './';
import p from '@ui/p';
import q from '@ui/q';
```
then the `importOrder` would be `["^@ui/(.*)$","^@server/(.*)$", '^[./]']`. 
Now, the final output would be as follows:

```ecmascript 6
import classnames from 'classnames';
import React from 'react';
import p from '@ui/p';
import q from '@ui/q';
import a from '@server/a';
import z from '@server/z';
import s from './';
```

#### Q. How can I run examples in this project ?
There is a _examples_ directory. The examples file can be formatted by using
`npm run example` command.


```shell script
npm run example examples/example.tsx
```

#### Q. How to use the plugin with `*.d.ts` files ?
The plugin automatically ignores the  `*.d.ts` files. We encourage you to declare the `*.d.ts` files in `.prettierignore`. (Read more here)[https://prettier.io/docs/en/ignore.html#ignoring-files-prettierignore].  

#### Q. How does the plugin handle the first comment in the file. 
The plugin keeps the first comment as it is in the file. The plugin also removes the new lines in between first comment and the first import.
**input:**
```js
// comment

import a from 'a'
```
**output:**
```js
// comment
import a from 'a'
```

#### Q. I'm getting error about experimental syntax.
If you are using some experimental syntax and the plugin has trouble parsing your files, you might getting errors similar to this:
```shell script
SyntaxError: This experimental syntax requires enabling one of the following parser plugin(s): ...
```
To solve this issue, you can use the new option `experimentalBabelParserPluginsList` in your `.prettierrc` and pass an array of plugin names to be used.

### Difference between this fork and the upstream package
The upstream package collects every import lines, sort them according to the given order and rewrite the files with the sorted import statements at the top.

While this strategy works well for most use cases, at Breathe Life we sometimes have other types of statements inserted between imports, which won't be preserved
with the original strategy. This fork replaces the import statements line-by-line and supports `// prettier-ignore` comments for statements that need to be preserved
between imports.
