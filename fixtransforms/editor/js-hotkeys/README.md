#About
**jQuery.hotkeys** is a plug-in that lets you easily add and remove handlers for keyboard events anywhere in your code supporting almost any key combination.  

It is based on a library [Shortcut.js](http://www.openjs.com/scripts/events/keyboard_shortcuts/shortcut.js) written by [Binny V A](http://www.openjs.com/).

The syntax is as follows:
<pre>
$(expression).bind(<types>,<options>, <handler>);
$(expression).unbind(<types>,<options>, <handler>);

$(document).bind('keydown', 'Ctrl+a', fn);

// e.g. replace '$' sign with 'EUR'
$('input.foo').bind('keyup', '$', function(){
    this.value = this.value.replace('$', 'EUR');
});

$('div.foo').unbind('keydown', 'Ctrl+a', fn);
</pre>
## [Live Demo](http://jshotkeys.googlepages.com/test-static-01.html)

## Types
Supported types are `'keydown'`, `'keyup'` and `'keypress'`

## Options
The options are `'combi'` i.e. the key combination, and `'disableInInput'` which allow your code not to be executed when the cursor is located inside an input ( `$(elem).is('input') || $(elem).is('textarea')` ).

As you can see, the key combination can be passed as string or as an object. You may pass an object in case you wish to override the default option for `disableInInput` which is set to `false`:
<pre>
$(document).bind('keydown', {combi:'a', disableinInput: true}, fn);
</pre>
I.e. when cursor is within an input field, `'a'` will be inserted into the input field without interfering. 

If you want to use more than one modifiers (e.g. alt+ctrl+z) you should define them by an alphabetical order e.g. alt+ctrl+shift

Modifiers are case insensitive, i.e. 'Ctrl+a' 'ctrl+a'.

## Handler
In previous versions there was an option propagate which is removed now and implemented at the user code level.

When using jQuery, if an event handler returns false, jQuery will call `stopPropagation()` and `preventDefault()`

## jQuery Compatibility
Tested with *jQuery 1.2.6*

It known to be working with all the major browsers on all available platforms (Win/Mac/Linux)

 * IE 6/7/8
 * FF 1.5/2/3
 * Opera-9
 * Safari-3
 * Chrome-0.2

## Features added in this version (0.7.x)
 * Implemented as $.fn - let you use `this`.
 * jQuery selectors are supported.
 * Extending `$.fn.bind` and `$.fn.unbind` so you get a single interface for binding events to handlers
 
## Overriding jQuery
The plugin wraps the following jQuery methods:
 * $.fn.bind
 * $.fn.unbind
 * $.find

Even though the plugin overrides these methods, the original methods will *always* be called.

The plugin will add functionality only for the `keydown`, `keyup` and `keypress` event types. Any other types are passed untouched to the original `'bind()'` and `'unbind()'` methods.

Moreover, if you call `bind()` without passing the shortcut key combination e.g. `$(document).bind('keydown', fn)` only the original `'bind()'` method will be executed.

I also modified the `$.fn.find` method by adding a single line at the top of the function body. here is the code:

<pre>
    jQuery.fn.find = function( selector ) {
        // the line I added
        this.query=selector;
        // call jQuery original find
        return jQuery.fn.__find__.apply(this, arguments);
    };
</pre>

You can read about this at [jQuery's User Group](http://groups.google.com/group/jquery-en/browse_thread/thread/18f9825e8d22f18d)

###Notes

Firefox is the most liberal one in the manner of letting you capture all short-cuts even those that are built-in in the browser such as `Ctrl-t` for new tab, or `Ctrl-a` for selecting all text. You can always bubble them up to the browser by returning `true` in your handler.

Others, (IE) either let you handle built-in short-cuts, but will add their functionality after your code has executed. Or (Opera/Safari) will *not* pass those events to the DOM at all.

*So, if you bind `Ctrl-Q` or `Alt-F4` and your Safari/Opera window is closed don't be surprised.*


###Current Version is: beta 0.7