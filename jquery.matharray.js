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
        autoCommands: 'pi theta alpha beta gamma delta sqrt sum',
        autoOperatorNames: 'sin cos tan arcsin arccos arctan log ln'
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
    };
    
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
            .attr('data-elementid', this.id);
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
        this.marray = new Marray(this.data);
    }
    
    /**
     * Show matharray in view mode
     */
    MathArray.prototype.view = function(){
        var html = this.marray.getHtml('view');
        this.place.html(html);
        var maths = this.place.find('.matharray-mathfield');
        for (let i = 0, len = maths.length; i < len; i++) {
            MQ.StaticMath(maths[i]);
        };
    };
    
    /**
     * Show matharray in edit mode
     */
    MathArray.prototype.edit = function(){
        var html = this.marray.getHtml('edit');
        this.place.html(html);
        var maths = this.place.find('.matharray-mathfield');
        for (let i = 0, len = maths.length; i < len; i++) {
            MQ.MathField(maths[i]);
        };
        var texts = this.place.find('.matharray-textfield');
        for (let i = 0, len = texts.length; i < len; i++) {
            MQ.TextField(texts[i]);
        };
    }
    
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
        // Mathquill
        '.matharray-table .mq-editable-field {display: block; border: 1px solid transparent; border-radius: 5px; padding: 0.2em 0.3em; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.5);}',
        '.matharray-table .mq-editable-field.mq-focused {border-radius: 5px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.5), #8bd 0 0 1px 2px, inset #6ae 0 0 2px 0;}',
        '.matharray-table .mq-editable-field.mq-text-mode .mq-root-block {white-space: normal;}',
        '.matharray-table .mq-editable-field.mq-text-mode::after {display: none;}',
        '.matharray-table .mq-editable-field.mq-text-mode .mq-math-mode {background: rgba(136,187,221,0.2);}'
    ].join('\n');
    
    /**
     * @class Marray
     * @description Class that models the matharray as a data structure.
     * @constructor
     */
    var Marray = function(options) {
        options = $.extend(true, {}, Marray.defaults, options);
        this.eqnarray = [];
        for (let i = 0, len = options.eqnarray.length; i < len; i++) {
            this.addRow(options.eqnarray[i]);
        };
        if (this.eqnarray.length === 0) {
            this.eqnarray.addRow()
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
        this.eqnarray.splice(index, 0, (new Mrow(rowdata)));
    };
    
    /**
     * Get data of the Marray
     * @returns {Object} the data of the Marray
     */
    Marray.prototype.getData = function() {
        var result = {
            eqnarray: []
        };
        for (let i = 0, len = this.eqnarray.length; i < len; i++) {
            result.eqnarray.push(this.eqnarray[i].getData());
        };
        return result;
    };
    
    /**
     * Get the html of Marray
     * @param {String} [mode] The mode to show. (Default 'view')
     * @returns {String} html of the whole Marray as a table.
     */
    Marray.prototype.getHtml = function(mode) {
        mode = mode || 'view';
        var html = ['<table class="matharray-table">', '<tbody>'];
        for (let i = 0, len = this.eqnarray.length; i < len; i++) {
            html.push(this.getRowHtml(i, mode));
        };
        html.push('</tbody>', '</table>');
        return html.join('\n');
    };
    
    /**
     * Get the html of a single row in Marray
     * @param {Number} index  the index of the row
     * @param {String} [mode] the mode to show. (Default 'view')
     * @returns {String} the html of asked row.
     */
    Marray.prototype.getRowHtml = function(index, mode) {
        mode = mode || 'view';
        var html = '';
        if (typeof(index) === 'number' && index > -1 && index < this.eqnarray.length) {
            html = this.eqnarray[index].getHtml(mode);
        };
        return html;
    }
    
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
     */
    var Mrow = function(options) {
        options = $.extend(true, {}, Mrow.defaults, options);
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
            right: this.middle,
            description: this.description
        };
        return result;
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