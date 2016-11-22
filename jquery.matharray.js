/**
 * Matharray (jquery.matharray.js)
 * An interactive tool for creating and showing equationarrays
 * on web pages. Uses:
 * - MathQuill (http://mathquill.com) for math
 * - jQuery (http://jquery.com/)
 *
 * Petri Salmela <pesasa@iki.fi>
 * 12.11.2016
 */

(function(window, $) {
    
    var PLUGIN_NAME = 'matharray';
    var MQ_CONFIG = {
        spaceBehavesLikeTab: false,
        restrictMismatchedBrackets: true,
        supSubRequireOperand: true,
        autoCommands: 'pi theta alpha beta gamma delta sqrt sum binom choose',
        autoOperatorNames: 'sin cos tan arcsin arccos arctan log ln lg'
    }
    
    var MQ = MathQuill.getInterface(2);
    MQ.config(MQ_CONFIG);
    
    /**
     * General virtual class for elements. Real classes inherit this.
     * @class GeneralElement
     * @constructor
     */
    var GeneralElement = function(place, options) {
        this.place = $(place);
        this.init(options);
        this.initHandlers();
        this.show();
    }
    
    /**
     * Init the element with given options, set mode, attributes etc.
     */
    GeneralElement.prototype.init = function(options) {
        options = $.extend(true, {}, this.defaults, options);
        this.type = options.type;
        this.settings = options.settings;
        this.id = options.id || options.name || this.generateId();
        this.metadata = options.metadata;
        this.updateMetadata();
        this.data = options.data;
        this.setStyles();
        this.setMode();
        this.setAttrs();
    }
    
    /**
     * Create a new element id of format <elementtype>-<username>-<time in ms>-<random number>
     * @returns {String} new element id
     */
    GeneralElement.prototype.generateId = function() {
        var newid = [this.type, this.settings.username];
        var datetime = new Date();
        newid.push(datetime.getTime());
        newid.push(Math.floor(Math.random() * 1000));
        return newid.join('-');
    }
    
    /**
     * Update metadata with current time and modifier etc.
     */
    GeneralElement.prototype.updateMetadata = function() {
        this.metadata.modifier = this.settings.username;
        this.metadata.modified = (new Date()).getTime();
        if (!this.metadata.creator) {
            this.metadata.creator = this.metadata.modifier;
        };
        if (!this.metadata.created) {
            this.metadata.created = this.metadata.modified;
        };
    };
    
    /**
     * Update data with current state of the inner object
     */
    GeneralElement.prototype.updateData = function(){}
    
    /**
     * Set element's stylesheets to head, if they are not yet there.
     */
    GeneralElement.prototype.setStyles = function() {
        var styleid = this.type + 'styles';
        if ($('head style#' + styleid).length === 0) {
            $('head').append('<style type="text/css" id="' + styleid + '">\n' + this.styles + '</style>');
        };
    };
    
    /**
     * Set the mode of element (view|edit|review|...)
     * @param {String} [mode]   Optional mode. If not given, this.settings.mode is used.
     */
    GeneralElement.prototype.setMode = function(mode) {
        mode = mode || this.settings.mode;
        if (!this.rights[mode]) {
            mode = 'view';
        };
        var rights = this.rights[mode];
        this.settings.mode = mode;
        this.place.attr('data-elementmode', mode);
        this.editable = rights.editable;
        this.reviewable = rights.reviewable;
    }
    
    /**
     * Set attributes for html-element
     */
    GeneralElement.prototype.setAttrs = function() {
        this.place
            .attr('data-elementtype', this.type)
            .attr('data-elementid', this.id)
            .addClass(this.type);
    }
    
    /**
     * Get the data of the element
     * @returns {Object} the data of the element
     */
    GeneralElement.prototype.getData = function(){
        var result = {
            type: this.type,
            id: this.id,
            name: this.id,
            metadata: JSON.parse(JSON.stringify(this.metadata)),
            data: JSON.parse(JSON.stringify(this.data))
        };
    };
    
    /**
     * Element has bee changed
     */
    GeneralElement.prototype.changed = function() {
        this.updateMetadata();
        this.updateData();
        this.place.trigger('element_changed', this.getData());
    }
    
    /**
     * Remove all event handlers
     */
    GeneralElement.prototype.removeHandlers = function() {
        this.place.off();
    };
    
    /**
     * Init event handlers
     */
    GeneralElement.prototype.initHandlers = function() {
        this.removeHandlers();
        this.initHandlersCommon();
        if (this.editable) {
            this.initHandlersEdit();
        } else {
            this.initHandlersView();
        };
        if (this.reviewable) {
            this.initHandlersReview();
        };
    };
    
    /**
     * Init event handlers that are common for all modes.
     */
    GeneralElement.prototype.initHandlersCommon = function() {
        var element = this;
        this.place.on('destroy', function(event, data) {
            event.stopPropagation();
            event.preventDefault();
            element.destroy();
        }).on('setmode', function(event, data) {
            event.stopPropagation();
            event.preventDefault();
            element.setMode(data);
            element.initHandlers();
            element.show();
        }).on('getdata', function(event, data) {
            event.stopPropagation();
            event.preventDefault();
            var eldata = element.getData();
            if (typeof(data) === 'object'){
                data.result = eldata;
            };
            event.place.data('[[elementdata]]', eldata);
        });
    };
    
    /**
     * Init event handlers for view mode
     */
    GeneralElement.prototype.initHandlersView = function() {
        var Element = this;
    }
    
    /**
     * Init event handlers for edit mode
     */
    GeneralElement.prototype.initHandlersEdit = function() {
        var Element = this;
    }
    
    /**
     * Init event handlers for review mode
     */
    GeneralElement.prototype.initHandlersReview = function() {
        var Element = this;
    }
    
    /**
     * Destroy this element (remove handlers and content)
     */
    GeneralElement.prototype.destroy = function() {
        this.removeHandlers();
        this.empty();
    };
    
    /**
     * Show the element
     */
    GeneralElement.prototype.show = function() {
        if (this.editable) {
            this.edit();
        } else {
            this.view();
        };
    };
    
    /**
     * Show the element in view mode
     */
    GeneralElement.prototype.view = function() {}
    
    /**
     * Show the element in edit mode
     */
    GeneralElement.prototype.edit = function() {}
    
    /**
     * Default rights for different modes for general elements
     */
    GeneralElement.prototype.rights = {
        view: {
            editable: false,
            reviewable: false
        },
        edit: {
            editable: true,
            reviewable: false
        },
        review: {
            editable: false,
            reviewable: true
        }
    };
    
    
    var MathArray = function(place, options) {
        this.place = $(place);
        this.init(options);
        this.initHandlers();
        this.show();
    }
    
    // Inherit from GeneralElement
    MathArray.prototype = Object.create(GeneralElement.prototype);
    MathArray.prototype.constructor = MathArray;
    MathArray.prototype.parentClass = GeneralElement.prototype;
    
    /**
     * Init matharray
     * @param {Object} options  The data for matharray
     */
    MathArray.prototype.parentInit = MathArray.prototype.parentClass.init;
    MathArray.prototype.init = function(options) {
        this.parentInit(options);
        var html = ['<table class="matharray-table"><tbody></tbody></table>'].join('\n');
        this.place.html(html);
        this.mabody = this.place.find('tbody');
        this.marray = new Marray(this.mabody, this.data);
    }
    
    /**
     * Show matharray in view mode
     */
    MathArray.prototype.view = function(){
        this.marray.draw('view');
    };
    
    /**
     * Show matharray in edit mode
     */
    MathArray.prototype.edit = function(){
        this.marray.draw('edit');
    }
    
    /**
     * Init event handlers for edit mode
     */
    MathArray.prototype.initHandlersEdit = function() {
        var element = this;
        this.place.on('datachanged', function(event, data) {
            event.stopPropagation();
            event.preventDefault();
            element.changed();
        });
        this.place.on('gotonextfield', function(event, data) {
            event.stopPropagation();
            event.preventDefault();
            var mathfield = $(event.target);
            var row = mathfield.closest('tr');
            var allrows = row.parent().children();
            var index = allrows.index(row);
            var colkey = mathfield.attr('data-colkey');
            var cols = ['left', 'middle', 'right', 'description'];
            var nextcol = cols[(cols.indexOf(colkey) + 1) % cols.length];
            var nextindex = (colkey === 'description' ? index + 1 : index);
            element.setFocus(nextindex, nextcol, MQ.L);
        });
        this.place.on('gotoprevfield', function(event, data) {
            event.stopPropagation();
            event.preventDefault();
            var mathfield = $(event.target);
            var row = mathfield.closest('tr');
            var allrows = row.parent().children();
            var index = allrows.index(row);
            var colkey = mathfield.attr('data-colkey');
            var cols = ['left', 'middle', 'right', 'description'];
            var nextcol = cols[(cols.indexOf(colkey) + cols.length - 1) % cols.length];
            var nextindex = (colkey === 'left' ? index - 1 : index);
            element.setFocus(nextindex, nextcol, MQ.R);
        });
        this.place.on('gotonextrow', function(event, data) {
            event.stopPropagation();
            event.preventDefault();
            var mathfield = $(event.target);
            var row = mathfield.closest('tr');
            var allrows = row.parent().children();
            var index = allrows.index(row);
            var colkey = mathfield.attr('data-colkey');
            element.setFocus(index + 1, colkey);
        });
        this.place.on('gotoprevrow', function(event, data) {
            event.stopPropagation();
            event.preventDefault();
            var mathfield = $(event.target);
            var row = mathfield.closest('tr');
            var allrows = row.parent().children();
            var index = allrows.index(row);
            var colkey = mathfield.attr('data-colkey');
            element.setFocus(index - 1, colkey);
        });
        this.place.on('keydown', '.matharray-mathfield, .matharray-textfield', function(event, data) {
            var mathfield = $(this);
            switch (event.keyCode) {
                case 13: // enter
                    if (event.ctrlKey) {
                        event.stopPropagation();
                        var row = mathfield.closest('tr');
                        var allrows = row.parent().children();
                        var index = allrows.index(row);
                        element.addRow({}, index + 1);
                        element.setFocus(index + 1, 'left', MQ.L);
                    } else if (event.shiftKey) {
                        event.stopPropagation();
                        var row = mathfield.closest('tr');
                        var allrows = row.parent().children();
                        var index = allrows.index(row);
                        var rowdata = element.getRowData(index);
                        rowdata.description = '';
                        element.addRow(rowdata, index + 1);
                        element.setFocus(index + 1, 'left', MQ.L);
                    } else {
                        event.stopPropagation();
                        var row = mathfield.closest('tr');
                        var allrows = row.parent().children();
                        var index = allrows.index(row);
                        var colkey = mathfield.attr('data-colkey');
                        var cols = ['left', 'middle', 'right', 'description'];
                        var nextcol = cols[(cols.indexOf(colkey) + 1) % cols.length];
                        var nextindex = (colkey === 'description' ? index + 1 : index);
                        if (element.count() === nextindex && nextcol === 'left') {
                            element.addRow({}, nextindex);
                        };
                        element.setFocus(nextindex, nextcol, MQ.L);
                    };
                    break;
                case 8:
                    if (event.ctrlKey) {
                        var row = mathfield.closest('tr');
                        var allrows = row.parent().children();
                        var index = allrows.index(row);
                        element.setFocus(Math.max(index - 1, 0), 'left', MQ.L);
                        element.removeRow(index);
                    };
                    break;
                case 38:
                    var colkey = mathfield.attr('data-colkey');
                    if (colkey === 'description') {
                        mathfield.trigger('gotoprevrow');
                    };
                    break;
                case 40:
                    var colkey = mathfield.attr('data-colkey');
                    if (colkey === 'description') {
                        mathfield.trigger('gotonextrow');
                    };
                    break;
                default:
                    break;
            }
        });
    }
    
    /**
     * Get the number of the rows
     * @return {Number} The number of equation rows
     */
    MathArray.prototype.count = function() {
        return this.marray.count();
    }
    
    /**
     * Update data from the inner object
     */
    MathArray.prototype.updateData = function() {
        this.data = this.marray.getData();
    }
    
    /**
     * Get the data of MathArray
     * @returns {Object} the data of this element
     */
    MathArray.prototype.getData = function() {
        var result = {
            type: this.type,
            id: this.id,
            name: this.id,
            metadata: JSON.parse(JSON.stringify(this.metadata)),
            data: JSON.parse(JSON.stringify(this.data))
        };
        return result;
    }
    
    /**
     * Get the data of one row
     * @param {Number} index   The index of the row
     * @returns {Object} the data of the asked row
     */
    MathArray.prototype.getRowData = function(index) {
        return this.marray.getRowData(index);
    };
    
    /**
     * Add a new row in given place
     * @param {Object} rowdata  The data of the new row
     * @param {Number} index    The index of the new row
     */
    MathArray.prototype.addRow = function(rowdata, index) {
        this.marray.addRow(rowdata, index);
        this.changed();
    };
    
    /**
     * Remove row in given place
     * @param {Number} index    The index of the new row
     */
    MathArray.prototype.removeRow = function(index) {
        this.marray.removeRow(index);
        this.changed();
    };
    
    /**
     * Set focus to asked field
     * @param {Number} row     Index of the row
     * @param {String} col     Column name
     * @param {Number} dir     Direction, on which end to put the focus (MQ.L | MQ.R)
     */
    MathArray.prototype.setFocus = function(row, col, dir) {
        this.marray.setFocus(row, col, dir);
    };
    
    /**
     * Default values for MathArray data
     */
    MathArray.prototype.defaults = {
        type: 'matharray',
        metadata: {
            creator: '',
            created: '',
            modifier: '',
            modified: '',
            source: '',
            license: '',
            notes: ''
        },
        data: {
            eqnarray: []
        },
        settings: {
            uilang: 'en-US',
            mode: 'view',
            username: 'Anonymous'
        }
    }
    
    MathArray.prototype.styles = [
        '.matharray-table {margin: 0.5em 1em;}',
        '.matharray-table .matharray-row td {vertical-align: middle;}',
        '.matharray[data-elementmode$="view"] .matharray-table .matharray-row td {padding: 0.2em 0.3em;}',
        '.matharray[data-elementmode="edit"] .matharray-table .matharray-row td {padding: 0 0.3em;}',
        '.matharray-table td.matharray-left {text-align: right;}',
        '.matharray-table td.matharray-middle {text-align: center;}',
        '.matharray-table td.matharray-right {text-align: left; padding-right: 2em;}',
        '.matharray-table td.matharray-description {border-left: 3px double #666; vertical-align: top;}',
        '.matharray[data-elementmode$="view"] .matharray-table td.matharray-description.matharray-empty {border-left: 3px double transparent;}',
        '.matharray[data-elementmode$="view"] .matharray-table td.matharray-right {padding-right: 2em;}',
        '.matharray[data-elementmode$="view"] .matharray-table td.matharray-description {padding-left: 1em;}',
        '.matharray[data-elementmode="edit"] .matharray-table .matharray-field-left {min-width: 3em;}',
        '.matharray[data-elementmode="edit"] .matharray-table .matharray-field-right {min-width: 3em;}',
        '.matharray[data-elementmode="edit"] .matharray-table .matharray-field-middle {min-width: 1em;}',
        '.matharray[data-elementmode="edit"] .matharray-table .matharray-textfield {min-width: 6em;}',
        // Mathquill
        '.matharray-table .mq-editable-field {display: block; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 2px; padding: 0.2em 0.3em; box-shadow: inset 1px 1px 1px rgba(0,0,0,0.2), inset -1px -1px 1px rgba(255,255,255,0.5);}',
        '.matharray-table .mq-editable-field.mq-focused {border-radius: 2px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.5), rgba(136,187,221, 0.5) 0 0 1px 2px, inset rgba(102,170,238, 0.7) 0 0 2px 0;}',
        '.matharray-table .mq-editable-field.mq-text-mode .mq-root-block {white-space: normal;}',
        '.matharray-table .mq-editable-field.mq-text-mode::after {display: none;}',
        '.matharray-table .mq-editable-field.mq-text-mode .mq-math-mode {background: rgba(136,187,221,0.2);}',
        '.matharray[data-elementmode="edit"] .matharray-table .mq-text-mode .mq-cursor {border-color: red; box-shadow: 0 0 0 0.5px red;}',
        '.matharray[data-elementmode="edit"] .matharray-table .mq-math-mode .mq-cursor {border-color: blue; box-shadow: 0 0 0 0.5px blue;}',
        '.matharray[data-elementmode="edit"] .matharray-table .mq-math-mode.mq-empty {height: 1em; width: 0.5em; display: inline-block; vertical-align: bottom;}'
    ].join('\n');
    
    /**
     * @class Marray
     * @description Class that models the matharray as a data structure.
     * @constructor
     * @param {jQuery} mabody   The tbody of matharray as jQuery-object
     * @param {Object} options  The data for matharray
     */
    var Marray = function(mabody, options) {
        this.mabody = mabody;
        options = $.extend(true, {}, Marray.defaults, options);
        this.eqnarray = [];
        this.rows = [];
        for (var i = 0, len = options.eqnarray.length; i < len; i++) {
            this.addRow(options.eqnarray[i]);
        };
        if (this.eqnarray.length === 0) {
            this.addRow()
        };
    };
    
    /**
     * Add a new row
     * @param {Object} [rowdata]  Data of the row. If not given, an empty row is added.
     * @param {Number} [index]  Optional index, where to add the row. If not given, add to the end.
     */
    Marray.prototype.addRow = function(rowdata, index) {
        if (typeof(index) === 'undefined') {
            index = this.eqnarray.length;
        };
        var rowelem = $('<tr class="matharray-row"></tr>');
        this.rows.splice(index, 0, rowelem);
        if (index === 0) {
            this.mabody.prepend(rowelem);
        } else {
            this.mabody.children('tr.matharray-row').eq(index - 1).after(rowelem);
        };
        var newrow = new Mrow(rowelem, rowdata);
        this.eqnarray.splice(index, 0, newrow);
        if (this.drawmode) {
            newrow.draw(this.drawmode);
        };
    };
    
    /**
     * Remove row in given index
     * @param {Number} index   Index of the row to remove
     */
    Marray.prototype.removeRow = function(index) {
        if (this.eqnarray.length > 1 && index > -1 && index < this.eqnarray.length) {
            var rowelem = this.rows[index];
            rowelem.remove();
            this.rows.splice(index, 1);
            this.eqnarray.splice(index, 1);
        }
    }
    
    /**
     * Set focus to asked field
     * @param {Number} row     Index of the row
     * @param {String} col     Column name
     * @param {Number} dir     Direction, on which end to put the focus (MQ.L | MQ.R)
     */
    Marray.prototype.setFocus = function(row, col, dir) {
        if (row > -1 && row < this.eqnarray.length) {
            this.eqnarray[row].setFocus(col, dir);
        }
    };
    
    /**
     * Get the number of rows
     * @returns {Number} The number of rows
     */
    Marray.prototype.count = function() {
        return this.eqnarray.length;
    };
    
    /**
     * Get data of the Marray
     * @returns {Object} the data of the Marray
     */
    Marray.prototype.getData = function() {
        var result = {
            eqnarray: []
        };
        for (var i = 0, len = this.eqnarray.length; i < len; i++) {
            result.eqnarray.push(this.eqnarray[i].getData());
        };
        return result;
    };
    
    /**
     * Get the data of one row
     * @param {Number} index   The index of the row
     * @returns {Object} the data of the asked row
     */
    Marray.prototype.getRowData = function(index) {
        return this.eqnarray[index].getData();
    };
    
    /**
     * Draw the matharray
     * @param {String} drawmode   The drawing mode ('view'|'edit')
     */
    Marray.prototype.draw = function(drawmode) {
        if (drawmode === 'view' || drawmode === 'edit') {
            this.drawmode = drawmode;
            for (var i = 0, len = this.eqnarray.length; i < len; i++) {
                this.eqnarray[i].draw(this.drawmode);
            };
        };
    };
    
    /**
     * Default data for Marray
     */
    Marray.prototype.defaults = {
        eqnarray: []
    }
    
    /**
     * @class Mrow
     * @description Class that models a row of matharray as data structure
     * @constructor
     * @param {jQuery} rowelem   The jQuery-object of the row
     * @param {Object} options   The data of the row
     */
    var Mrow = function(rowelem, options) {
        this.rowelem = rowelem;
        options = $.extend(true, {}, this.defaults, options);
        this.left = options.left;
        this.middle = options.middle;
        this.right = options.right;
        this.description = options.description;
    }
    
    /**
     * Get data of the row
     * @returns {Object} data of the row
     */
    Mrow.prototype.getData = function() {
        result = {
            left: this.left,
            middle: this.middle,
            right: this.right,
            description: this.description
        };
        return result;
    };
    
    /**
     * Set data of the given column on the row
     * @param {String} colkey   The key of the column
     * @param {String} value    The value of the column
     */
    Mrow.prototype.setDataCol = function(colkey, value) {
        if (value !== this[colkey] && !this.silentChange) {
            this[colkey] = value;
            this.rowelem.trigger('datachanged');
        }
    }
    
    /**
     * Set focus to asked field
     * @param {String} col     Column name
     * @param {Number} dir     Direction, on which end to put the focus (MQ.L | MQ.R)
     */
    Mrow.prototype.setFocus = function(col, dir) {
        var field = this.fields[col];
        if (field) {
            field.focus();
            if (dir) {
                field.moveToDirEnd(dir);
            };
        };
    };
    
    /**
     * Move focus to the next field
     * @param {String} colkey   The name of current column
     */
    Mrow.prototype.nextField = function(colkey) {
        switch (colkey) {
            case 'left':
                this.fields.left.blur();
                this.fields.middle.focus().moveToLeftEnd();
                break;
            case 'middle':
                this.fields.middle.blur();
                this.fields.right.focus().moveToLeftEnd();
                break;
            case 'right':
                this.fields.right.blur();
                this.fields.description.focus().moveToLeftEnd();
                break;
            case 'description':
                $(this.fields.description.el()).trigger('gotonextfield');
                break;
            default:
                break;
        };
    };
    
    /**
     * Move focus to the previous field
     * @param {String} colkey   The name of current column
     */
    Mrow.prototype.prevField = function(colkey) {
        switch (colkey) {
            case 'left':
                $(this.fields.left.el()).trigger('gotoprevfield');
                break;                
            case 'middle':
                this.fields.middle.blur();
                this.fields.left.focus().moveToRightEnd();
                break;
            case 'right':
                this.fields.right.blur();
                this.fields.middle.focus().moveToRightEnd();
                break;
            case 'description':
                this.fields.description.blur();
                this.fields.right.focus().moveToRightEnd();
                break;
            default:
                break;
        };
    };
    
    /**
     * Draw the row
     * @param {String} drawmode   The drawing mode ('view'|'edit')
     */
    Mrow.prototype.draw = function(drawmode) {
        if (drawmode !== 'view' && drawmode !== 'edit') {
            drawmode = this.drawmode || 'view'
        };
        var selfrow = this;
        this.drawmode = drawmode;
        this.rowelem.empty();
        this.fields = {};
        var cols = ['left', 'middle', 'right'];
        var colkey, isempty, tdelem, field;
        for (var i = 0; i < 3; i++) {
            colkey = cols[i];
            isempty = this[colkey] === '';
            tdelem = $('<td class="matharray-' + colkey + '"><span class="matharray-mathfield matharray-field-' + colkey + (isempty ? ' matharray-empty' : '') + '" data-colkey="'+ colkey +'"></span></td>');
            this.rowelem.append(tdelem);
            field = tdelem.find('.matharray-field-' + colkey)
            field.text(this[colkey]);
            if (this.drawmode === 'edit') {
                this.fields[colkey] = MQ.MathField(field[0], {
                    handlers: {
                        edit: function(mathField) {
                            var elem = $(mathField.el());
                            var colkey = elem.attr('data-colkey');
                            var value = mathField.latex();
                            selfrow.setDataCol(colkey, value);
                        },
                        moveOutOf: function(dir, mathField) {
                            var elem = $(mathField.el());
                            var colkey = elem.attr('data-colkey');
                            if (dir === MQ.R) {
                                selfrow.nextField(colkey);
                            } else {
                                selfrow.prevField(colkey);
                            }
                        },
                        upOutOf: function(mathField) {
                            $(mathField.el()).trigger('gotoprevrow');
                        },
                        downOutOf: function(mathField) {
                            $(mathField.el()).trigger('gotonextrow');
                        }
                    }
                });
            } else {
                this.fields[colkey] = MQ.StaticMath(field[0]);
            };
        };
        isempty = this.description === '';
        tdelem = $('<td class="matharray-description' + (isempty ? ' matharray-empty' : '') + '"><span class="matharray-textfield matharray-field-description" data-colkey="description"></span></td>');
        this.rowelem.append(tdelem);
        field = tdelem.find('.matharray-field-description');
        // Remember the description. Otherwise edit handler overwrites it
        // during typedText()
        var description = this.description;
        if (this.drawmode === 'edit') {
            this.silentChange = true; // Don't trigger 'datachanged' on textfield creation and each inserted letter!
            this.fields.description = MQ.TextField(field[0], {
                handlers: {
                    edit: function(textField) {
                        if (!selfrow.silentChange) {
                            var value = textField.latex();
                            selfrow.setDataCol('description', value);
                        };
                    },
                    moveOutOf: function(dir, textField) {
                        if (dir === MQ.R) {
                            selfrow.nextField('description');
                        } else {
                            selfrow.prevField('description');
                        }
                    }
                }
            });
//            this.fields.description.typedText(description).blur();
            var mathmode = false;
            var descarr = description.split('$');
            for (var i = 0, len = descarr.length; i < len; i++) {
                if (mathmode) {
                    this.fields.description.typedText('$');
                    this.fields.description.write(descarr[i]);
                    this.fields.description.keystroke('Right');
                } else {
                    for (var j = 0, jlen = descarr[i].length; j < jlen; j++) {
                        this.fields.description.typedText(descarr[i][j]);
                    };
                };
                mathmode = !mathmode;
            };
            this.fields.description.blur();
            this.silentChange = false; // Start tracking edit events again.
        } else {
            this.fields.description = field;
            field.html(this.description.replace(/\$([^$]*)\$/g, '<span class="matharray-mathfield">$1</span>'));
            var maths = field.find('.matharray-mathfield');
            for (var i = 0, len = maths.length; i < len; i++) {
                MQ.StaticMath(maths[i]);
            };
        };
    };
    
    /**
     * Get the html of the row
     * @param {String} [mode] the mode of the row
     * @returns {String} the html row
     */
    Mrow.prototype.getHtml = function(mode) {
        mode = mode || 'view';
        var description = this.description;
        if (mode === 'view') {
            description = description.replace(/\$([^$]*)\$/g, '<span class="matharray-mathfield">$1</span>');
        };
        var row = [
            '<tr class="matharray-row">',
            '<td class="matharray-left"><span class="matharray-mathfield">' + this.left + '</span></td>',
            '<td class="matharray-middle"><span class="matharray-mathfield">' + this.middle + '</span></td>',
            '<td class="matharray-right"><span class="matharray-mathfield">' + this.right + '</span></td>',
            '<td class="matharray-description"><span class="matharray-textfield">' + description + '</span></td>',
            '</tr>'
        ].join('\n');
        return row;
    };
    
    /**
     * Default data for Mrow
     */
    Mrow.prototype.defaults = {
        left: '',
        middle: '',
        right: '',
        description: ''
    }
    
    /**
     * jQuery plugin for MathArray
     */
    var mamethods = {
        init: function(options) {
            return this.each(function() {
                var element = new MathArray(this, options);
            })
        },
        
        destroy: function(options) {
            return this.each(function() {
                $(this).trigger('destroy');
            })
        }
    };
    
    $.fn[PLUGIN_NAME] = function(options) {
        if (!options || typeof(options) === 'object') {
            return mamethods.init.call(this, options);
        } else if (mamethods[options]) {
            var args = Array.prototype.slice.call(arguments, 1);
            return mamethods[options].apply(this, args);
        } else {
            $.error('Method ' + options + ' doesn\'t exist for ' + PLUGIN_NAME + ' plugin.' );
        }
    }
    
})(window, jQuery);