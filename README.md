Matharray
==========

A tool for writing mathematical calculations and proofs as "equationarrays" in html-page. [Demo page](http://pesasa.github.io/matharray)

Writing math
============

MathQuill
---------

Matharray uses [MathQuill][MathQuill]-library for math input. With MathQuill simple math, numbers, letters, plus, minus and parenthesis can be just written as you would expect. Multiplication sign `&sdot;` can be written with `*`-symbol and division/factions are written with `/`, which automatically creates numerator and denominator. **Try it!**. Exponent is written with `^`-symbol. (In Linux, you might want to tap that symbol twice to get exponent.)

LaTeX
-----

More advanced math can be written in [LaTeX][LaTeX]-syntax with commands starting with `\`-character (*backslash*). For example the square root is written as `\sqrt` followed by space. In Matharray, however, MathQuill is configured so that some of the most common commands and symbols can be written without the beginning backslash. These are: `alpha`, `beta`, `gamma`, `delta`, `pi`, `theta`, `sqrt`, `sum`, `binom`, `choose`, `sin`, `cos`, `tan`, `arcsin`, `arccos`, `arctan`, `log`, `ln` and `lg`.

Mathpanel
---------

Together with the **Matharray** there is also **Mathpanel** which gives a button panel for inputting mathematical symbols and commands in Matharray just by clicking the symbol with mouse. The panel is transprently shown, when a Mathquill field has focus and it is fully visible, when mouse is over it. Symbols are organized in several tabs: *basic, relations, arrows, numbersets, greek alphabets, brackets and parenthesis, functions, dots, sums and products, logic, sets* and *other symbols*.

Navigation
----------

For editing following keys and key combinations can be used:

| Keys   | Description |
|--------|-------------|
| Arrows | With arrows the cursor and focus moves in the Matharray. Left and right arrows move the cursor in the text and when either end of the field is reached, the cursor moves to the next or to the previous field. Up and down arrows make the cursor move inside two-dimensional math formulas or between rows of the Matharray |
| Tab    | With tabulator key you can jump to the next field and with Shift+tab to the previous field. |
| Enter  | With enter key you can also jump to the next field. If the current field is the last field on the last row, a new empty row is created and the focus moves to the first field on that row. |
| Ctrl+enter | Add a new empty row after current row.|
| Shift+enter | Add a copy of current row after current row. Math fields are copied, comment field is left empty. This is useful for example, when solving a complex equation and you don't want to rewrite everything on every row. |
| Ctrl+backspace | Remove current row. |


For programmers
===============

Matharray
----------

The Matharray is written as a [jQuery][jQuery]-plugin. If you want to create a matharry, then first create some HTML-element:

```html
<div id="placeformath"></div>
```

Then init it as Matharray:

```javascript
$('#placeformath').matharray(data);
```

The data that is given to the plugin is a JavaScript-object of format:

```json
{
    "type": "matharray",
    "metadata": {...},
    "data": {...},
    "settings": {
        "username": "demouser",
        "mode": "edit"
    }
}
```

If the data is not given, the plugin creates an empty Matharray in view mode. Available modes are `view` and `edit`.

The user / programmer can ask the plugin to give its data with:

```javascript
var data = $('#placeformath').matharray('getdata');
```

The data is given in the same format. The `metadata`-attribute includes the information about the creator and modifier of the data and the timestamps (unix millis) of creation and modification times.

The data can also be gotten by triggering the jQuery-object of the HTML-element a getdata jQuery-event and reading the data object with key `[[elementdata]]` from jQuery-object's `.data()`.

```javascript
$('#placeformath').trigger('getdata');
var data = $('#placeformath').data('[[elementdata]]');
```

The data of Matharray can also be obtained as an array of rows, which themselves are given as an array of strings, as follows:

```javascript
var data = $('#placeformath').matharray('latexarray');
```

In this case the data is of following format:

```json
[
    [
        "3x+4",
        "=",
        "5x-1",
        "add $-5x-4$ on both sides"
    ],
    [
        "3x-5x",
        "=",
        "-1-4",
        "add compatible terms together"
    ],
    [
        "-2x",
        "=",
        "-5",
        "divide by $-2$ on both sides"
    ],
    [
        "x",
        "=",
        "\\frac{5}{2}",
        ""
    ]
]
```

Mathpanel
---------

The Mathpanel is also implemented as a jQuery-plugin. It is drawn in its own HTML-element the same way as the Matharray:

```html
<div id="mathpanel"></div>
```

```javascript
$('#mathpanel').mathpanel();
```

When the Mathpanel is inited, it is shown whenever some MathQuill-field gets focus. The Mathpanel is shown under the focused field as transparent so that it is not hiding text under it. The panel becomes fully visible, when the mouse goes over it.

By default the Mathpanel has fixed selection of symbols and commands, but the user / programmer can override or extend the set by giving it more buttons as a JavaScript object. You can see the source code of default panel in the file `jquery.mathpanel.js` for the format.

Mathquill
---------

In this example we have used a lightly patched version of the [MathQuill][pesasa-mathquill] (matharray-branch). The Matharray works mostly also with the official version of the [MathQuill][MathQuill]. Main differences are in the behavior of the textfield (justifications). Namely navigation in textfields and copying and pasting of text. Another improvement in our version is workin versions of the symbols of numbersets.

Licenses
--------

Required components are all free and open source:

- [jQuery][jQuery] ([Apache License, v.2.0][Apache])
- [MathQuill][MathQuill] ([Mozilla Public License, v.2.0][MPL])
- [Matharray][Matharray] ([MIT License][MIT])
- [Mathpanel][Matharray] ([MIT License][MIT])



[MathQuill]: http://mathquill.com/
[LaTeX]: https://en.wikipedia.org/wiki/LaTeX
[jQuery]: http://jquery.com
[pesasa-mathquill]: https://github.com/pesasa/mathquill/tree/matharray
[Apache]: http://www.apache.org/licenses/LICENSE-2.0
[Matharray]: http://github.com/pesasa/matharray/
[MIT]: https://opensource.org/licenses/MIT
[MPL]: http://mozilla.org/MPL/2.0/