## Command line

```
npm run lint
```

This will query both JavaScript files and will query JavaScript within
Markdown and HTML files. It will also check for some JSDoc issues,
Mocha/chai-specific rules, etc.

## Atom usage

If using the Atom package `linter-eslint`, one may add `source.gfm` to the
"List of scopes to run ESLint on..." setting to get reporting of JavaScript
errors in Markdown.

One may also add `source.embedded.js` though configuration comments
and skip directives (not currently in use) don't seem to work there.
