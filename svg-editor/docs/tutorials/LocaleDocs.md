# Introduction

As of v3.0, locale files are defined as an object exported as
an ES6 Module default. See `editor/locale` for some example files.

(In previous versions, the locale files were required to call
`svgEditor.readLang`.)

## Expected format

You may also see the [LocaleStrings API]{@link module:locale.LocaleStrings}
for the programmatic definition of the expected object (i.e., an object of
strings and a potential recursion of other such subobjects or an array of
strings and such objects). This is true for extenions as well.

However, we are not currently processing any formatting of such strings
(besides using the convention of using brackets to surround variables
`{variableToSubstitute}`). In the absence of such, you may wish to use
your own formatting such as with
[Fluent.js](https://github.com/projectfluent/fluent.js).

While it is possible we may move to accept JSON in future versions
(to avoid maintainers needing to worry about JavaScript execution),
the ES6 Modules export allows for cleaner objects; there is no need for
quoted keys when alphanumeric keys are used, and there is the opportunity
to use less-distracting single quotes if not
[ES6 Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)).

## Special properties

The `lang` property  should define its HTML `lang` value (which should
probably always be the same as "<lang>" within the "lang.<lang>.js"
file name). This is important for accessibility (screen readers),
search engines, and, for some languages, font selection (e.g., Chinese,
Japanese and Korean languages are expected in different font styles,
despite many characters being shared). `lang` can also potentially be
used programmatically for different styling or behaviors.

While not currently in use, the `dir` property should be used to indicate
the default directionality of the language of the locale.

## Location of locale files (including for extensions)

While `editor/locale` hosts the main locale files, internationalizable
extensions define their own locale files (better supporting modularity). In
our project, these can be found within `editor/extensions/ext-locale/<ext name>/`.

See [ExtensionDocs]{@tutorial ExtensionDocs} if you are implementing an
internationalized extension.
