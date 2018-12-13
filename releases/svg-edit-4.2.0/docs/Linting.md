## Command line

```
npm run eslint
```

This will query both JavaScript files and will query JavaScript within
Markdown files. It will also check for some JSDoc issues.

## JSDoc

To check for JSDoc issues, besides the eslint script, one may run the
following to find any overly generic types in use (types should be as
specific as possible):

```
npm run types-doc
```

See also [ReleaseInstructions](./ReleaseInstructions.md).

## Atom usage

If using the Atom package `linter-eslint`, one may add `source.gfm` to the
"List of scopes to run ESLint on..." setting to get reporting of JavaScript
errors in Markdown.

One may also add `source.embedded.js` though configuration comments
and skip directives (not currently in use) don't seem to work there.
