# Accessibility

We run some automated accessibility tests to try to ensure best practices
for visually impaired as well as accessibility's benefits for
non-impaired users.

## Known rule problems

Here are the [rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
currently being reported:

1. `meta-viewport` - Regarding "Zooming and scaling must not be disabled",
    `<meta name="viewport" content="...user-scalable=no">`; this rule
    is ignored in tests, as it is a known issue. We do have our
    own zoom controls. It should also require a lot of work to refactor.
1. `color-contrast` - Regarding "Elements must have sufficient color
    contrast", the following at least have been reported:
    `#sidepanel_handle`, `#main_icon > span`, `#stroke_style`.
1. `duplicate-id`, - Regarding "id attribute value must be unique", the
    selector `#fill_color > svg > defs > lineargradient` is being reported,
    and it is due to multiple IDs within `editor/images/svg_edit_icons.svg`
    (due to internal duplicates and/or because of cloning?).
